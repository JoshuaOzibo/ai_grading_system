/**
 * sendSuccess — Standardized success response helper.
 */
export const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null } = {}) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * sendError — Standardized error response helper.
 */
export const sendError = (res, { statusCode = 500, message = 'Something went wrong' } = {}) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};
