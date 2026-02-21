import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserRoleBadge } from '../UserRoleBadge';

describe('UserRoleBadge', () => {
  it('renders system_admin badge with correct label and styling', () => {
    render(<UserRoleBadge role="system_admin" />);
    const badge = screen.getByText('System Admin');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-amber-100', 'text-amber-800');
  });

  it('renders district_admin badge with correct label and styling', () => {
    render(<UserRoleBadge role="district_admin" />);
    const badge = screen.getByText('District Admin');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('renders school_admin badge with correct label and styling', () => {
    render(<UserRoleBadge role="school_admin" />);
    const badge = screen.getByText('School Admin');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('renders editor badge with correct label and styling', () => {
    render(<UserRoleBadge role="editor" />);
    const badge = screen.getByText('Editor');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-600');
  });

  it('renders viewer badge with correct label and styling', () => {
    render(<UserRoleBadge role="viewer" />);
    const badge = screen.getByText('Viewer');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-slate-100', 'text-slate-500');
  });

  it('renders unknown role with fallback styling instead of crashing', () => {
    // @ts-expect-error — testing runtime safety for unexpected role values
    render(<UserRoleBadge role="unexpected_role" />);
    const badge = screen.getByText('Unknown');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-slate-100', 'text-slate-500');
  });

  it('applies common badge styles', () => {
    render(<UserRoleBadge role="system_admin" />);
    const badge = screen.getByText('System Admin');
    expect(badge).toHaveClass('rounded-full', 'text-xs', 'font-medium');
  });
});
