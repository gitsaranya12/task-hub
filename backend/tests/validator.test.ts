import { validateCreateTask, validateUpdateTask } from '../src/validators/taskValidator';

describe('validateCreateTask', () => {
  const valid = { title: 'My Task', description: 'Details', priority: 'medium', status: 'todo' };

  it('passes with all valid fields', () => {
    const r = validateCreateTask(valid);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('fails when body is null', () => {
    const r = validateCreateTask(null);
    expect(r.valid).toBe(false);
  });

  it('fails when body is a string', () => {
    const r = validateCreateTask('not an object');
    expect(r.valid).toBe(false);
  });

  it('fails when title is missing', () => {
    const r = validateCreateTask({ ...valid, title: undefined });
    expect(r.valid).toBe(false);
    expect(r.errors.find(e => e.field === 'title')).toBeDefined();
  });

  it('fails when title is empty string', () => {
    const r = validateCreateTask({ ...valid, title: '' });
    expect(r.valid).toBe(false);
  });

  it('fails when title is whitespace only', () => {
    const r = validateCreateTask({ ...valid, title: '   ' });
    expect(r.valid).toBe(false);
  });

  it('fails when title exceeds 100 chars', () => {
    const r = validateCreateTask({ ...valid, title: 'a'.repeat(101) });
    expect(r.valid).toBe(false);
  });

  it('passes when title is exactly 100 chars', () => {
    const r = validateCreateTask({ ...valid, title: 'a'.repeat(100) });
    expect(r.valid).toBe(true);
  });

  it('fails when description is missing', () => {
    const { description: _, ...rest } = valid;
    const r = validateCreateTask(rest);
    expect(r.valid).toBe(false);
    expect(r.errors.find(e => e.field === 'description')).toBeDefined();
  });

  it('fails when description exceeds 500 chars', () => {
    const r = validateCreateTask({ ...valid, description: 'x'.repeat(501) });
    expect(r.valid).toBe(false);
  });

  it('fails for unknown priority', () => {
    const r = validateCreateTask({ ...valid, priority: 'extreme' });
    expect(r.valid).toBe(false);
    expect(r.errors.find(e => e.field === 'priority')).toBeDefined();
  });

  it('passes for all valid priorities', () => {
    for (const p of ['low', 'medium', 'high', 'critical']) {
      const r = validateCreateTask({ ...valid, priority: p });
      expect(r.valid).toBe(true);
    }
  });

  it('fails for unknown status', () => {
    const r = validateCreateTask({ ...valid, status: 'paused' });
    expect(r.valid).toBe(false);
  });

  it('passes for all valid statuses', () => {
    for (const s of ['todo', 'in_progress', 'done', 'cancelled']) {
      const r = validateCreateTask({ ...valid, status: s });
      expect(r.valid).toBe(true);
    }
  });

  it('returns multiple errors at once', () => {
    const r = validateCreateTask({});
    expect(r.errors.length).toBeGreaterThanOrEqual(4);
  });

  it('error objects have field and message', () => {
    const r = validateCreateTask({});
    r.errors.forEach(e => {
      expect(e).toHaveProperty('field');
      expect(e).toHaveProperty('message');
      expect(typeof e.field).toBe('string');
      expect(typeof e.message).toBe('string');
    });
  });
});

describe('validateUpdateTask', () => {
  it('passes with empty object (all fields optional)', () => {
    const r = validateUpdateTask({});
    expect(r.valid).toBe(true);
  });

  it('passes with single field update', () => {
    const r = validateUpdateTask({ status: 'done' });
    expect(r.valid).toBe(true);
  });

  it('fails if provided title is empty', () => {
    const r = validateUpdateTask({ title: '' });
    expect(r.valid).toBe(false);
  });

  it('fails if provided priority is invalid', () => {
    const r = validateUpdateTask({ priority: 'none' });
    expect(r.valid).toBe(false);
  });

  it('does not require fields that are absent', () => {
    const r = validateUpdateTask({ title: 'New title' });
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });
});
