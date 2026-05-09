/**
 * AppError — Custom error class for operational errors.
 * Pass these through next(error) and they will be handled
 * by the global error handler in app.js.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
