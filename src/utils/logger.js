const logger = {
  debug: (message, ...args) => {
    console.debug(message, args);
  },
  trace: (message, ...args) => {
    console.trace(message, args);
  },
  error: (message, ...args) => {
    console.error(message, args);
  },
  info: (message, ...args) => {
    console.info(message, args);
  },
  log: (message, ...args) => {
    console.log(message, args);
  },
  warn: (message, ...args) => {
    console.warn(message, args);
  },
};

module.exports = logger;
