import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DistrictGridItem } from '../DistrictGridItem';
import type { DistrictWithStats } from '../../../../lib/services/systemAdmin.service';

const mockDistrict: DistrictWithStats = {
  id: '123',
  name: 'Westside Community Schools',
  slug: 'westside',
  tagline: 'Community. Innovation. Excellence.',
  is_public: true,
  primary_color: '#C03537',
  logo_url: undefined,
  goals_count: 15,
  schools_count: 0,
  users_count: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('DistrictGridItem', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location for localhost
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        port: '5173',
        protocol: 'http:',
        search: '?subdomain=admin',
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('renders district name and stats', () => {
    render(<DistrictGridItem district={mockDistrict} />);

    expect(screen.getByText('Westside Community Schools')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // goals
    expect(screen.getByText('westside')).toBeInTheDocument(); // slug
  });

  it('renders admin link with correct subdomain URL for localhost', () => {
    render(<DistrictGridItem district={mockDistrict} />);

    const adminLink = screen.getByTitle('Open district admin');
    expect(adminLink).toHaveAttribute(
      'href',
      'http://localhost:5173/admin?subdomain=westside'
    );
  });

  it('renders public badge when district is public', () => {
    render(<DistrictGridItem district={mockDistrict} />);
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('renders private badge when district is not public', () => {
    render(<DistrictGridItem district={{ ...mockDistrict, is_public: false }} />);
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('renders admin link with correct subdomain URL for production', () => {
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'admin.stratadash.org',
        port: '',
        protocol: 'https:',
        search: '',
      },
      writable: true,
    });

    render(<DistrictGridItem district={mockDistrict} />);

    const adminLink = screen.getByTitle('Open district admin');
    expect(adminLink).toHaveAttribute(
      'href',
      'https://westside.stratadash.org/admin'
    );
  });

  it('renders logo when logo_url is provided', () => {
    render(
      <DistrictGridItem
        district={{ ...mockDistrict, logo_url: 'https://example.com/logo.png' }}
      />
    );

    // Logo has alt="" for decorative purposes, so query by tag
    const logo = document.querySelector('img[src="https://example.com/logo.png"]');
    expect(logo).toBeInTheDocument();
  });

  it('renders initial letter when no logo is provided', () => {
    render(<DistrictGridItem district={mockDistrict} />);
    expect(screen.getByText('W')).toBeInTheDocument();
  });
});
