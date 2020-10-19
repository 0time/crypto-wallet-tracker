const config = require('config');
const createMockLogger = require('../../../../lib/mock-logger');
const DEFAULTS = require('../../../../../src/lib/defaults');
const hardCodedLocalizations = require('../../../../../src/lib/routes/localization/hard-coded-localizations');
const {
  JSON_SELECTORS: { REQUEST_CONTEXT_LANGUAGE, RUNTIME_LOGGER },
} = require('../../../../../src/lib/constants');
const { set } = require('@0ti.me/tiny-pfp');

const { d, expect, pquire } = deps;

const me = __filename;

d(me, () => {
  let context = null;
  let getLocalizations = null;
  let mocks = null;
  let req = null;
  let setLanguagesThenGetLocalizations = null;
  let defaultSymbol = null;

  beforeEach(() => {
    context = { config };
    mocks = {};
    req = {};

    defaultSymbol = hardCodedLocalizations(DEFAULTS.LANGUAGE).SYMBOL;

    set(context, RUNTIME_LOGGER, createMockLogger(context));
    set(req, REQUEST_CONTEXT_LANGUAGE, null);

    getLocalizations = () => pquire(me, mocks)(context, req);
    setLanguagesThenGetLocalizations = (languages) => {
      set(req, REQUEST_CONTEXT_LANGUAGE, languages);

      return getLocalizations();
    };
  });

  describe('given two languages which exist in highest to lowest priority order', () => {
    let spanishSymbol = null;
    let symbolSymbol = null;

    beforeEach(() => {
      spanishSymbol = hardCodedLocalizations('es-ES').SYMBOL;
      symbolSymbol = hardCodedLocalizations('en-SM').SYMBOL;
    });

    it('should merge them in highest to lowest priority', () =>
      expect(
        setLanguagesThenGetLocalizations(['es-ES', 'en-SM']),
      ).to.have.property('SYMBOL', spanishSymbol));

    it('should merge them in highest to lowest priority', () =>
      expect(
        setLanguagesThenGetLocalizations(['en-SM', 'es-ES']),
      ).to.have.property('SYMBOL', symbolSymbol));
  });

  describe('given zero languages', () =>
    it('should select the default language symbol', () =>
      expect(setLanguagesThenGetLocalizations([])).to.have.property(
        'SYMBOL',
        defaultSymbol,
      )));

  describe('given undefined languages', () =>
    it('should select the default language symbol', () =>
      expect(setLanguagesThenGetLocalizations(undefined)).to.have.property(
        'SYMBOL',
        defaultSymbol,
      )));
});
