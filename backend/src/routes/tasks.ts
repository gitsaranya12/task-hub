import { Router, Request, Response } from 'express';
import { taskStore } from '../store/taskStore';
import { validateCreateTask, validateUpdateTask } from '../validators/taskValidator';
import { ApiResponse, Task, DELETE_HEADER, DELETE_TOKEN } from '../types';

const router = Router();

// GET /api/tasks — list all, with optional ?search=
router.get('/', (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const tasks = taskStore.getAll(search);
  const response: ApiResponse<Task[]> = { success: true, data: tasks };
  res.json(response);
});

// GET /api/tasks/:id
router.get('/:id', (req: Request, res: Response) => {
  const task = taskStore.getById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' } as ApiResponse);
  }
  return res.json({ success: true, data: task } as ApiResponse<Task>);
});

// POST /api/tasks
router.post('/', (req: Request, res: Response) => {
  const validation = validateCreateTask(req.body);
  if (!validation.valid) {
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      data: validation.errors,
    } as ApiResponse);
  }
  const task = taskStore.create(req.body);
  return res.status(201).json({ success: true, data: task, message: 'Task created' } as ApiResponse<Task>);
});

// PATCH /api/tasks/:id
router.patch('/:id', (req: Request, res: Response) => {
  const existing = taskStore.getById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Task not found' } as ApiResponse);
  }
  const validation = validateUpdateTask(req.body);
  if (!validation.valid) {
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      data: validation.errors,
    } as ApiResponse);
  }
  const updated = taskStore.update(req.params.id, req.body);
  return res.json({ success: true, data: updated, message: 'Task updated' } as ApiResponse<Task>);
});

// DELETE /api/tasks/:id — requires custom auth header
router.delete('/:id', (req: Request, res: Response) => {
  const authHeader = req.headers[DELETE_HEADER];
  if (!authHeader || authHeader !== DELETE_TOKEN) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: missing or invalid delete authorization header',
    } as ApiResponse);
  }
  const existing = taskStore.getById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Task not found' } as ApiResponse);
  }
  taskStore.delete(req.params.id);
  return res.json({ success: true, message: 'Task deleted' } as ApiResponse);
});

export default router;
