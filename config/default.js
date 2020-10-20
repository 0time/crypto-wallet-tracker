module.exports = {
  db: {
    host: 'localhost',
    port: 5432,
  },
  logger: {
    levels: ['log', 'info', 'error', 'warn', 'debug', 'trace'],
    logLineNumbers: true,
  },
  proxy: false,
  server: {
    options: {
      port: 3000,
    },
  },
  source: {
    minDebounceTimeMs: 300000,
    header: 'X-CMC_PRO_API_KEY',
    key: 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c',
    pageSize: 100,
    model: 'coinmarketcap-api',
    url: 'https://sandbox-api.coinmarketcap.com',
  },
};
