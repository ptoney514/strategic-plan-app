import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/setup';
import { LandingObjectiveCard } from '../LandingObjectiveCard';

describe('LandingObjectiveCard', () => {
  it('renders as a full-width button that remains clickable with long copy', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <LandingObjectiveCard
        testId="objective-card-1"
        title="Student achievement and well-being"
        description="Ensure all students achieve academic excellence and develop social-emotional well-being through a coherent districtwide support model."
        icon="menu_book"
        iconBgClass="bg-violet-100 text-violet-600"
        statusBadge={{ label: 'On Track', classes: 'bg-emerald-50 text-emerald-700' }}
        statusDots={[
          { color: 'bg-emerald-500' },
          { color: 'bg-emerald-500' },
          { color: 'bg-amber-500' },
          { color: 'bg-red-500' },
        ]}
        goalCount={4}
        onTargetCount={2}
        offTrackCount={2}
        onClick={onClick}
      />,
    );

    const card = screen.getByTestId('objective-card-1');
    expect(card.tagName).toBe('BUTTON');
    expect(card).toHaveClass('w-full');
    expect(card).toHaveClass('text-left');
    expect(screen.getByText(/2 on target/i)).toBeInTheDocument();

    await user.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
