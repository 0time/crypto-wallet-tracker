/* eslint-disable */

const Promise = require('bluebird');
const $ = require('cheerio');
const fs = require('fs');
const fse = require('fs-extra');
const { get, has, isNaN, isNumber } = require('lodash');
const path = require('path');

const basis = require('./basis');
const config = require('config');
const sumOfField = require('./sum-of-field');
const uploadElasticsearch = require('./upload-elasticsearch');

const readFileP = (file) =>
  new Promise((resolve, reject) =>
    fs.readFile(file, (err, data) => (err ? reject(err) : resolve(data))),
  );

const OWNERSHIP_INDEX_FACTOR = 1000000.0;

const maxSupply = {
  BTC: 21000000,
  BCH: 21000000,
  DASH: 18900000,
  ETH: 109094283,
  NANO: 133248297,
};

const calculateOwnershipIndex = ({ held, marketCap, symbol, valueUsd }) =>
  has(maxSupply, symbol)
    ? ((held / get(maxSupply, symbol)) * OWNERSHIP_INDEX_FACTOR).toFixed(4)
    : ((OWNERSHIP_INDEX_FACTOR / marketCap) * valueUsd).toFixed(4);

const { wallet } = config;

const invNum = /[^+0-9\.e]/g;

const parseTr = (_, ele) => {
  const symbolRow = $(ele).children()[5];
  const symbol = $(symbolRow)
    .text()
    .replace(/[^A-Za-z]/g, '');

  const marketCapRow = $(ele).children()[2];
  const marketCapStr = $(marketCapRow).text();
  const marketCap = Number.parseFloat(marketCapStr.replace(invNum, ''));

  const priceUsdRow = $(ele).children()[3];
  const priceUsdLink = $(priceUsdRow).children()[0];
  const priceUsd = $(priceUsdLink).text().replace(invNum, '');

  const percentChangeRow = $(ele).children()[6];
  const percentChangeDiv = $(percentChangeRow).children()[0];
  const percentChange = $(percentChangeDiv).text();

  const priceBtcStr = 0;
  //const basisUsd = get(wallet, symbol, []).reduce(sumOfField('basisUsd'), 0.0);
  const basisUsd = basis(get(wallet, symbol, []));
  const priceBtc = Number.parseFloat(priceBtcStr);
  const priceFloat = Number.parseFloat(priceUsd);
  const held = get(wallet, symbol, []).reduce(sumOfField('quantity'), 0.0);
  const valueUsd = priceFloat * held;

  if (held > 0) {
    //console.error(58, `${symbol} ${marketCapStr} ${priceUsd} ${percentChange}`);
  }

  return {
    basisUsd,
    held,
    marketCap,
    percentChange,
    priceBtc,
    priceUsd: priceFloat,
    symbol,
    valueBtc: priceBtc * held,
    valueUsd,
  };
};

let saveHtml = null;

const main = async (argsObj) => {
  const html = await readFileP(argsObj.file);
  saveHtml = html;

  const set = Object.keys(wallet);

  const held = get(config, `holdings.USD`, 0);
  const priceFloat = 1;
  const valueUsd = held * priceFloat;

  const usdItem = {
    held,
    marketCap: 1000 * 1000 * 1000 * 1000 * 1000,
    percentChange: '0',
    priceBtc: 0,
    priceFloat,
    priceUsd: 1,
    symbol: 'USD',
    valueBtc: 0,
    valueUsd,
  };

  const trs = $.load(html)('.cmc-table__table-wrapper-outer')
    .find('tbody')
    .find('tr');
  const parsed = trs.map(parseTr).get();
  const priceBtcUsd = parsed.find(({ symbol }) => symbol === 'BTC').priceUsd;

  //console.error(103, priceBtcUsd);

  return parsed
    .concat([usdItem])
    .filter(({ symbol }) => set.includes(symbol))
    .map((ea) => {
      const priceBtc = ea.priceUsd / priceBtcUsd;

      return Object.assign({}, ea, {
        priceBtc,
        valueBtc: priceBtc * ea.held,
      });
    });
};

