const admin = require('firebase-admin');


const initializeDb = ({config, logger}) => {
  logger.info('Initializing the database...');
  admin.initializeApp({
    credential: admin.credential.cert(config.dbFirestoreAccount),
  });
  logger.info('Initialized database.');
  return admin.firestore();
};

module.exports = initializeDb;
