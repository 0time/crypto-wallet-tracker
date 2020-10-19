const {
  fp: { negate },
  get,
  lib,
} = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: {
    CONFIG_LOG_LINE_NUMBERS_ENABLED,
    RUNTIME_LOG_FUNCTIONS,
    RUNTIME_WORKING_DIR,
  },
} = require('./constants');
const util = require('util');

const dt = () => new Date().toISOString();

module.exports = (context) => {
  const anonymousRegex = new RegExp('(<anonymous>)');
  const fileLineColBitsRegex = new RegExp('[^()]+:[0-9]+:[0-9]+');
  const ignoreFunctionNames = ['module.exports'];
  const isNull = (x) => x === null;
  const isEmpty = (x) => isNull(x) || x === '';
  const isError = (x) => x instanceof Error;
  const isString = lib.index.isString;
  const logFns = get(context, RUNTIME_LOG_FUNCTIONS);
  const logLineNumbers = get(context, CONFIG_LOG_LINE_NUMBERS_ENABLED, false);
  const pwdRegExp = new RegExp(`^${get(context, RUNTIME_WORKING_DIR)}/`);
  const utilOptions = { breakLength: Infinity, depth: 5 };

  const insp = (x) => util.inspect(x, utilOptions);

  const prepareArgs = (listOfStrings) =>
    listOfStrings.map((ea) =>
      isString(ea) ? ea.replace(pwdRegExp, '') : insp(ea),
    );

  const loggerFnCreator = (...args) =>
    // eslint-disable-next-line no-console
    console.error(...prepareArgs(args));
  let loggerFn = null;

  // The index to reference inside the stack to hopefully get the right callee
  const refIndex = 1;

  loggerFn = (key) => (...logArgs) => {
    const args = [dt(), key];
    const last = logArgs[logArgs.length - 1];

    if (isError(last)) {
      const line = last
        .toString()
        .split('\n')
        .find((ea, i) => i > refIndex && !anonymousRegex.test(ea));

      const matches = fileLineColBitsRegex.exec(line);

      if (matches && matches.length >= 1 && matches[0] !== '') {
        args.push(matches[0]);
      }
    }

    if (logLineNumbers && args.length === 2) {
      /* some gibberish to get a map which describes a stack */
      const orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function (_, stack) {
        return stack;
      };
      const err = new Error();
      const stack = err.stack;
      Error.prepareStackTrace = orig;

      const stackRef = stack[refIndex];

      const calleeFile = stack
        .find((ea, i) => i >= refIndex && !isEmpty(ea.getFileName))
        .getFileName();
      const calleeFn = stackRef.getFunctionName();
      const calleeLine = stackRef.getLineNumber();

      const calleeFileLineBuilder = [calleeFile, calleeLine].filter(
        negate(isEmpty),
      );

      if (!ignoreFunctionNames.includes(calleeFn)) {
        args.push(calleeFn);
      }

      if (calleeFileLineBuilder.length > 0) {
        calleeFileLineBuilder.push('');

        args.push(calleeFileLineBuilder.join(':'));
      }
    }

    loggerFnCreator(...args, ...logArgs);
  };

  return logFns.reduce(
    (acc, key) =>
      Object.assign({}, acc, {
        [key]: loggerFn(key),
      }),
    {},
  );
};
