import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { GoalRow } from '../GoalRow';

const defaultProps = {
  goalNumber: '1.1',
  title: 'Reading Proficiency',
  description: 'Improve reading scores across all grade levels',
  status: 'in_progress',
  primaryColor: '#1e3a5f',
};

describe('GoalRow', () => {
  it('renders goal number in badge', () => {
    render(<GoalRow {...defaultProps} />);
    expect(screen.getByText('1.1')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<GoalRow {...defaultProps} />);
    expect(screen.getByText('Reading Proficiency')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<GoalRow {...defaultProps} />);
    expect(screen.getByText('Improve reading scores across all grade levels')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<GoalRow {...defaultProps} description={undefined} />);
    expect(screen.queryByText('Improve reading scores across all grade levels')).not.toBeInTheDocument();
  });

  it('applies primaryColor to badge', () => {
    render(<GoalRow {...defaultProps} primaryColor="#ff0000" />);
    const badge = screen.getByText('1.1');
    expect(badge).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('has default color when no primaryColor', () => {
    render(<GoalRow {...defaultProps} primaryColor={undefined} />);
    const badge = screen.getByText('1.1');
    expect(badge).toHaveStyle({ backgroundColor: '#1e293b' });
  });
});
