import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "../src/components/TaskForm";

describe("TaskForm", () => {
  it("renders all form fields", () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it("shows error when submitting with empty title", async () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.submit(screen.getByTestId("task-form"));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("does not call onSubmit if title is empty", async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.submit(screen.getByTestId("task-form"));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it("calls onSubmit with valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/title/i), "New Feature");
    await user.type(
      screen.getByLabelText(/description/i),
      "Build something cool",
    );

    fireEvent.submit(screen.getByTestId("task-form"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Feature",
          description: "Build something cool",
        }),
      );
    });
  });

  it("clears title error when user starts typing", async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.submit(screen.getByTestId("task-form"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    await user.type(screen.getByLabelText(/title/i), "a");
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
  });

  it("calls onCancel when cancel button clicked", async () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("defaults priority to medium", () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const select = screen.getByLabelText(/priority/i) as HTMLSelectElement;
    expect(select.value).toBe("medium");
  });

  it("defaults status to todo", () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const select = screen.getByLabelText(/status/i) as HTMLSelectElement;
    expect(select.value).toBe("todo");
  });

  it("shows title error for title exceeding 100 chars", async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    await user.type(screen.getByLabelText(/title/i), "x".repeat(101));
    fireEvent.submit(screen.getByTestId("task-form"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});
