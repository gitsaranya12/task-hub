import { describe, it, expect } from 'vitest';
import { CreateTaskSchema, UpdateTaskSchema, TaskSchema } from '../src/types';

describe('CreateTaskSchema', () => {
  const valid = { title: 'My task', description: 'Details', priority: 'medium' as const, status: 'todo' as const };

  it('parses valid input', () => {
    const r = CreateTaskSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it('fails without title', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, title: undefined });
    expect(r.success).toBe(false);
  });

  it('fails with empty title', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, title: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toMatch(/required/i);
    }
  });

  it('fails with title over 100 chars', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, title: 'x'.repeat(101) });
    expect(r.success).toBe(false);
  });

  it('passes with title exactly 100 chars', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, title: 'a'.repeat(100) });
    expect(r.success).toBe(true);
  });

  it('fails with description over 500 chars', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, description: 'd'.repeat(501) });
    expect(r.success).toBe(false);
  });

  it('fails with invalid priority', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, priority: 'urgent' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const issue = r.error.issues.find(i => i.path.includes('priority'));
      expect(issue).toBeDefined();
    }
  });

  it('accepts all valid priorities', () => {
    for (const p of ['low', 'medium', 'high', 'critical'] as const) {
      expect(CreateTaskSchema.safeParse({ ...valid, priority: p }).success).toBe(true);
    }
  });

  it('fails with invalid status', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, status: 'pending' });
    expect(r.success).toBe(false);
  });

  it('accepts all valid statuses', () => {
    for (const s of ['todo', 'in_progress', 'done', 'cancelled'] as const) {
      expect(CreateTaskSchema.safeParse({ ...valid, status: s }).success).toBe(true);
    }
  });
});

describe('UpdateTaskSchema', () => {
  it('passes with empty object (all optional)', () => {
    expect(UpdateTaskSchema.safeParse({}).success).toBe(true);
  });

  it('passes with single field', () => {
    expect(UpdateTaskSchema.safeParse({ status: 'done' }).success).toBe(true);
  });

  it('fails if provided title is empty', () => {
    expect(UpdateTaskSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('fails if provided priority is invalid', () => {
    expect(UpdateTaskSchema.safeParse({ priority: 'none' }).success).toBe(false);
  });
});

describe('TaskSchema', () => {
  const fullTask = {
    id: 'abc-123',
    title: 'Full task',
    description: 'Desc',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('parses a complete task', () => {
    expect(TaskSchema.safeParse(fullTask).success).toBe(true);
  });

  it('fails without id', () => {
    const { id: _, ...rest } = fullTask;
    expect(TaskSchema.safeParse(rest).success).toBe(false);
  });
});
