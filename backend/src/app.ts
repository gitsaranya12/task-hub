import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/tasks';
import { notFoundHandler, globalErrorHandler, validateJsonBody } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(validateJsonBody);

  app.get('/health', (_req, res) => res.json({ success: true, message: 'API is running' }));

  app.use('/api/tasks', taskRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
