import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LargeEventCardSkeleton,
  SmallEventCardSkeleton,
  StatCardSkeleton,
  ListRowSkeleton,
} from '../../components/SkeletonCard';

describe('SkeletonCard components', () => {
  it('LargeEventCardSkeleton renders without crashing', () => {
    const { container } = render(<LargeEventCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('SmallEventCardSkeleton renders without crashing', () => {
    const { container } = render(<SmallEventCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('StatCardSkeleton renders without crashing', () => {
    const { container } = render(<StatCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('ListRowSkeleton renders without crashing', () => {
    const { container } = render(<ListRowSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('skeleton elements have animate-pulse class', () => {
    const { container } = render(<StatCardSkeleton />);
    const animated = container.querySelectorAll('.animate-pulse');
    expect(animated.length).toBeGreaterThan(0);
  });
});
