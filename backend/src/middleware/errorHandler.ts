import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export function notFoundHandler(req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  };
  res.status(404).json(response);
}

export function globalErrorHandler(
  err: Error & { type?: string },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  console.error('[Error]', err.message);

  // Handle JSON parse errors
  if (err.type === 'entity.parse.failed') {
    const response: ApiResponse = { success: false, error: 'Invalid JSON in request body' };
    return res.status(400).json(response);
  }

  const response: ApiResponse = { success: false, error: 'Internal server error' };
  return res.status(500).json(response);
}

export function validateJsonBody(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const ct = req.headers['content-type'] || '';
    if (!ct.includes('application/json')) {
      const response: ApiResponse = { success: false, error: 'Content-Type must be application/json' };
      return res.status(415).json(response);
    }
  }
  next();
}
