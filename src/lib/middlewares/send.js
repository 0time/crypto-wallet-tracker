const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_APP, RUNTIME_PROMISE },
} = require('../constants');

module.exports = (context) => {
  const app = get(context, RUNTIME_APP);
  const promise = get(context, RUNTIME_PROMISE);

  // eslint-disable-next-line no-unused-vars
  app.use((prescribedResponse, req, res, next) =>
    promise.resolve().then(() => {
      const json = get(prescribedResponse, 'json');
      const status = get(prescribedResponse, 'status', 200);

      if (res.headersSent) {
        throw new Error(
          'Did not expect headers to be sent already, probably mistakenly called next after sending a response manually',
        );
      }

      if (prescribedResponse instanceof Error) {
        // pass to the error handler middleware
        return next(prescribedResponse);
      }

      if (json) {
        return res.status(status).json(json);
      }

      return next(
        new Error(
          `unhandled type of prescribedResponse '${JSON.stringify(
            prescribedResponse,
          )}'`,
        ),
      );
    }),
  );

  return context;
};
