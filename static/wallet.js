/* global lib,settings */
let activeWallet = null;

const walletVisibilitySettingsKey = 'wallet-visibility';

const getWalletVisibility = () =>
  settings.get(walletVisibilitySettingsKey, false, 'bool');

const setWalletVisibility = (newWalletVisibility) => {
  settings.set(walletVisibilitySettingsKey, newWalletVisibility);
  return newWalletVisibility;
};

const toggleWalletVisibility = () => {
  setWalletVisibility(!getWalletVisibility());

  updateWalletVisibility();
};

const updateWalletVisibility = () =>
  getWalletVisibility()
    ? $('.wallet-hideable').show()
    : $('.wallet-hideable').hide();

const loadWallet = () => {
  const walletId = settings.get('wallet-id');

  if (!walletId) return lib.presentAlert(`Invalid wallet id '${walletId}'`);

  const namespacedWalletId = `wallet-${walletId}`;

  const walletJson = settings.get(namespacedWalletId);

  $('#wallet-json').val(walletJson);

  activeWallet = JSON.parse(walletJson);

  console.debug('loaded', namespacedWalletId, 'with contents', activeWallet);
};

const saveWallet = () => {
  const context = {};

  try {
    context.walletId = $('#wallet-id').val();

    if (!context.walletId)
      return lib.presentAlert(`Invalid wallet id '${context.walletId}'`);

    context.walletString = $('#wallet-json').val();

    if (!context.walletString)
      return lib.presentAlert('Refusing to save empty wallet');

    context.walletContents = JSON.parse(context.walletString);

    context.walletId = `wallet-${context.walletId}`;

    settings.set(context.walletId, context.walletString);

    settings.arrayAppend('wallet-list', context.walletId);

    activeWallet = context.walletContents;

    console.debug(
      'saved',
      context.walletId,
      'with contents',
      context.walletContents,
    );

    crypto.createCryptoTables(crypto.getCryptoData());
  } catch (err) {
    console.error(context, err);

    lib.presentAlert(
      `Failed saving walletID with error '${err.message}'`,
      'alert-danger',
      5000,
    );
  }
};

const interpretWallet = () => lib.processWallet(activeWallet);

const getSymbols = () => {
  const walletKeys = activeWallet && Object.keys(activeWallet);

  if (walletKeys && walletKeys.length > 0) {
    return walletKeys;
  }

  return ['BTC', 'BCH', 'NANO', 'ETH', 'XMR', 'LTC', 'SC'];
};

$(document).ready(() => {
  updateWalletVisibility();

  $('#load-wallet').click(() => loadWallet());
  $('#save-wallet').click(() => saveWallet());
  $('#wallet-toggle').click(() => toggleWalletVisibility());
});

// eslint-disable-next-line no-unused-vars
const wallet = {
  getSymbols,
  interpretWallet,
  loadWallet,
};
