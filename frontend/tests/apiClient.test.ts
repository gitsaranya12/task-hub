import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DELETE_HEADER, DELETE_TOKEN } from '../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe('API client', () => {
  beforeEach(() => mockFetch.mockReset());

  it('getTasks calls GET /api/tasks', async () => {
    mockFetch.mockReturnValue(mockResponse({ success: true, data: [] }));
    const { api } = await import('../src/api/client');
    await api.getTasks();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
    );
  });

  it('getTasks appends search query param', async () => {
    mockFetch.mockReturnValue(mockResponse({ success: true, data: [] }));
    const { api } = await import('../src/api/client');
    await api.getTasks('login');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('search=login');
  });

  it('getTasks does not append search param for empty string', async () => {
    mockFetch.mockReturnValue(mockResponse({ success: true, data: [] }));
    const { api } = await import('../src/api/client');
    await api.getTasks('');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe('/api/tasks');
  });

  it('createTask calls POST /api/tasks with body', async () => {
    mockFetch.mockReturnValue(mockResponse({ success: true, data: {} }));
    const { api } = await import('../src/api/client');
    const input = { title: 'Test', description: '', priority: 'low' as const, status: 'todo' as const };
    await api.createTask(input);
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toMatchObject({ title: 'Test' });
  });

  it('updateTask calls PATCH /api/tasks/:id', async () => {
    mockFetch.mockReturnValue(mockResponse({ success: true, data: {} }));
    const { api } = await import('../src/api/client');
    await api.updateTask('abc', { status: 'done' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/tasks/abc');
    expect(opts.method).toBe('PATCH');
  });

  it('deleteTask calls DELETE with auth header', async () => {
    mockFetch.mockReturnValue(mockResponse({ success: true }));
    const { api } = await import('../src/api/client');
    await api.deleteTask('xyz');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/tasks/xyz');
    expect(opts.method).toBe('DELETE');
    expect(opts.headers[DELETE_HEADER]).toBe(DELETE_TOKEN);
  });

  it('returns the parsed JSON response', async () => {
    const body = { success: true, data: [{ id: '1', title: 'Task' }] };
    mockFetch.mockReturnValue(mockResponse(body));
    const { api } = await import('../src/api/client');
    const res = await api.getTasks();
    expect(res).toEqual(body);
  });
});
