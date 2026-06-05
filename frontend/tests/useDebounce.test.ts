import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update immediately when value changes', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'first' },
    });
    rerender({ val: 'second' });
    expect(result.current).toBe('first');
  });

  it('updates after delay elapses', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'first' },
    });
    rerender({ val: 'second' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('second');
  });

  it('only applies the latest value if multiple changes happen before delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'a' },
    });
    rerender({ val: 'b' });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ val: 'c' });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ val: 'd' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('d');
  });

  it('uses default delay of 300ms', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val), {
      initialProps: { val: 'start' },
    });
    rerender({ val: 'end' });
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe('start');
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('end');
  });

  it('works with number values', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 200), {
      initialProps: { val: 0 },
    });
    rerender({ val: 42 });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe(42);
  });
});
