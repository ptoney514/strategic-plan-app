import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { WidgetConfigPanel } from '../WidgetConfigPanel';
import type { Widget } from '../../../../lib/types/v2';

describe('WidgetConfigPanel', () => {
  it('renders "Configure Widget" heading in create mode', () => {
    render(
      <WidgetConfigPanel type="donut" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Configure Widget')).toBeInTheDocument();
  });

  it('renders "Edit Widget" heading in edit mode', () => {
    const widget: Widget = {
      id: 'w-1',
      organizationId: 'org-1',
      planId: 'plan-1',
      type: 'donut',
      title: 'Existing Widget',
      config: { value: 50, target: 100 },
      position: 0,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };
    render(
      <WidgetConfigPanel type="donut" initialData={widget} onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Edit Widget')).toBeInTheDocument();
  });

  it('renders title and subtitle inputs', () => {
    render(
      <WidgetConfigPanel type="donut" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByPlaceholderText('Widget title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional subtitle')).toBeInTheDocument();
  });

  it('renders "Create Widget" button in create mode', () => {
    render(
      <WidgetConfigPanel type="donut" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Create Widget')).toBeInTheDocument();
  });

  it('renders "Save Changes" button in edit mode', () => {
    const widget: Widget = {
      id: 'w-1',
      organizationId: 'org-1',
      planId: 'plan-1',
      type: 'big-number',
      title: 'Test',
      config: { value: 100 },
      position: 0,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };
    render(
      <WidgetConfigPanel type="big-number" initialData={widget} onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <WidgetConfigPanel type="donut" onSave={vi.fn()} onCancel={onCancel} />
    );
    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables Create Widget button when title is empty', () => {
    render(
      <WidgetConfigPanel type="donut" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Create Widget')).toBeDisabled();
  });

  it('enables Create Widget button after entering title', async () => {
    const user = userEvent.setup();
    render(
      <WidgetConfigPanel type="donut" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    await user.type(screen.getByPlaceholderText('Widget title'), 'My Widget');
    expect(screen.getByText('Create Widget')).not.toBeDisabled();
  });

  it('calls onSave with correct payload on create', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <WidgetConfigPanel type="big-number" onSave={onSave} onCancel={vi.fn()} />
    );
    await user.type(screen.getByPlaceholderText('Widget title'), 'Revenue');
    await user.click(screen.getByText('Create Widget'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Revenue', type: 'big-number' })
    );
  });

  it('renders Preview section', () => {
    render(
      <WidgetConfigPanel type="donut" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders donut-specific fields (Value, Target, Label)', () => {
    render(
      <WidgetConfigPanel type="donut" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('renders big-number-specific fields (Unit, Trend, Direction)', () => {
    render(
      <WidgetConfigPanel type="big-number" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Unit')).toBeInTheDocument();
    expect(screen.getByText('Trend')).toBeInTheDocument();
    expect(screen.getByText('Direction')).toBeInTheDocument();
  });

  it('renders bar-chart-specific fields (Data Points)', () => {
    render(
      <WidgetConfigPanel type="bar-chart" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Data Points')).toBeInTheDocument();
  });

  it('renders pie-breakdown-specific fields (Breakdown Items)', () => {
    render(
      <WidgetConfigPanel type="pie-breakdown" onSave={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Breakdown Items')).toBeInTheDocument();
  });
});
