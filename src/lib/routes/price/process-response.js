/*
BTC: {
  name: 'Bitcoin',
  symbol: 'BTC',
  slug: 'bitcoin',
  max_supply: 21000000,
  circulating_supply: 17906012,
  total_supply: 17906012,
  last_updated: '2019-08-30T18:51:28.000Z',
  quote: {
    USD: {
      price: 9558.55163723,
      volume_24h: 13728947008.2722,
      percent_change_1h: -0.127291,
      percent_change_24h: 0.328918,
      percent_change_7d: -8.00576,
      market_cap: 171155540318.86005,
      last_updated: '2019-08-30T18:51:28.000Z'
    }
  }
},
*/

const { get, set } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_DB_MODELS },
} = require('../../constants');

module.exports = (context) => (response) => {
  const data = get(response, 'data.data');
  const quotes = get(context, `${RUNTIME_DB_MODELS}.quotes`);

  const getMappedData = (quote) => {
    const rawData = Object.assign({}, quote, get(quote, 'quote.USD'));

    const fieldNameMap = {
      name: 'name',
      symbol: 'symbol',
      slug: 'slug',
      max_supply: 'maxSupply',
      circulating_supply: 'circulatingSupply',
      total_supply: 'totalSupply',
      last_updated: 'lastUpdated',
      price: 'price',
      volume_24h: 'volume24h',
      percent_change_1h: 'percentChange1h',
      percent_change_24h: 'percentChange24h',
      percent_change_7d: 'percentChange7d',
      timestamp: 'timestamp',
      market_cap: 'marketCap',
    };

    rawData.timestamp = get(quote, 'quote.USD.last_updated');

    return Object.keys(rawData).reduce(
      (acc, key) =>
        fieldNameMap[key] ? set(acc, fieldNameMap[key], rawData[key]) : acc,
      {},
    );
  };

  return quotes.putMany(
    Object.keys(data).reduce(
      (acc, symbol) => acc.concat(getMappedData(data[symbol])),
      [],
    ),
    { ignore: true },
  );
};
