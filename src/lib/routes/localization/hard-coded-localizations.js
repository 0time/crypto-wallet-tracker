const values = {
  'en-SM': {
    ATH_INDEX: '\u2625',
    ATH_ADJUSTED_USD: '$\u2625',
    BASIS: '\u22B6',
    BTC_VALUE: '\u20BF',
    BTC_VALUE_EACH: '\u269B\u20BF',
    BUTTON_THEME_TOGGLE: '\u262A',
    BUTTON_UPDATE: '\u262F',
    BUTTON_WALLET_TOGGLE: '\u2699',
    CHANGE_BTC: '\u0394\u20BF',
    CHANGE_PERCENT: '\u0394%',
    CHANGE_USD: '$\u0394',
    HELD: '\u269B',
    HELD_CAP_SHORT: '\u2010',
    HELD_CAP_LONG: '\u2015',
    HELD_USD: '$',
    LABEL_TOTALS_ATH_EQUIVALENT: '\u26A1 \u2625',
    LABEL_TOTALS_BTC: '\u20BF',
    LABEL_TOTALS_DAILY_PROFIT: '\u231A \u22F0',
    LABEL_TOTALS_PROFIT_OVER_BASIS: '\u22F0 / \u22B6',
    LABEL_TOTALS_USD: '$',
    OWN_INDEX: '\u262D',
    PROFIT_LOSS_BTC: '\u22F0\u20BF',
    PROFIT_LOSS_PERCENT: '\u22F0%',
    PROFIT_LOSS_USD: '$\u22F0',
    SYMBOL: '\u2623',
    TH_TOTALS_FIELD_BASIS: '\u22B6',
    TH_TOTALS_FIELD_NAME: '\u26B7',
    TH_TOTALS_FIELD_PERCENT: '%',
    TH_TOTALS_FIELD_USD: '$',
    USD_VALUE: 'Val ($)',
    USD_VALUE_EACH: '$\u269B',
  },
  'en-US': {
    ATH_INDEX: 'ATH Index',
    ATH_ADJUSTED_USD: 'ATH ($)',
    BTC_VALUE: 'Val (\u20BF)',
    CHANGE_BTC: '\u0394 (\u20BF)',
    CHANGE_PERCENT: '\u0394 (%)',
    CHANGE_USD: '\u0394 ($)',
    HELD_USD: 'Bal ($)',
    OWN_INDEX: 'Own Index',
    PROFIT_LOSS_BTC: 'Profit/Loss (\u20BF)',
    PROFIT_LOSS_PERCENT: 'Profit/Loss (%)',
    PROFIT_LOSS_USD: 'Profit/Loss ($)',
    SYMBOL: 'Symbol',
    USD_VALUE: 'Val ($)',
  },
  'es-ES': {
    SYMBOL: 'Símbolo',
  },
  'es-EC': {
    SYMBOL: 'Símbolo',
  },
};

module.exports = (lang) =>
  values[lang] || values[Object.keys(values).find((ea) => ea.startsWith(lang))];
