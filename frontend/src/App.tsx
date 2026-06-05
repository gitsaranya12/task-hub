import React, { useEffect, useState, useCallback } from "react";
import { useTaskStore } from "./store/taskStore";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { SearchBar } from "./components/SearchBar";
import { StatsBar } from "./components/StatsBar";
import { CreateTaskInput } from "./types";

export default function App() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    clearError,
  } = useTaskStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      fetchTasks(q);
    },
    [fetchTasks],
  );

  const handleCreate = async (input: CreateTaskInput) => {
    const ok = await createTask(input);
    if (ok) setShowForm(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">◈</span>
            <h1>Task Hub</h1>
          </div>
          <button
            className="btn-primary btn-new"
            onClick={() => setShowForm(true)}
          >
            + New Task
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner" role="alert" data-testid="error-banner">
            <span>{error}</span>
            <button onClick={clearError} aria-label="Dismiss">
              ✕
            </button>
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <TaskForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        <StatsBar tasks={tasks} />

        <div className="toolbar">
          <SearchBar onSearch={handleSearch} />
          <span className="task-count">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading && (
          <div className="loader" data-testid="loader">
            Loading…
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="empty-state" data-testid="empty-state">
            <span className="empty-icon">◎</span>
            <p>No tasks found</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create your first task
            </button>
          </div>
        )}

        <div className="task-grid" data-testid="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={deleteTask}
              onStatusChange={(id, status) => updateTask(id, { status })}
              onEdit={(id, title, description) =>
                updateTask(id, { title, description })
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}
