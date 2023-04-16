/**
 *
 */
class ApiError extends Error {
  /**
 *
 * @param statusCode Numeric HTTP Status
 * @param code Alphanumeric unique code for the error
 * @param message String message to show to the outside.
 */
  constructor(statusCode, code, message) {
    super();
    this.statusCode = statusCode;
    this.code = code;
    this.message = message;
  }
}

module.exports = ApiError;
