import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../../hooks/useToast';

describe('useToast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it('showToast adds a toast with correct message and type', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast('Salvo com sucesso!', 'success'));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Salvo com sucesso!');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('defaults type to "info" when not specified', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast('Info message'));
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('removeToast removes the toast with the given id', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast('Toast A', 'error'));
    const id = result.current.toasts[0].id;
    act(() => result.current.removeToast(id));
    expect(result.current.toasts).toHaveLength(0);
  });

  it('toast auto-removes after 4 seconds', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast('Temporary'));
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.toasts).toHaveLength(0);
  });

  it('multiple toasts can coexist', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('First', 'success');
      result.current.showToast('Second', 'warning');
    });
    expect(result.current.toasts).toHaveLength(2);
  });
});
