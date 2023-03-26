const ApiError = require("../utils/ApiError");


const handleApiError = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
        });
    }

    next(err);
};

const handleUnexpectedError = ({ logger }) => (err, req, res, next) => {
    logger.error('Unexpected error:', err);

    res.status(500).json({
        code: "000",
        message: 'An unexpected error occurred',
    });
};

module.exports = {
    handleApiError,
    handleUnexpectedError,
};