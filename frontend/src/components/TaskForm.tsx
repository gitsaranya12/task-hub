import React, { useState } from 'react';
import { CreateTaskSchema, CreateTaskInput, PRIORITIES, STATUSES } from '../types';
import { ZodError } from 'zod';

interface Props {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
}

const INITIAL: CreateTaskInput = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
};

export function TaskForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CreateTaskInput>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof CreateTaskInput, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = CreateTaskSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      (result.error as ZodError).errors.forEach(err => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(result.data);
      setForm(INITIAL);
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate data-testid="task-form">
      <h2 className="form-title">New Task</h2>

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={e => update('title', e.target.value)}
          placeholder="What needs to be done?"
          className={errors.title ? 'input-error' : ''}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && <span className="field-error" id="title-error" role="alert">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={e => update('description', e.target.value)}
          placeholder="Add more details..."
          rows={3}
          className={errors.description ? 'input-error' : ''}
        />
        {errors.description && <span className="field-error" role="alert">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" value={form.priority} onChange={e => update('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" value={form.status} onChange={e => update('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
