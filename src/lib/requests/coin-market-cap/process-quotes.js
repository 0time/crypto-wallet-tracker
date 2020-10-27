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
