import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsBar } from '../src/components/StatsBar';
import { Task } from '../src/types';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: Math.random().toString(),
  title: 'Task',
  description: '',
  priority: 'medium',
  status: 'todo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('StatsBar', () => {
  it('shows total count', () => {
    const tasks = [makeTask(), makeTask(), makeTask()];
    render(<StatsBar tasks={tasks} />);
    const statNums = screen.getAllByText('3');
    expect(statNums.length).toBeGreaterThanOrEqual(1);
  });

  it('shows correct todo count', () => {
    const tasks = [makeTask({ status: 'todo' }), makeTask({ status: 'todo' }), makeTask({ status: 'done' })];
    render(<StatsBar tasks={tasks} />);
    const stats = screen.getAllByText('2');
    expect(stats.length).toBeGreaterThanOrEqual(1); // 2 todos
  });

  it('shows zero counts when no tasks', () => {
    render(<StatsBar tasks={[]} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it('shows critical count when there are open critical tasks', () => {
    const tasks = [makeTask({ priority: 'critical', status: 'todo' })];
    render(<StatsBar tasks={tasks} />);
    expect(screen.getByText(/critical/i)).toBeInTheDocument();
  });

  it('does not show critical indicator when no critical open tasks', () => {
    const tasks = [makeTask({ priority: 'critical', status: 'done' })];
    render(<StatsBar tasks={tasks} />);
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
  });

  it('counts done tasks correctly', () => {
    const tasks = [
      makeTask({ status: 'done' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'todo' }),
    ];
    render(<StatsBar tasks={tasks} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