const formatForStderr = (results) =>
  results
    .map(
      ({ percentChange, priceUsd, symbol }) =>
        `${symbol}: ${priceUsd} (${percentChange})`,
    )
    .join('\n');

const v = (x) => (y) => {
  // Comment me to make verbose
  return y;

  return l(x)(y);
};

const l = (x) => (y) => {
  console.error(x);
  console.error(y);

  return y;
};

const parseAndFix = (data, fix) => Number.parseFloat(data).toFixed(fix);

const newEle = (tag) => (value, htmlClass = 'noclass') =>
  `<${tag} class="${htmlClass}">${value}</${tag}>`;

const newColorFloatSpan = (value, htmlClass = 'noclass', spacing = true) =>
  newEle('span')(
    value,
    `${htmlClass} ${value.startsWith('-') ? 'negative' : 'positive'}-number`,
  );

const newDollarsFloatSpan = (value, htmlClass = 'noclass') =>
  newEle('span')(
    value >= 0 ? `$${Math.abs(value)}` : `($${Math.abs(value)})`,
    `${htmlClass} ${value < 0 ? 'negative' : 'positive'}-number`,
  );

const newSpan = newEle('span');
const newDiv = newEle('div');
const newTable = newEle('table');
const newThead = newEle('thead');
const newTr = newEle('tr');
const newTh = newEle('th');
const newTbody = newEle('tbody');
const newTd = newEle('td');

const make4 = (x) =>
  x.length === 2 ? `&nbsp;&nbsp;${x}` : x.length === 3 ? `&nbsp;${x}` : x;

const buildDiv = (data) =>
  data
    .map(({ symbol, priceUsd, percentChange, valueUsd }) =>
      newDiv(
        [
          newDiv(make4(symbol), 'symbol'),
          newColorFloatSpan(percentChange, 'percent-change'),
          ' || ',
          newSpan(parseAndFix(priceUsd, 2), 'price'),
          ' || ',
          newSpan(priceUsd, 'price-full'),
          ' || ',
          newSpan(valueUsd, 'account-value'),
        ].join('\n'),
        'data',
      ),
    )
    .concat([
      'Total: $',
      newDiv(
        [
          newSpan(data.reduce(sumOfField('valueUsd'), 0.0).toFixed(2), 'total'),
        ].join(''),
        'totals',
      ),
    ])
    .join('\n');

const ensureNumber = (x) => (isNumber(x) ? x : Number.parseFloat(x));

const calculateProfitLoss = ({ basisUsd, valueUsd }) => {
  const profitLoss = 100 * (valueUsd / basisUsd - 1);

  return isNaN(profitLoss) ? 0 : profitLoss;
};

const calculateProfitLossDollars = ({ percentChange, valueUsd }) =>
  valueUsd - valueUsd / (1 + ensureNumber(percentChange) / 100);

