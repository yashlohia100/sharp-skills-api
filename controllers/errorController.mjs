const globalErrorHandler = (err, req, res, next) => {
  // Some errors come from mongoose
  // they may not have these properties defined
  err.statusCode = err.statusCode || 500;
  err.statusText = err.statusText || 'error';

  res.status(err.statusCode).json({
    status: err.statusText,
    // sending message seperately
    // message property is not inherited
    message: err.message,
    error: err,
    // stack: err.stack,
  });

  next();
};

export default globalErrorHandler;
