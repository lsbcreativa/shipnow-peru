import express from 'express';
import apiRouter from './routes/index.router.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware.js';

export const app = express();

app.use(express.json());
app.use('/api', apiRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
