export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in_progress' | 'done' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
export const STATUSES: Status[] = ['todo', 'in_progress', 'done', 'cancelled'];

export const DELETE_HEADER = 'x-delete-authorization';
export const DELETE_TOKEN = 'team-delete-secret-2024';
