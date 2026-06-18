
export const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null } = {}) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const sendError = (res, { statusCode = 500, message = 'Something went wrong' } = {}) => {
  console.error(`[API Error Response] Status: ${statusCode}, Message: ${message}`);
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};