const summarize = (data) => {
  const heldUsd = get(config, 'holdings.USD', 0);
  const basisUsd = data.reduce(sumOfField('basisUsd'), 0.0) + heldUsd;
  const totalBtc = data.reduce(sumOfField('valueBtc'), 0.0);
  const totalUsd = data.reduce(sumOfField('valueUsd'), 0.0);
  const athTotalUsd = data.reduce(
    (acc, ea) =>
      acc + getATH(get(ea, 'symbol', undefined), 0) * get(ea, 'held', 0),
    0.0,
  );
  const todayGainDollars = data.reduce(
    (acc, ea) => acc + calculateProfitLossDollars(ea),
    0.0,
  );
  const startUsd = totalUsd - todayGainDollars;
  const todayGainPercent = (100 * todayGainDollars) / startUsd;

  return newDiv(
    [
      newDiv(newSpan(`$${totalUsd.toFixed(2)}`), 'total'),
      newDiv(newSpan(`${totalBtc.toFixed(2)} BTC`), 'total'),
      newDiv(
        [
          newSpan(`Overall: (${basisUsd.toFixed(2)}): `),
          newDollarsFloatSpan((totalUsd - basisUsd).toFixed(2)),
          newSpan(' '),
          newColorFloatSpan(
            `${calculateProfitLoss({
              basisUsd,
              valueUsd: totalUsd,
            }).toFixed(2)}%`,
          ),
        ].join(''),
        'profit-over-basis',
      ),
      newDiv(
        [
          newSpan(`Daily: (${startUsd.toFixed(2)}) `),
          newDollarsFloatSpan(todayGainDollars.toFixed(2)),
          newSpan(' '),
          newColorFloatSpan(`${todayGainPercent.toFixed(2)}%`),
        ].join(''),
      ),
      newDiv(
        [
          newSpan(`ATH Equivalent: `),
          newDollarsFloatSpan(athTotalUsd.toFixed(2)),
        ].join(''),
        'ath-equivalent',
      ),
    ].join(''),
    'totals',
  );
};

const buildTable = (data) =>
  newTable(
    [
      newThead(
        [
          newTr(
            [
              newTh(newSpan('Symbol')),
              newTh(newSpan('Held')),
              newTh(newSpan('USD Value')),
              newTh(newSpan('BTC Value')),
              newTh(newSpan('Profit/Loss (%)')),
              newTh(newSpan('Profit/Loss ($)')),
              newTh(newSpan('Change (%)')),
              newTh(newSpan('Change ($)')),
              newTh(newSpan('USD (ea.)')),
              newTh(newSpan('BTC (ea.)')),
              newTh(newSpan('Own Index')),
              newTh(newSpan('ATH Index')),
              newTh(newSpan('ATH Adj Value')),
            ].join('\n'),
          ),
        ].join('\n'),
      ),
      newTbody(buildTbody(data)),
    ].join('\n'),
  );

const getATH = (symbol, def = '-') =>
  get(config, `details.${symbol}.all-time-high`, def);

const getATHIndex = ({ symbol, priceUsd }) => {
  const ath = getATH(symbol);

  if (!isNumber(ath)) {
    return ath;
  }

  return (priceUsd / ath) * 100;
};

const getATHValue = ({ held, symbol }) => {
  const ath = getATH(symbol);

  if (!isNumber(ath)) {
    return ath;
  }

  return ath * held;
};

const fixIfNumber = (inp, toFixedArg) =>
  isNumber(inp) ? inp.toFixed(toFixedArg) : inp;

const newATHIndex = (inp) =>
  newTd(newSpan(fixIfNumber(getATHIndex(inp), 2), 'price-full'));
const newATHValue = (inp) =>
  newTd(newColorFloatSpan(fixIfNumber(getATHValue(inp), 0)), 'profit-loss');

const buildTbody = (data) =>
  data
    .map(
      ({
        basisUsd,
        held,
        marketCap,
        percentChange,
        priceBtc,
        priceUsd,
        symbol,
        totalUsd,
        valueBtc,
        valueUsd,
      }) =>
        newTr(
          [
            newTd(newDiv(symbol, 'symbol')),
            newTd(newSpan(held.toFixed(2), 'price-full')),
            newTd(newSpan(`$${parseAndFix(valueUsd, 2)}`, 'price-full')),
            newTd(newSpan(`${parseAndFix(valueBtc, 2)}`, 'price-full')),
            newTd(
              newColorFloatSpan(
                `${calculateProfitLoss({ basisUsd, valueUsd }).toFixed(2)}%`,
              ),
              'profit-loss',
            ),
            newTd(
              newDollarsFloatSpan(
                calculateProfitLossDollars({
                  basisUsd,
                  percentChange: calculateProfitLoss({ basisUsd, valueUsd }),
                  valueUsd,
                }).toFixed(2),
              ),
              'profit-loss',
            ),
            newTd(newColorFloatSpan(percentChange, 'percent-change')),
            newTd(
              newDollarsFloatSpan(
                calculateProfitLossDollars({
                  percentChange,
                  symbol,
                  valueUsd,
                }).toFixed(2),
                'price-change',
              ),
            ),
            newTd(newSpan(`$${parseAndFix(priceUsd, 2)}`, 'price-full')),
            newTd(newSpan(`${parseAndFix(priceBtc, 4)}`, 'price-full')),
            newTd(
              newSpan(
                calculateOwnershipIndex({ held, marketCap, symbol, valueUsd }),
                'price-full',
              ),
            ),
            newATHIndex({ priceUsd, symbol }),
            newATHValue({ held, symbol }),
          ].join('\n'),
        ),
    )
    .join('\n');

