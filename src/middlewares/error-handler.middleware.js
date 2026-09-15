export const errorHandlerMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Ocurrio un error inesperado en el servidor' : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ status: 'error', message });
};
