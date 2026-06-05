import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchBar } from '../src/components/SearchBar';

describe('SearchBar', () => {
  it('renders a search input', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('calls onSearch with empty string on mount after debounce', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    act(() => vi.advanceTimersByTime(300));
    expect(onSearch).toHaveBeenCalledWith('');
    vi.useRealTimers();
  });

  it('does not call onSearch immediately on typing', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    act(() => vi.advanceTimersByTime(300));
    onSearch.mockClear();
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'bug' } });
    expect(onSearch).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calls onSearch after debounce delay', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    act(() => vi.advanceTimersByTime(300));
    onSearch.mockClear();
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'login' } });
    act(() => vi.advanceTimersByTime(300));
    expect(onSearch).toHaveBeenCalledWith('login');
    vi.useRealTimers();
  });

  it('shows clear button when input has value', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.queryByLabelText(/clear/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
    expect(screen.getByLabelText(/clear/i)).toBeInTheDocument();
  });

  it('clears input when clear button clicked', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByLabelText(/clear/i));
    const input = screen.getByTestId('search-input') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});