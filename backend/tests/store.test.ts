import { taskStore } from '../src/store/taskStore';

const sample = {
  title: 'Sample',
  description: 'Desc',
  priority: 'low' as const,
  status: 'todo' as const,
};

beforeEach(() => taskStore.clear());

describe('TaskStore', () => {
  it('creates a task and assigns id + timestamps', () => {
    const t = taskStore.create(sample);
    expect(t.id).toBeDefined();
    expect(t.createdAt).toBeDefined();
    expect(t.updatedAt).toBeDefined();
    expect(t.title).toBe(sample.title);
  });

  it('getAll returns all tasks', () => {
    taskStore.create(sample);
    taskStore.create({ ...sample, title: 'Another' });
    expect(taskStore.getAll()).toHaveLength(2);
  });

  it('getAll returns tasks sorted newest first', async () => {
    taskStore.create({ ...sample, title: 'First' });
    await new Promise(r => setTimeout(r, 5));
    taskStore.create({ ...sample, title: 'Second' });
    const all = taskStore.getAll();
    expect(all[0].title).toBe('Second');
  });

  it('getAll filters by search term', () => {
    taskStore.create({ ...sample, title: 'Fix bug' });
    taskStore.create({ ...sample, title: 'Write tests' });
    const r = taskStore.getAll('bug');
    expect(r).toHaveLength(1);
    expect(r[0].title).toBe('Fix bug');
  });

  it('getAll search is case-insensitive', () => {
    taskStore.create({ ...sample, title: 'Fix Bug' });
    expect(taskStore.getAll('FIX')).toHaveLength(1);
    expect(taskStore.getAll('fix')).toHaveLength(1);
  });

  it('getById returns the correct task', () => {
    const t = taskStore.create(sample);
    expect(taskStore.getById(t.id)).toEqual(t);
  });

  it('getById returns undefined for unknown id', () => {
    expect(taskStore.getById('nope')).toBeUndefined();
  });

  it('update modifies only provided fields', () => {
    const t = taskStore.create(sample);
    const updated = taskStore.update(t.id, { status: 'done' });
    expect(updated?.status).toBe('done');
    expect(updated?.title).toBe(sample.title);
    expect(updated?.id).toBe(t.id);
  });

  it('update returns null for unknown id', () => {
    expect(taskStore.update('ghost', { status: 'done' })).toBeNull();
  });

  it('delete removes a task', () => {
    const t = taskStore.create(sample);
    expect(taskStore.delete(t.id)).toBe(true);
    expect(taskStore.getById(t.id)).toBeUndefined();
  });

  it('delete returns false for unknown id', () => {
    expect(taskStore.delete('nope')).toBe(false);
  });

  it('clear removes all tasks', () => {
    taskStore.create(sample);
    taskStore.create(sample);
    taskStore.clear();
    expect(taskStore.getAll()).toHaveLength(0);
  });

  it('each create produces a unique id', () => {
    const ids = Array.from({ length: 50 }, () => taskStore.create(sample).id);
    expect(new Set(ids).size).toBe(50);
  });
});
