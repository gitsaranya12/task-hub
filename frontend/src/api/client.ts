import { Task, CreateTaskInput, UpdateTaskInput, ApiResponse, DELETE_HEADER, DELETE_TOKEN } from '../types';

const BASE = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  return json;
}

export const api = {
  getTasks: (search?: string): Promise<ApiResponse<Task[]>> => {
    const qs = search?.trim() ? `?search=${encodeURIComponent(search)}` : '';
    return request<Task[]>(`/tasks${qs}`);
  },

  getTask: (id: string): Promise<ApiResponse<Task>> =>
    request<Task>(`/tasks/${id}`),

  createTask: (input: CreateTaskInput): Promise<ApiResponse<Task>> =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),

  updateTask: (id: string, input: UpdateTaskInput): Promise<ApiResponse<Task>> =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  deleteTask: (id: string): Promise<ApiResponse> =>
    request(`/tasks/${id}`, {
      method: 'DELETE',
      headers: { [DELETE_HEADER]: DELETE_TOKEN },
    }),
};
