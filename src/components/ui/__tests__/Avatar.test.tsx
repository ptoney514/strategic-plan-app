import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  describe('initials generation', () => {
    it('generates two-letter initials from first and last name', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('generates initials from single word name', () => {
      render(<Avatar name="Admin" />);
      expect(screen.getByText('AD')).toBeInTheDocument();
    });

    it('handles names with multiple words by using first and last', () => {
      render(<Avatar name="Mary Jane Watson" />);
      expect(screen.getByText('MW')).toBeInTheDocument();
    });

    it('handles empty string name with fallback', () => {
      render(<Avatar name="" />);
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('handles whitespace-only name with fallback', () => {
      render(<Avatar name="   " />);
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('converts initials to uppercase', () => {
      render(<Avatar name="john doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('sizing', () => {
    it('renders small size with correct classes', () => {
      render(<Avatar name="Test User" size="sm" />);
      const avatar = screen.getByLabelText('Test User');
      expect(avatar).toHaveClass('w-7', 'h-7', 'text-xs');
    });

    it('renders medium size by default', () => {
      render(<Avatar name="Test User" />);
      const avatar = screen.getByLabelText('Test User');
      expect(avatar).toHaveClass('w-9', 'h-9', 'text-sm');
    });

    it('renders large size with correct classes', () => {
      render(<Avatar name="Test User" size="lg" />);
      const avatar = screen.getByLabelText('Test User');
      expect(avatar).toHaveClass('w-12', 'h-12', 'text-base');
    });
  });

  describe('styling', () => {
    it('applies amber color scheme', () => {
      render(<Avatar name="Test" />);
      const avatar = screen.getByLabelText('Test');
      expect(avatar).toHaveClass('bg-amber-100', 'text-amber-700');
    });

    it('applies rounded-full for circular shape', () => {
      render(<Avatar name="Test" />);
      const avatar = screen.getByLabelText('Test');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('applies custom className', () => {
      render(<Avatar name="Test" className="custom-class" />);
      const avatar = screen.getByLabelText('Test');
      expect(avatar).toHaveClass('custom-class');
    });
  });

  describe('image avatar', () => {
    it('renders image when src is provided', () => {
      render(<Avatar name="Test User" src="https://example.com/avatar.jpg" />);
      const img = screen.getByRole('img', { name: 'Test User' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('does not show initials when image src is provided', () => {
      render(<Avatar name="Test User" src="https://example.com/avatar.jpg" />);
      expect(screen.queryByText('TU')).not.toBeInTheDocument();
    });

    it('applies correct image classes', () => {
      render(<Avatar name="Test User" src="https://example.com/avatar.jpg" size="lg" />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('rounded-full', 'object-cover', 'w-12', 'h-12');
    });
  });

  describe('accessibility', () => {
    it('has aria-label with name for initials avatar', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
    });

    it('has alt text for image avatar', () => {
      render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />);
      expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    });
  });
});
