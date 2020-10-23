/* global lib, settings */

// eslint-disable-next-line no-unused-vars
const localization = (function () {
  let localizationMapLocked = false;
  let localizationMap = {};

  let localizationBaseUrl = null;
  const localizationPath = 'localization';

  const getLocalizationUrl = () =>
    `${localizationBaseUrl ? localizationBaseUrl : ''}${localizationPath}`;

  const updateLocalizations = (ajaxResult) => {
    const critSection = (cb, timeout = 10) => {
      if (localizationMapLocked) {
        // wait a bit and try again
        setTimeout(() => updateLocalizations(ajaxResult), timeout);

        return false;
      }

      localizationMapLocked = true;

      cb();

      localizationMapLocked = false;

      return true;
    };

    if (ajaxResult) {
      const cb = () =>
        Object.keys(ajaxResult).forEach(
          (key) => (localizationMap[key] = ajaxResult[key]),
        );

      if (!critSection(cb)) return null;
    } else {
      $.ajax(getLocalizationUrl(), {
        data: lib.getQueryParameters(),
        dataType: 'json',
        error: console.error,
        success: (data) => {
          if (data) {
            updateLocalizations(data);

            settings.set('localization-map', JSON.stringify(localizationMap));
          }
        },
      });
    }

    const cb = () => {
      $('[data-localization]').each((localization, ele) => {
        const e = $(ele);
        const dataLocalization = e.attr('data-localization');
        const text = e.text();

        if (!localizationMap[dataLocalization] && text && text !== '') {
          localizationMap[dataLocalization] = text;
        } else {
          e.text(localizationMap[dataLocalization]);
        }

        if (lib.getQueryParameters().language === 'en-SM') {
          e.addClass('dynamic-huge-font');
        } else {
          e.removeClass('dynamic-huge-font');
        }
      });
    };

    critSection(cb);
  };

  $(document).ready(() => {
    try {
      localizationMap = JSON.parse(settings.get('localization-map'));
    } catch (err) {
      console.error(err);
    }

    updateLocalizations();

    $('#update-localizations').click(() => {
      updateLocalizations();
    });
  });

  return {
    updateLocalizations,
  };
})();
