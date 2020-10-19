/* global lib, wallet, settings */

let cryptoBaseUrl = null;
let cryptoData = null;
const cryptoPath = 'price';
let cryptoUpdaterEnabled = null;
const currentUsdValues = {};

// TODO: this should be stored in the DB somewhere and passed down with each request
const ath = {
  BCH: 4355.62,
  BTC: 20089.0,
  DASH: 1642.22,
  ETH: 1432.88,
  LTC: 375.29,
  NANO: 37.62,
  RVN: 0.080258,
  SC: 0.111708,
  XMR: 495.84,
};

const getCryptoUrl = () => `${cryptoBaseUrl ? cryptoBaseUrl : ''}${cryptoPath}`;

const getCryptoData = () => cryptoData;
const setCryptoData = (value) => (cryptoData = value);

const deleteCryptoTableRows = () => $('tr.dynamic-row').remove();

const calculateHeldUsd = (row) =>
  row && row.held >= 0 && row.price && (row['held-usd'] = row.held * row.price);

const calculateProfitLossUsd = (row) =>
  row &&
  row.basis &&
  row['held-usd'] &&
  (row['profit-loss-usd'] = row['held-usd'] - row.basis);

const calculateProfitLossPercent = (row) =>
  row &&
  row.basis &&
  row['held-usd'] &&
  row.basis !== 0 &&
  (row['profit-loss-percent'] = 100 * (row['held-usd'] / row.basis - 1));

const calculateBtcEach = (row) =>
  row &&
  row.price &&
  currentUsdValues['BTC'] &&
  (row['btc-value-each'] = row.price / currentUsdValues['BTC']);

const calculateBtcValue = (row) =>
  row &&
  row.held >= 0 &&
  row['btc-value-each'] &&
  (row['btc-value'] = row.held * row['btc-value-each']);

// 1 / (1 + delta24h) : oldPrice / newPrice => oldPrice = newPrice / (1 + delta24h) / 1
const calculatePrice24HoursAgo = (row) =>
  row &&
  row.price &&
  row.percentChange24h &&
  (row['price-24-hours-ago'] = row.price / (1 + row.percentChange24h / 100));

// change-usd = newPrice - oldPrice
const calculateChangeUsd = (row) =>
  row &&
  row.held >= 0 &&
  row.price &&
  row['price-24-hours-ago'] &&
  (row['change-usd'] = row.held * (row.price - row['price-24-hours-ago']));

const calculateChangePercent = (row) =>
  row && row.percentChange24h && (row['change-percent'] = row.percentChange24h);

const findBestSupply = (row) =>
  row &&
  (row.supply = row.maxSupply > 0 ? row.maxSupply : row.circulatingSupply);

const calculateOwnIndex = (row) =>
  row &&
  row.held >= 0 &&
  row.supply > 0 &&
  (row['own-index'] = 1000000 * ((1.0 * row.held) / row.supply));

const calculateAthIndex = (row) =>
  row &&
  row.held >= 0 &&
  row.ath &&
  (row['ath-index'] = (100 * row.price) / row.ath);

const calculateAthUsd = (row) =>
  row &&
  row.held >= 0 &&
  row.ath &&
  (row['ath-adjusted-usd'] = row.ath * row.held);

const addAggregateData = (row) => {
  // for sorting purposes
  // TODO: Remove this and fix the stupid sorting algorithm.
  row['held-usd'] = 0;
  row['profit-loss-usd'] = 0;
  row['profit-loss-percent'] = 0;
  row['btc-value'] = 0;

  [
    // TODO: Remove this ath helper
    (row) => row && row.symbol && !row.ath && (row.ath = ath[row.symbol]),
    calculateHeldUsd,
    calculateProfitLossUsd,
    calculateProfitLossPercent,
    calculateBtcEach,
    calculateBtcValue,
    calculatePrice24HoursAgo,
    calculateChangeUsd,
    calculateChangePercent,
    findBestSupply,
    calculateOwnIndex,
    calculateAthIndex,
    calculateAthUsd,
  ].reduce((acc, fn) => {
    fn(acc);

    return acc;
  }, row);

  console.info(row);

  return row;
};

const addCryptoTableRow = (row) => {
  $.each(
    $('tr.crypto-details-example')
      .clone()
      .appendTo('#crypto-details-tbody')
      .removeClass('crypto-details-example')
      .removeClass('hidden')
      .addClass('dynamic-row')
      .children('[data-field]'),
    function () {
      return fillDataFieldsItemProcessor($(this), row);
    },
  );

  return row;
};

const accumulateTotals = (acc, ea) => {
  if (!ea.basis) console.error(ea);

  return Object.assign({
    'totals-usd': lib.get(acc, 'totals-usd', 0) + lib.get(ea, 'held-usd', 0),
    'totals-basis-usd':
      lib.get(acc, 'totals-basis-usd', 0) + lib.get(ea, 'basis', 0),
    'totals-daily-profit':
      lib.get(acc, 'totals-daily-profit', 0) + lib.get(ea, 'change-usd', 0),
    'totals-daily-profit-basis':
      lib.get(acc, 'totals-daily-profit-basis', 0) +
      lib.get(ea, 'price-24-hours-ago', 0) * lib.get(ea, 'held', 0),
    'totals-oldest-timestamp': lib.min('\uffff')(
      lib.get(acc, 'totals-oldest-timestamp', '\uffff'),
      lib.get(ea, 'timestamp', '\uffff'),
    ),
    'totals-ath-equivalent':
      lib.get(acc, 'totals-ath-equivalent', 0) +
      lib.get(ea, 'ath-adjusted-usd', 0),
  });
};

