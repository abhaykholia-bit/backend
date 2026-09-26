const { STATUS_CODES } = require('node:http');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(req, res) {
  res
    .status(404)
    .json({
      message: `Cannot ${req.method} ${req.path}`,
      error: 'Not Found',
      statusCode: 404,
    });
}

// Express requires four arguments to recognize error middleware.
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status =
    error instanceof HttpError
      ? error.status
      : error.type === 'entity.parse.failed'
        ? 400
        : error.type === 'entity.too.large'
          ? 413
          : 500;
  if (status === 500) console.error('API request failed:', error.name);
  res.status(status).json({
    message:
      status === 500
        ? 'Internal server error'
        : error.type === 'entity.parse.failed'
          ? 'Invalid JSON body.'
          : error.type === 'entity.too.large'
            ? 'Request body is too large.'
            : error.message,
    error: STATUS_CODES[status],
    statusCode: status,
  });
}
module.exports = { HttpError, notFound, errorHandler };
