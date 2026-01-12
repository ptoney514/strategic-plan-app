import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCardsGrid } from '../StatsCardsGrid';

describe('StatsCardsGrid', () => {
  const defaultProps = {
    totalDistricts: 5,
    totalGoals: 25,
    totalUsers: 50,
    totalSchools: 15,
  };

  it('renders all four stat cards', () => {
    render(<StatsCardsGrid {...defaultProps} />);

    expect(screen.getByText('Total Districts')).toBeInTheDocument();
    expect(screen.getByText('Total Goals')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Schools')).toBeInTheDocument();
  });

  it('displays correct values for each stat', () => {
    render(<StatsCardsGrid {...defaultProps} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    render(
      <StatsCardsGrid
        totalDistricts={0}
        totalGoals={0}
        totalUsers={0}
        totalSchools={0}
      />
    );

    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(4);
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<StatsCardsGrid {...defaultProps} isLoading={true} />);

    // Should not display values when loading
    expect(screen.queryByText('5')).not.toBeInTheDocument();
    expect(screen.queryByText('25')).not.toBeInTheDocument();

    // Should still display labels
    expect(screen.getByText('Total Districts')).toBeInTheDocument();
  });

  it('renders the correct number of stat cards', () => {
    render(<StatsCardsGrid {...defaultProps} />);

    const cards = screen.getAllByTestId('stats-card');
    expect(cards).toHaveLength(4);
  });
});
