const fs = require('fs');
const Path = require('path');
const env = process.env.NODE_ENV_RUN || 'local';

const baseConfig = {
  appPort: parseInt(process.env.APP_PORT) || 3977,
  dbFirestoreAccount: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  sentencesCollectionPath: 'sentences',
  pageSize: 10,
  yandexApiKey: process.env.YANDEX_API_KEY,
};

const environmentConfig = {
  local: {
    dbFirestoreAccount: require('@resources/service-api-key.json'),
    yandexApiKey: fs.readFileSync(Path.join(
        __dirname, '..', '..', 'resources', 'yandex-api-key.txt',
    )),
  },
  development: {},
  production: {},
};

const config = {
  ...baseConfig,
  ...environmentConfig[env],
};

module.exports = config;
