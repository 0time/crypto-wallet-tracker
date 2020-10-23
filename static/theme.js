/* global settings */

// eslint-disable-next-line no-unused-vars
const theme = (function () {
  const DARK = 'theme-dark';
  const LIGHT = 'theme-light';

  const isDark = () => getTheme() === DARK;
  const isLight = () => getTheme() === LIGHT;

  const getTheme = () => settings.get('theme', DARK);

  const setTheme = (newTheme) => settings.set('theme', newTheme);

  const toggleTheme = () => {
    setTheme(isDark() ? LIGHT : DARK);

    updateTheme();
  };

  const updateTheme = () => {
    const t = getTheme();

    const btnClass = `btn ${
      isDark() ? 'btn-outline-dark' : 'btn-outline-light'
    }`;

    $('[themable]').removeClass(DARK).removeClass(LIGHT).addClass(t);
    $('[themable] button').attr('class', btnClass);
  };

  $(document).ready(() => {
    updateTheme();

    $('#theme-toggle').click(() => toggleTheme());
  });

  return {
    DARK,
    LIGHT,
    getTheme,
    setTheme,
    isDark,
    isLight,
    updateTheme,
  };
})();
