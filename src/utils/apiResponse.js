const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    count: Array.isArray(data) ? data.length : data ? 1 : 0,
    data,
  });
};

const sendError = (
  res,
  statusCode = 500,
  message = "Internal Server Error",
  errors = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
