import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  describe('default icon display', () => {
    it('renders User icon when no src is provided', () => {
      render(<Avatar name="John Doe" />);
      // The avatar should have a User icon from Lucide
      const avatar = screen.getByLabelText('John Doe');
      expect(avatar).toBeInTheDocument();
      // Check for the svg element (User icon)
      expect(avatar.querySelector('svg')).toBeInTheDocument();
    });

    it('renders User icon even with empty name', () => {
      render(<Avatar name="" />);
      const avatar = screen.getByLabelText('User avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar.querySelector('svg')).toBeInTheDocument();
    });

    it('renders User icon with no name prop', () => {
      render(<Avatar />);
      const avatar = screen.getByLabelText('User avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('sizing', () => {
    it('renders small size with correct classes', () => {
      render(<Avatar name="Test User" size="sm" />);
      const avatar = screen.getByLabelText('Test User');
      expect(avatar).toHaveClass('w-7', 'h-7');
    });

    it('renders medium size by default', () => {
      render(<Avatar name="Test User" />);
      const avatar = screen.getByLabelText('Test User');
      expect(avatar).toHaveClass('w-9', 'h-9');
    });

    it('renders large size with correct classes', () => {
      render(<Avatar name="Test User" size="lg" />);
      const avatar = screen.getByLabelText('Test User');
      expect(avatar).toHaveClass('w-12', 'h-12');
    });
  });

  describe('styling', () => {
    it('applies slate color scheme for light and dark mode', () => {
      render(<Avatar name="Test" />);
      const avatar = screen.getByLabelText('Test');
      expect(avatar).toHaveClass('bg-slate-200', 'dark:bg-slate-700');
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

    it('does not show User icon when image src is provided', () => {
      render(<Avatar name="Test User" src="https://example.com/avatar.jpg" />);
      // Should not find the div with User icon
      expect(screen.queryByLabelText('Test User')).not.toBeInTheDocument();
      // Should find the image instead
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('applies correct image classes', () => {
      render(<Avatar name="Test User" src="https://example.com/avatar.jpg" size="lg" />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('rounded-full', 'object-cover', 'w-12', 'h-12');
    });
  });

  describe('accessibility', () => {
    it('has aria-label with name for icon avatar', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
    });

    it('has fallback aria-label when no name provided', () => {
      render(<Avatar />);
      expect(screen.getByLabelText('User avatar')).toBeInTheDocument();
    });

    it('has alt text for image avatar', () => {
      render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />);
      expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    });
  });
});
