import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

class TaskStore {
  private tasks: Map<string, Task> = new Map();

  private seed() {
    const samples: CreateTaskInput[] = [
      { title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated deployments', priority: 'high', status: 'in_progress' },
      { title: 'Write unit tests', description: 'Achieve 80% code coverage across all modules', priority: 'medium', status: 'todo' },
      { title: 'Design system audit', description: 'Audit existing components for accessibility compliance', priority: 'low', status: 'todo' },
      { title: 'Fix login bug', description: 'Users are getting logged out unexpectedly on Safari', priority: 'critical', status: 'in_progress' },
      { title: 'Update API docs', description: 'Document new endpoints added in v2.3', priority: 'medium', status: 'done' },
    ];
    samples.forEach(s => this.create(s));
  }

  constructor() {
    this.seed();
  }

  getAll(search?: string): Task[] {
    const all = Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (!search?.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(t => t.title.toLowerCase().includes(q));
  }

  getById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuidv4(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: string, input: UpdateTaskInput): Task | null {
    const existing = this.tasks.get(id);
    if (!existing) return null;
    const updated: Task = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  clear() {
    this.tasks.clear();
  }
}

export const taskStore = new TaskStore();
