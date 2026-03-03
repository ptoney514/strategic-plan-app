import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { ImportReviewTable } from '../ImportReviewTable';
import type { StagedGoal } from '@/lib/types/import.types';

// Mock StagedDataTable to isolate ImportReviewTable logic
vi.mock('@/components/import/StagedDataTable', () => ({
  StagedDataTable: ({ data }: { data: StagedGoal[] }) => (
    <div data-testid="staged-data-table">
      {data.length} goals staged
    </div>
  ),
}));

const makeStagedGoal = (overrides: Partial<StagedGoal> = {}): StagedGoal => ({
  id: 'goal-1',
  import_session_id: 'session-1',
  row_number: 1,
  raw_data: {},
  goal_number: '1',
  title: 'Test Goal',
  level: 0,
  validation_status: 'valid',
  validation_messages: [],
  is_mapped: false,
  action: 'create',
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
  ...overrides,
});

describe('ImportReviewTable', () => {
  const defaultProps = {
    stagedGoals: [makeStagedGoal()],
    onToggleImport: vi.fn(),
    onToggleImportAll: vi.fn(),
    onFix: vi.fn(),
    onBulkAutoFix: vi.fn(),
    validCount: 3,
    fixableCount: 2,
    errorCount: 1,
  };

  it('renders validation summary with correct counts', () => {
    render(<ImportReviewTable {...defaultProps} />);

    const summary = screen.getByTestId('validation-summary');
    expect(summary).toHaveTextContent('3 valid');
    expect(summary).toHaveTextContent('2 fixable');
    expect(summary).toHaveTextContent('1 errors');
  });

  it('shows auto-fix button when fixableCount > 0', () => {
    render(<ImportReviewTable {...defaultProps} fixableCount={5} />);

    expect(screen.getByTestId('auto-fix-all-btn')).toBeInTheDocument();
    expect(screen.getByTestId('auto-fix-all-btn')).toHaveTextContent('Auto-fix all (5)');
  });

  it('hides auto-fix button when fixableCount === 0', () => {
    render(<ImportReviewTable {...defaultProps} fixableCount={0} />);

    expect(screen.queryByTestId('auto-fix-all-btn')).not.toBeInTheDocument();
  });

  it('calls onBulkAutoFix when button clicked', async () => {
    const onBulkAutoFix = vi.fn();
    render(<ImportReviewTable {...defaultProps} onBulkAutoFix={onBulkAutoFix} />);

    await userEvent.click(screen.getByTestId('auto-fix-all-btn'));

    expect(onBulkAutoFix).toHaveBeenCalledTimes(1);
  });

  it('renders StagedDataTable with goals data', () => {
    render(<ImportReviewTable {...defaultProps} />);

    expect(screen.getByTestId('staged-data-table')).toHaveTextContent('1 goals staged');
  });
});
