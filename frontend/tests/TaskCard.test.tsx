import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (id: string, title: string, description: string) => void;
}

const PRIORITY_STYLE: Record<Task['priority'], string> = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
};

const STATUS_STYLE: Record<Task['status'], string> = {
  todo: 'status-todo',
  in_progress: 'status-progress',
  done: 'status-done',
  cancelled: 'status-cancelled',
};

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

export function TaskCard({ task, onDelete, onStatusChange, onEdit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [titleError, setTitleError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) titleRef.current?.focus();
  }, [isEditing]);

  const handleEditSave = () => {
    if (!editTitle.trim()) {
      setTitleError('Title cannot be empty');
      return;
    }
    if (editTitle.trim().length > 100) {
      setTitleError('Title must be 100 characters or fewer');
      return;
    }
    onEdit(task.id, editTitle.trim(), editDesc.trim());
    setIsEditing(false);
    setTitleError('');
  };

  const handleEditCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setTitleError('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div className={`task-card priority-border-${task.priority}`} data-testid="task-card">
      <div className="task-card-header">
        <span className={`badge ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
        <select
          className={`status-select ${STATUS_STYLE[task.status]}`}
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value as Task['status'])}
          aria-label="Task status"
        >
          {(['todo', 'in_progress', 'done', 'cancelled'] as const).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {isEditing ? (
        <div className="edit-fields">
          <input
            ref={titleRef}
            className={`edit-input ${titleError ? 'input-error' : ''}`}
            value={editTitle}
            onChange={e => { setEditTitle(e.target.value); setTitleError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="Task title"
            maxLength={101}
            aria-label="Edit title"
          />
          {titleError && <span className="field-error">{titleError}</span>}
          <textarea
            className="edit-textarea"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') handleEditCancel(); }}
            placeholder="Add a description…"
            rows={2}
            maxLength={500}
            aria-label="Edit description"
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleEditSave}>✓ Save</button>
            <button className="btn-cancel-edit" onClick={handleEditCancel}>✕ Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h3
            className="task-title editable"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
          >
            {task.title}
            <span className="edit-hint">✎</span>
          </h3>
          {task.description
            ? <p className="task-desc editable" onClick={() => setIsEditing(true)} title="Click to edit">{task.description}</p>
            : <p className="task-desc-empty editable" onClick={() => setIsEditing(true)}>Click to add description…</p>
          }
        </>
      )}

      <div className="task-footer">
        <span className="task-date">
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <button
          className={`btn-delete ${confirmDelete ? 'confirm' : ''}`}
          onClick={handleDelete}
          onBlur={() => setConfirmDelete(false)}
          aria-label={confirmDelete ? 'Confirm delete' : 'Delete task'}
          data-testid="delete-btn"
        >
          {confirmDelete ? '⚠ Confirm' : '✕ Delete'}
        </button>
      </div>
    </div>
  );
}