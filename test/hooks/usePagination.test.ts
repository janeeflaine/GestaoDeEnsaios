import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../../hooks/usePagination';

const makeItems = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe('usePagination', () => {
  it('returns first page by default', () => {
    const { result } = renderHook(() => usePagination(makeItems(30), 10));
    expect(result.current.page).toBe(1);
    expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('calculates totalPages correctly', () => {
    const { result } = renderHook(() => usePagination(makeItems(25), 10));
    expect(result.current.totalPages).toBe(3);
  });

  it('returns totalPages=1 for empty list', () => {
    const { result } = renderHook(() => usePagination([], 10));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toEqual([]);
  });

  it('hasPrev=false on first page, hasNext=true when there are more pages', () => {
    const { result } = renderHook(() => usePagination(makeItems(20), 10));
    expect(result.current.hasPrev).toBe(false);
    expect(result.current.hasNext).toBe(true);
  });

  it('navigates to next page', () => {
    const { result } = renderHook(() => usePagination(makeItems(20), 10));
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
    expect(result.current.paginatedItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result.current.hasPrev).toBe(true);
    expect(result.current.hasNext).toBe(false);
  });

  it('clamps page to totalPages when items shrink', () => {
    let items = makeItems(30);
    const { result, rerender } = renderHook(({ it }) => usePagination(it, 10), {
      initialProps: { it: items },
    });
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    // Simulate shrinking the list to 5 items
    rerender({ it: makeItems(5) });
    // safePage should clamp to 1
    expect(result.current.page).toBe(1);
  });

  it('returns last partial page correctly', () => {
    const { result } = renderHook(() => usePagination(makeItems(12), 10));
    act(() => result.current.setPage(2));
    expect(result.current.paginatedItems).toEqual([11, 12]);
  });
});
