const logger = {
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
    }
}

module.exports = logger;