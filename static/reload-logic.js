/* eslint-env browser, jquery */
/* eslint-disable no-console */

const fixed = val => val.toFixed(1);
const initialOffset = '440';

const val = id => document.getElementById(id).innerText;

const createdAt = new Date(val('created-at'));
const nextTime = new Date(val('next-time'));
const time = nextTime - createdAt;

let lastReloadTry = new Date();
lastReloadTry = nextTime - 3000;

const initialStrokeDashOffset = 440 - 0 / time;

$('.circle_animation').css('stroke-dashoffset', initialStrokeDashOffset);

const fn = () => {
  const now = new Date();
  const age = now - createdAt;

  const nextText = nextTime && fixed((nextTime - now) / 1000) + 's';
  const ageText = fixed(age / 1000) + 's';

  const result = nextText ? nextText + ' ' + ageText : ageText;

  document.getElementById('timer').innerText = result;
  //document.getElementById('h2-timer').innerText = nextText;

  $('.circle_animation').css(
    'stroke-dashoffset',
    initialOffset - 1 * ((age * initialOffset) / time),
  );

  if (now > nextTime && now - lastReloadTry > 0) {
    console.error(
      { lastReloadTry, nextTime, newReloadTry: now + 7000, now },
      now > nextTime,
      now - lastReloadTry > 0,
    );

    lastReloadTry = now + 7000;

    setTimeout(() => document.location.reload(), 2000);
  }

  setTimeout(fn, 100);
};

fn();

// eslint-disable-next-line no-unused-vars
function formSubmit() {
  console.info('form submit detected');

  $.ajax('/refresh', {
    async: true,
    error: console.error,
    method: 'POST',
    success: (data, textStatus) => {
      console.info(textStatus);

      location.reload();
    },
  });

  return false;
}
