const notFound = (rq, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.Status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  //check for mongoose bad objectId
  if (err.name === "CastError" && err.Kind === "ObjectId") {
    message = "Resource Not Found";
    statusCode = 404;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? "good" : err.stack,
  });
};

export { notFound, errorHandler };
