import { PRIORITIES, STATUSES, CreateTaskInput, UpdateTaskInput } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function validateTitle(title: unknown): ValidationError | null {
  if (title === undefined || title === null) return { field: 'title', message: 'Title is required' };
  if (typeof title !== 'string') return { field: 'title', message: 'Title must be a string' };
  if (title.trim().length === 0) return { field: 'title', message: 'Title cannot be empty' };
  if (title.trim().length > 100) return { field: 'title', message: 'Title must be 100 characters or fewer' };
  return null;
}

function validateDescription(desc: unknown): ValidationError | null {
  if (desc === undefined || desc === null) return { field: 'description', message: 'Description is required' };
  if (typeof desc !== 'string') return { field: 'description', message: 'Description must be a string' };
  if (desc.length > 500) return { field: 'description', message: 'Description must be 500 characters or fewer' };
  return null;
}

function validatePriority(priority: unknown): ValidationError | null {
  if (priority === undefined || priority === null) return { field: 'priority', message: 'Priority is required' };
  if (!PRIORITIES.includes(priority as never)) {
    return { field: 'priority', message: `Priority must be one of: ${PRIORITIES.join(', ')}` };
  }
  return null;
}

function validateStatus(status: unknown): ValidationError | null {
  if (status === undefined || status === null) return { field: 'status', message: 'Status is required' };
  if (!STATUSES.includes(status as never)) {
    return { field: 'status', message: `Status must be one of: ${STATUSES.join(', ')}` };
  }
  return null;
}

export function validateCreateTask(body: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  if (typeof body !== 'object' || body === null) {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] };
  }
  const b = body as Record<string, unknown>;
  const titleErr = validateTitle(b.title);
  const descErr = validateDescription(b.description);
  const prioErr = validatePriority(b.priority);
  const statErr = validateStatus(b.status);
  if (titleErr) errors.push(titleErr);
  if (descErr) errors.push(descErr);
  if (prioErr) errors.push(prioErr);
  if (statErr) errors.push(statErr);
  return { valid: errors.length === 0, errors };
}

export function validateUpdateTask(body: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  if (typeof body !== 'object' || body === null) {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] };
  }
  const b = body as Record<string, unknown>;
  if (b.title !== undefined) { const e = validateTitle(b.title); if (e) errors.push(e); }
  if (b.description !== undefined) { const e = validateDescription(b.description); if (e) errors.push(e); }
  if (b.priority !== undefined) { const e = validatePriority(b.priority); if (e) errors.push(e); }
  if (b.status !== undefined) { const e = validateStatus(b.status); if (e) errors.push(e); }
  return { valid: errors.length === 0, errors };
}
