import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { ImportSummaryCard } from '../ImportSummaryCard';

describe('ImportSummaryCard', () => {
  const defaultProps = {
    goalsImported: 15,
    goalsSkipped: 3,
    planName: 'Strategic Plan 2025',
    onViewGoals: vi.fn(),
    onImportAnother: vi.fn(),
  };

  it('renders "Import Complete" heading', () => {
    render(<ImportSummaryCard {...defaultProps} />);

    expect(screen.getByText('Import Complete')).toBeInTheDocument();
  });

  it('shows correct import/skip counts', () => {
    render(<ImportSummaryCard {...defaultProps} />);

    expect(screen.getByText('15 goals imported')).toBeInTheDocument();
    expect(screen.getByText('3 goals skipped')).toBeInTheDocument();
  });

  it('shows plan name', () => {
    render(<ImportSummaryCard {...defaultProps} />);

    expect(screen.getByText('Strategic Plan 2025')).toBeInTheDocument();
  });

  it('calls onViewGoals and onImportAnother on button clicks', async () => {
    const onViewGoals = vi.fn();
    const onImportAnother = vi.fn();
    render(
      <ImportSummaryCard
        {...defaultProps}
        onViewGoals={onViewGoals}
        onImportAnother={onImportAnother}
      />
    );

    await userEvent.click(screen.getByText('View Goals'));
    expect(onViewGoals).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByText('Import Another'));
    expect(onImportAnother).toHaveBeenCalledTimes(1);
  });
});
