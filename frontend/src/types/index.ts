import { z } from 'zod';

export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const STATUSES = ['todo', 'in_progress', 'done', 'cancelled'] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer'),
  priority: z.enum(PRIORITIES, { errorMap: () => ({ message: `Priority must be one of: ${PRIORITIES.join(', ')}` }) }),
  status: z.enum(STATUSES, { errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}` }) }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTaskSchema = TaskSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateTaskSchema = CreateTaskSchema.partial();

export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const DELETE_HEADER = 'x-delete-authorization';
export const DELETE_TOKEN = 'team-delete-secret-2024';
