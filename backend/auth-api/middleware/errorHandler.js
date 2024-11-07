const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Use the existing status code or default to 500
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
