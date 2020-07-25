module.exports = {
  details: {
    BTC: {'all-time-high': 20089.0},
  },
  server: {
    access: {
      ipWhitelist: [],
    },
    elasticsearch: {
      disabled: true,
    },
    port: 3000,
  },
  wallet: {
    BTC: [
      {
        basisUsd: 10000,
        date: '2020-07-22T00:00:00.000Z',
        quantity: 1,
      },
    ],
  },
};
