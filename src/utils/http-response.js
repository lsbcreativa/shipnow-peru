export const successResponse = (res, statusCode, payload) =>
  res.status(statusCode).json({ status: 'success', payload });
