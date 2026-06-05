import React from 'react';
import { Task } from '../types';

interface Props { tasks: Task[] }

export function StatsBar({ tasks }: Props) {
  const counts = tasks.reduce(
    (acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;

  return (
    <div className="stats-bar" data-testid="stats-bar">
      <div className="stat"><span className="stat-num">{tasks.length}</span><span className="stat-label">Total</span></div>
      <div className="stat"><span className="stat-num">{counts.todo || 0}</span><span className="stat-label">To Do</span></div>
      <div className="stat"><span className="stat-num">{counts.in_progress || 0}</span><span className="stat-label">In Progress</span></div>
      <div className="stat"><span className="stat-num">{counts.done || 0}</span><span className="stat-label">Done</span></div>
      {critical > 0 && (
        <div className="stat stat-critical">
          <span className="stat-num">{critical}</span>
          <span className="stat-label">🔥 Critical</span>
        </div>
      )}
    </div>
  );
}
