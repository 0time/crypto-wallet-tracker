/* global settings */

const DARK = 'theme-dark';
const LIGHT = 'theme-light';

const getTheme = () => settings.get('theme', DARK);

const setTheme = (newTheme) => settings.set('theme', newTheme);

const toggleTheme = () => {
  setTheme(getTheme() === DARK ? LIGHT : DARK);

  updateTheme();
};

const updateTheme = () => {
  const t = getTheme();
  const isDark = t === DARK;

  const btnClass = `btn ${isDark ? 'btn-outline-light' : 'btn-outline-dark'}`;

  $('[themable]').removeClass(DARK).removeClass(LIGHT).addClass(t);
  $('[themable] button').attr('class', btnClass);
};

$(document).ready(() => {
  updateTheme();

  $('#theme-toggle').click(() => toggleTheme());
});