const dateString = (obj, selector, def) =>
  get(obj, selector, null) ? `${get(obj, selector).toUTCString()}` : def;

const writeIndexHtml = (info) => (data) =>
  Promise.resolve(
    `
<html>
  <head id="head">
    <link rel="stylesheet" type="text/css" href="index.css">
    <meta http-equiv="refresh" content="${
      0.001 * (get(info, 'nextTime', 0) - get(info, 'createdAt', 0))
    }">
    <title>CRYPTO!</title>
  </head>
  <body>
    <div class="item html">
    <!--
      <h2 id="h2-timer">0</h2>
      <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <svg width="160" height="160" xmlns="http://www.w3.org/2000/svg">
       <g>
        <title>Layer 1</title>
        <circle id="circle" class="circle_animation" r="69.85699" cy="81" cx="81" stroke-width="8" stroke="#6fdb6f" fill="none"/>
       </g>
      </svg>
      -->
    </div>
    <form onsubmit="return formSubmit()">
      <button type="submit">Update</button>
    </form>
    <div style="display: none" id="created-at">
      ${dateString(info, 'createdAt', 0)}
    </div>
    <div style="display: none" id="next-time">
      ${dateString(info, 'nextTime', 0)}
    </div>
    <div id="timer"></div>
    <script type="text/javascript" src="jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="reload-logic.js"></script>
    ${summarize(data)}
    ${buildTable(data)}
  </body>
</html>`,
  ).then((data) => fse.writeFile('static/index.html', data));
/*
    ${buildDiv(data)}
    <pre>
      ${JSON.stringify(data, null, 2)}
    </pre>
    */

module.exports = (context) => (args) =>
  Promise.try(() => main(args))
    .tap((data) =>
      Promise.resolve({
        data,
        date: new Date().toISOString(),
      }).then((value) =>
        !get(context, 'config.server.elasticsearch.disabled', true)
          ? uploadElasticsearch(context)(value).catch((err) => {
              context.logger.error(err);

              return fse.writeFile(
                path.resolve('historical', `${value.date}.json`),
                JSON.stringify(value),
              );
            })
          : null,
      ),
    )
    .tap(writeIndexHtml(args))
    .then(formatForStderr)
    .then(v('Prices:'))
    .catch((err) => {
      if (saveHtml !== null) {
        fs.writeFileSync(path.resolve('./last.cmc.html'), saveHtml, 'utf8');
      }

      if (get(err, 'response.statusCode') || get(err, 'statusCode')) {
        if (saveHtml === null) {
          fs.writeFileSync(
            path.resolve('./error.cmc.html'),
            response.body,
            'utf8',
          );
        }

        context.logger.error({
          statusCode: get(err, 'response.statusCode', get(err, 'statusCode')),
        });
      } else {
        context.logger.error(err);
      }
    });
/*
  Promise.resolve(args)
    .tap(v(41))
    .then(x => x.slice(2))
    .tap(v(43))
    .then(minimist)
    .tap(v(45))
    .then(main)
    .tap(v(47))
    .tap(writeIndexHtml)
    .then(formatForStderr)
    .then(l('Prices:'))
    .catch(console.error);
    */
