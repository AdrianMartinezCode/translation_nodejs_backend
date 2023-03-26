class ApiError extends Error {
    constructor(statusCode, code, message) {
        super();
        this.statusCode = statusCode;
        this.code = code;
        this.message = message;
    }
}

module.exports = ApiError;