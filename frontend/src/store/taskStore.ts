import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { api } from '../api/client';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  search: string;

  fetchTasks: (search?: string) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<boolean>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  setSearch: (q: string) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  search: '',

  fetchTasks: async (search) => {
    set({ loading: true, error: null });
    try {
      const res = await api.getTasks(search);
      if (res.success && res.data) {
        set({ tasks: res.data });
      } else {
        set({ error: res.error ?? 'Failed to load tasks' });
      }
    } catch {
      set({ error: 'Network error. Is the server running?' });
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (input) => {
    set({ loading: true, error: null });
    try {
      const res = await api.createTask(input);
      if (res.success && res.data) {
        set(state => ({ tasks: [res.data!, ...state.tasks] }));
        return true;
      }
      set({ error: res.error ?? 'Failed to create task' });
      return false;
    } catch {
      set({ error: 'Network error' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const res = await api.updateTask(id, input);
      if (res.success && res.data) {
        set(state => ({
          tasks: state.tasks.map(t => (t.id === id ? res.data! : t)),
        }));
        return true;
      }
      set({ error: res.error ?? 'Failed to update task' });
      return false;
    } catch {
      set({ error: 'Network error' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.deleteTask(id);
      if (res.success) {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
        return true;
      }
      set({ error: res.error ?? 'Failed to delete task' });
      return false;
    } catch {
      set({ error: 'Network error' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  setSearch: (q) => {
    set({ search: q });
    get().fetchTasks(q);
  },

  clearError: () => set({ error: null }),
}));
