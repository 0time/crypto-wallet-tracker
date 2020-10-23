module.exports = {
  CONTENT_TYPES: {
    APPLICATION_JSON: 'application/json',
    WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded',
  },
  HEADERS: { CONTENT_TYPE: 'content-type' },
  HTTP_METHODS: { GET: 'get' },
  HTTP_STATUS: { OK: 200 },
  JSON_SELECTORS: {
    // TODO: These selectors are not particularly predictable based on their name
    CONFIG_LOG_FUNCTIONS: 'config.logger.levels',
    CONFIG_LOG_LINE_NUMBERS_ENABLED: 'config.logger.logLineNumbers',
    CONFIG_PROXY_ENABLED: 'config.proxy',
    CONFIG_SERVER_OPTIONS: 'config.server.options',
    CONFIG_SOURCE_HEADER: 'config.source.header',
    CONFIG_SOURCE_KEY: 'config.source.key',
    CONFIG_SOURCE_LIMIT: 'config.source.pageSize',
    CONFIG_SOURCE_MIN_DEBOUNCE_TIME_MS: 'config.source.minDebounceTimeMs',
    CONFIG_SOURCE_URL: 'config.source.url',
    CONFIG_DB: 'config.db',
    CONFIG_SERVER_PORT: 'config.server.port',
    REQUEST_BODY: 'body',
    REQUEST_BODY_LANGUAGE: 'body.language',
    REQUEST_CONTEXT: 'cryptoRequestContext',
    REQUEST_CONTEXT_LANGUAGE: 'cryptoRequestContext.language',
    REQUEST_HEADERS_ACCEPT_LANGUAGE: 'headers.accept-language',
    REQUEST_HEADERS_X_ACCEPT_LANGUAGE: 'headers.x-accept-language',
    REQUEST_PARAMS_LANGUAGE: 'params.language',
    REQUEST_QUERY_FORCE: 'query.force',
    REQUEST_QUERY_LANGUAGE: 'query.language',
    RUNTIME_APP: 'runtime.app',
    RUNTIME_AXIOS: 'runtime.axios',
    RUNTIME_DB_MODELS: 'runtime.models',
    RUNTIME_FP_LOGGER: 'runtime.fpLogger',
    RUNTIME_LAST_API_CALL: 'runtime.lastApiCall',
    RUNTIME_LOG_FUNCTIONS: 'runtime.availableLogFunctions',
    RUNTIME_LOGGER: 'runtime.logger',
    RUNTIME_POOL: 'runtime.pool',
    RUNTIME_QUERY: 'runtime.query',
    RUNTIME_PROMISE: 'runtime.promise',
    RUNTIME_START_TIME: 'runtime.startTime',
    RUNTIME_SERVER: 'runtime.server',
    RUNTIME_WORKING_DIR: 'runtime.workingDirectory',
  },
};
