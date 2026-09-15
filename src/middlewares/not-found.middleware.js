export const notFoundMiddleware = (req, res) => {
  res.status(404).json({ status: 'error', message: `La ruta ${req.originalUrl} no existe` });
};
