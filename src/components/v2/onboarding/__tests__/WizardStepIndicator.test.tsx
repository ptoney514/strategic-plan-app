import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { WizardStepIndicator } from '../WizardStepIndicator';

describe('WizardStepIndicator', () => {
  it('renders all four step labels', () => {
    render(<WizardStepIndicator currentStep={1} />);

    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Your Org')).toBeInTheDocument();
    expect(screen.getByText('Template')).toBeInTheDocument();
    expect(screen.getByText('Brand')).toBeInTheDocument();
  });

  it('highlights step 1 as active when currentStep is 1', () => {
    render(<WizardStepIndicator currentStep={1} />);

    // Step 1 should show number "1" (active steps show their number)
    expect(screen.getByText('1')).toBeInTheDocument();
    // Steps 2-4 should show their numbers as future steps
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows step 1 as completed when currentStep is 2', () => {
    const { container } = render(<WizardStepIndicator currentStep={2} />);

    // Step circles have .rounded-full — completed circles are bg-green-500
    const completedCircles = container.querySelectorAll('.rounded-full.bg-green-500');
    expect(completedCircles.length).toBe(1);

    // Step 2 should be active (blue)
    const activeCircles = container.querySelectorAll('.rounded-full.bg-blue-500');
    expect(activeCircles.length).toBe(1);
  });

  it('shows steps 1-2 as completed when currentStep is 3', () => {
    const { container } = render(<WizardStepIndicator currentStep={3} />);

    // 2 completed step circles
    const completedCircles = container.querySelectorAll('.rounded-full.bg-green-500');
    expect(completedCircles.length).toBe(2);

    // 1 active step circle
    const activeCircles = container.querySelectorAll('.rounded-full.bg-blue-500');
    expect(activeCircles.length).toBe(1);
  });

  it('shows connector lines between steps', () => {
    const { container } = render(<WizardStepIndicator currentStep={1} />);

    // 3 connector lines (between 4 steps)
    const connectors = container.querySelectorAll('.h-0\\.5');
    expect(connectors.length).toBe(3);
  });

  it('shows green connector for completed steps', () => {
    const { container } = render(<WizardStepIndicator currentStep={3} />);

    const greenConnectors = container.querySelectorAll('.h-0\\.5.bg-green-500');
    expect(greenConnectors.length).toBe(2);
  });
});
