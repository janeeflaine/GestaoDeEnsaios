import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../../components/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} totalItems={5} pageSize={10} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows item range text', () => {
    render(
      <Pagination page={1} totalPages={3} onPageChange={vi.fn()} totalItems={25} pageSize={10} />
    );
    expect(screen.getByText('1–10 de 25')).toBeInTheDocument();
  });

  it('shows correct range on second page', () => {
    render(
      <Pagination page={2} totalPages={3} onPageChange={vi.fn()} totalItems={25} pageSize={10} />
    );
    expect(screen.getByText('11–20 de 25')).toBeInTheDocument();
  });

  it('shows correct range on last partial page', () => {
    render(
      <Pagination page={3} totalPages={3} onPageChange={vi.fn()} totalItems={25} pageSize={10} />
    );
    expect(screen.getByText('21–25 de 25')).toBeInTheDocument();
  });

  it('calls onPageChange with next page when clicking next', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={3} onPageChange={onPageChange} totalItems={25} pageSize={10} />
    );
    const buttons = screen.getAllByRole('button');
    // Last button = ChevronRight (next)
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with previous page when clicking prev', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={2} totalPages={3} onPageChange={onPageChange} totalItems={25} pageSize={10} />
    );
    const buttons = screen.getAllByRole('button');
    // First button = ChevronLeft (prev)
    fireEvent.click(buttons[0]);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('prev button is disabled on first page', () => {
    render(
      <Pagination page={1} totalPages={3} onPageChange={vi.fn()} totalItems={25} pageSize={10} />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('next button is disabled on last page', () => {
    render(
      <Pagination page={3} totalPages={3} onPageChange={vi.fn()} totalItems={25} pageSize={10} />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it('clicking a page number calls onPageChange', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={3} onPageChange={onPageChange} totalItems={25} pageSize={10} />
    );
    fireEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
