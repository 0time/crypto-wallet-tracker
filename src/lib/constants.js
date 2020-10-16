module.exports = {
  CONTENT_TYPES: { WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded' },
  HEADERS: { CONTENT_TYPE: 'content-type' },
  HTTP_METHODS: { GET: 'get' },
  HTTP_STATUS: { OK: 200 },
  JSON_SELECTORS: {
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
    REQUEST_CONTEXT: 'cryptoRequestContext',
    RUNTIME_APP: 'runtime.app',
    RUNTIME_AXIOS: 'runtime.axios',
    RUNTIME_LAST_API_CALL: 'runtime.lastApiCall',
    RUNTIME_DB_MODELS: 'runtime.models',
    RUNTIME_POOL: 'runtime.pool',
    RUNTIME_QUERY: 'runtime.query',
    RUNTIME_PROMISE: 'runtime.promise',
    RUNTIME_START_TIME: 'runtime.startTime',
    RUNTIME_SERVER: 'runtime.server',
  },
};
