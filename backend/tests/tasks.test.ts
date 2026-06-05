import request from 'supertest';
import { createApp } from '../src/app';
import { taskStore } from '../src/store/taskStore';
import { DELETE_HEADER, DELETE_TOKEN } from '../src/types';

const app = createApp();

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const validTask = {
  title: 'Test Task',
  description: 'A task for testing',
  priority: 'medium' as const,
  status: 'todo' as const,
};

beforeEach(() => {
  taskStore.clear();
});

// ─── Health ────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 with success true', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── 404 for unknown routes ────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 with error message', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns consistent shape for unknown POST', async () => {
    const res = await request(app).post('/xyz').set(JSON_HEADERS).send({});
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── GET /api/tasks ────────────────────────────────────────────
describe('GET /api/tasks', () => {
  it('returns empty array when no tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('returns all tasks', async () => {
    taskStore.create(validTask);
    taskStore.create({ ...validTask, title: 'Another task' });
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('filters tasks by search query (case-insensitive)', async () => {
    taskStore.create({ ...validTask, title: 'Fix login bug' });
    taskStore.create({ ...validTask, title: 'Update docs' });
    const res = await request(app).get('/api/tasks?search=login');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Fix login bug');
  });

  it('returns empty array when search matches nothing', async () => {
    taskStore.create(validTask);
    const res = await request(app).get('/api/tasks?search=zzznomatch');
    expect(res.body.data).toHaveLength(0);
  });

  it('ignores empty search string', async () => {
    taskStore.create(validTask);
    const res = await request(app).get('/api/tasks?search=');
    expect(res.body.data).toHaveLength(1);
  });
});

// ─── GET /api/tasks/:id ────────────────────────────────────────
describe('GET /api/tasks/:id', () => {
  it('returns a task by id', async () => {
    const task = taskStore.create(validTask);
    const res = await request(app).get(`/api/tasks/${task.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(task.id);
    expect(res.body.data.title).toBe(validTask.title);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).get('/api/tasks/non-existent-id');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});

// ─── POST /api/tasks ───────────────────────────────────────────
describe('POST /api/tasks', () => {
  it('creates a task with valid input', async () => {
    const res = await request(app).post('/api/tasks').set(JSON_HEADERS).send(validTask);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      title: validTask.title,
      priority: validTask.priority,
      status: validTask.status,
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  it('rejects request with no title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(JSON_HEADERS)
      .send({ ...validTask, title: undefined });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    const fields = res.body.data.map((e: { field: string }) => e.field);
    expect(fields).toContain('title');
  });

  it('rejects empty title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(JSON_HEADERS)
      .send({ ...validTask, title: '   ' });
    expect(res.status).toBe(422);
  });

  it('rejects title over 100 characters', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(JSON_HEADERS)
      .send({ ...validTask, title: 'x'.repeat(101) });
    expect(res.status).toBe(422);
  });

  it('rejects invalid priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(JSON_HEADERS)
      .send({ ...validTask, priority: 'urgent' });
    expect(res.status).toBe(422);
    const fields = res.body.data.map((e: { field: string }) => e.field);
    expect(fields).toContain('priority');
  });

  it('rejects invalid status', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(JSON_HEADERS)
      .send({ ...validTask, status: 'pending' });
    expect(res.status).toBe(422);
  });

  it('rejects non-JSON content-type', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'text/plain')
      .send('title=Test');
    expect(res.status).toBe(415);
  });

  it('rejects malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{invalid json');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns all validation errors at once', async () => {
    const res = await request(app).post('/api/tasks').set(JSON_HEADERS).send({});
    expect(res.status).toBe(422);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  it('accepts all valid priority levels', async () => {
    for (const priority of ['low', 'medium', 'high', 'critical']) {
      const res = await request(app)
        .post('/api/tasks')
        .set(JSON_HEADERS)
        .send({ ...validTask, priority });
      expect(res.status).toBe(201);
    }
  });

  it('accepts all valid status values', async () => {
    for (const status of ['todo', 'in_progress', 'done', 'cancelled']) {
      const res = await request(app)
        .post('/api/tasks')
        .set(JSON_HEADERS)
        .send({ ...validTask, status });
      expect(res.status).toBe(201);
    }
  });
});

// ─── PATCH /api/tasks/:id ──────────────────────────────────────
describe('PATCH /api/tasks/:id', () => {
  it('updates a task partially', async () => {
    const task = taskStore.create(validTask);
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(JSON_HEADERS)
      .send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('done');
    expect(res.body.data.title).toBe(validTask.title);
  });

  it('updates title only', async () => {
    const task = taskStore.create(validTask);
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(JSON_HEADERS)
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.priority).toBe(validTask.priority);
  });

  it('updates updatedAt timestamp', async () => {
    const task = taskStore.create(validTask);
    await new Promise(r => setTimeout(r, 5));
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(JSON_HEADERS)
      .send({ status: 'in_progress' });
    expect(res.body.data.updatedAt).not.toBe(task.createdAt);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .patch('/api/tasks/ghost-id')
      .set(JSON_HEADERS)
      .send({ status: 'done' });
    expect(res.status).toBe(404);
  });

  it('rejects invalid status in update', async () => {
    const task = taskStore.create(validTask);
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(JSON_HEADERS)
      .send({ status: 'flying' });
    expect(res.status).toBe(422);
  });

  it('allows empty patch body (no-op update)', async () => {
    const task = taskStore.create(validTask);
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(JSON_HEADERS)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe(task.title);
  });
});

// ─── DELETE /api/tasks/:id ─────────────────────────────────────
describe('DELETE /api/tasks/:id', () => {
  it('deletes a task with valid header', async () => {
    const task = taskStore.create(validTask);
    const res = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set(DELETE_HEADER, DELETE_TOKEN);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
    expect(taskStore.getById(task.id)).toBeUndefined();
  });

  it('returns 403 when delete header is missing', async () => {
    const task = taskStore.create(validTask);
    const res = await request(app).delete(`/api/tasks/${task.id}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/forbidden/i);
    expect(taskStore.getById(task.id)).toBeDefined();
  });

  it('returns 403 when delete header has wrong value', async () => {
    const task = taskStore.create(validTask);
    const res = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set(DELETE_HEADER, 'wrong-token');
    expect(res.status).toBe(403);
    expect(taskStore.getById(task.id)).toBeDefined();
  });

  it('returns 404 when task does not exist (with valid header)', async () => {
    const res = await request(app)
      .delete('/api/tasks/not-real')
      .set(DELETE_HEADER, DELETE_TOKEN);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('does not delete a different task', async () => {
    const task1 = taskStore.create(validTask);
    const task2 = taskStore.create({ ...validTask, title: 'Other task' });
    await request(app).delete(`/api/tasks/${task1.id}`).set(DELETE_HEADER, DELETE_TOKEN);
    expect(taskStore.getById(task2.id)).toBeDefined();
  });
});

// ─── Response shape consistency ────────────────────────────────
describe('Response shape consistency', () => {
  it('all success responses have success: true and data', async () => {
    const task = taskStore.create(validTask);
    const endpoints = [
      () => request(app).get('/api/tasks'),
      () => request(app).get(`/api/tasks/${task.id}`),
      () => request(app).post('/api/tasks').set(JSON_HEADERS).send(validTask),
    ];
    for (const call of endpoints) {
      const res = await call();
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
    }
  });

  it('all error responses have success: false and error', async () => {
    const errorCalls = [
      () => request(app).get('/api/tasks/not-found'),
      () => request(app).post('/api/tasks').set(JSON_HEADERS).send({}),
      () => request(app).delete('/api/tasks/any'),
    ];
    for (const call of errorCalls) {
      const res = await call();
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    }
  });
});