const createCryptoTables = (data) => {
  deleteCryptoTableRows();

  const userWallet = wallet.interpretWallet();

  const totals = data
    .map((row) => {
      currentUsdValues[row.symbol] = row.price;

      return Object.assign({}, userWallet[row.symbol], row);
    })
    .map(addAggregateData)
    .sort(lib.sortOnField('held-usd', true))
    .map((row) => addCryptoTableRow(row))
    .reduce(accumulateTotals, {});

  /*
    total             $117463.46
    total             11.04 BTC
    profit-over-basis Overall: (93918.62)  $23544.84 (25.07%)
    ?                 Daily:   (116144.40) $1319.06  (1.14%)
    ATH Equiv         $2163476.83
  */

  if (currentUsdValues['BTC'] && totals['totals-usd']) {
    totals['totals-btc'] = totals['totals-usd'] / currentUsdValues['BTC'];
  }

  if (totals['totals-usd'] && totals['totals-basis-usd']) {
    totals['totals-profit-over-basis'] =
      totals['totals-usd'] - totals['totals-basis-usd'];
  }

  if (totals['totals-basis-usd'] && currentUsdValues['BTC']) {
    totals['totals-basis-btc'] =
      totals['totals-basis-usd'] / currentUsdValues['BTC'];
  }

  if (totals['totals-usd'] && totals['totals-basis-usd']) {
    totals['totals-profit-over-basis-percent'] =
      100 * (totals['totals-usd'] / totals['totals-basis-usd'] - 1);
  }

  // total-daily-profit-percent = 100 * ((total-yesterday + daily-profit) / total-yesterday - 1)
  // total-daily-profit-percent = 100 * (daily-profit / total-yesterday)
  if (totals['totals-daily-profit'] && totals['totals-daily-profit-basis']) {
    totals['totals-daily-profit-percent'] =
      100 *
      (totals['totals-daily-profit'] / totals['totals-daily-profit-basis']);
  }

  fillDataFields('.totals', totals);
  fillDataFields('.info-header', totals);
};

const fillDataFieldsItemProcessor = (ele, dataObj) => {
  const dataField = ele.attr('data-field');
  const dataOpAttr = ele.attr('data-op');
  const identity = (x) => x;
  const dataOp =
    dataOpAttr &&
    dataOpAttr
      .split(',')
      .map(
        (op) =>
          lib.dataOpMap[op] ||
          console.error(new Error(`${op} not found`)) ||
          identity,
      );
  const dataOpReducer = (inp) => dataOp.reduce((acc, op) => op(acc), inp);

  const data = lib.get(dataObj, dataField);

  if (data) {
    ele.text(dataOp ? dataOpReducer(data) : data);
  }
};

const fillDataFields = (selector, dataObj) =>
  $.each($(selector).find('[data-field]'), function () {
    return fillDataFieldsItemProcessor($(this), dataObj);
  });

let checkAutoUpdateInterval = null;

// TODO: Enable force update
// TODO: Store this and don't refresh on startup unless out of date
const getCrypto = (symbol, force) =>
  $.ajax(getCryptoUrl(), {
    data: lib.getQueryParameters({ symbol: symbol.join(',') }),
    dataType: 'json',
    error: console.error,
    statusCode: {
      200: (data) => {
        if (data) {
          setCryptoData(data);

          createCryptoTables(data);
        }
      },
    },
  });

const setCryptoAPIBase = (baseUrl) => (cryptoBaseUrl = baseUrl);

const setUpdater = (type) => {
  $('#debug-state').text(type);

  if (type === 'blur') {
    cryptoUpdaterEnabled = false;
  } else if (type === 'focus' || type === 'ready') {
    cryptoUpdaterEnabled = true;
  }
};

const canUpdate = () =>
  cryptoUpdaterEnabled &&
  lib
    .has(settings.getInteger('update-frequency-ms', 10000))
    .millisecondsElapsedSince(
      settings.getInteger('last-symbol-update-time', 0),
    );

const setUpdate = () => {
  if (canUpdate()) {
    settings.set('last-symbol-update-time', new Date().valueOf());

    return true;
  }

  return false;
};

const startInterval = () => {
  if (checkAutoUpdateInterval)
    throw new Error('tried to start interval, but it is already started');

  checkAutoUpdateInterval = setInterval(
    () => setUpdate() && getCrypto(wallet.getSymbols()),
    5000, // check once every 5 seconds
  );
};

const stopInterval = () => {
  if (!checkAutoUpdateInterval)
    throw new Error('tried to stop interval, but it is already stopped');

  clearInterval(checkAutoUpdateInterval);

  checkAutoUpdateInterval = null;
};

const toggleInterval = () =>
  checkAutoUpdateInterval ? stopInterval() : startInterval();

$(window).on('blur focus', function (e) {
  if ($(this).data('prevType') == e.type) {
    return;
  }

  $(this).data('prevType', e.type);

  setUpdater(e.type);
});

$(document).ready(() => {
  setUpdater('ready');

  wallet.loadWallet();

  getCrypto(wallet.getSymbols(), false);

  $('#update').click(() => getCrypto(wallet.getSymbols(), true));

  startInterval();

  $('#disable-interval').click(() => toggleInterval());
});

// eslint-disable-next-line no-unused-vars
const crypto = {
  getCryptoData,
  setCryptoData,
  setCryptoAPIBase,
};
