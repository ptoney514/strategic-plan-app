import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, mockRequireAuth } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
  };
  const mockRequireAuth = vi.fn().mockResolvedValue({
    user: { id: 'user-1', email: 'test@example.com' },
    session: { id: 'session-1' },
  });
  return { mockDb, mockRequireAuth };
});

vi.mock('../../../lib/db.js', () => ({
  db: mockDb,
}));

vi.mock('../../../lib/schema/index.js', () => ({
  organizations: {
    id: 'id',
    slug: 'slug',
  },
  organizationMembers: {
    id: 'id',
    organizationId: 'organizationId',
    userId: 'userId',
    role: 'role',
  },
}));

vi.mock('../../../lib/middleware/auth.js', () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock('../../../lib/response.js', async () => {
  return await vi.importActual('../../../lib/response.js');
});

import { POST } from '../complete';

describe('POST /api/v2/onboarding/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
    mockRequireAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });

    // Default: user is owner of the org
    mockDb.limit.mockResolvedValue([{
      id: 'mem-1',
      organizationId: 'org-1',
      userId: 'user-1',
      role: 'owner',
    }]);

    // Default: update returns the updated org
    mockDb.returning.mockResolvedValue([{
      id: 'org-1',
      name: 'Test Org',
      slug: 'test-org',
      entityType: 'school_district',
      primaryColor: '#0099CC',
      secondaryColor: null,
      logoUrl: null,
      dashboardTemplate: 'hierarchical',
      onboardingCompleted: true,
    }]);
  });

  it('should complete onboarding and return 200', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: 'org-1' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.organization.id).toBe('org-1');
    expect(data.organization.onboarding_completed).toBe(true);
  });

  it('should return 403 when user is not the owner', async () => {
    mockDb.limit.mockResolvedValueOnce([]);

    const req = new Request('http://localhost/api/v2/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: 'org-1' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain('owner');
  });

  it('should return 400 when organization_id is missing', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('organization_id is required');
  });

  it('should accept optional branding fields', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: 'org-1',
        primary_color: '#FF0000',
        secondary_color: '#00FF00',
        logo_url: 'https://example.com/logo.png',
        dashboard_template: 'scorecard',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({
        onboardingCompleted: true,
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00',
        logoUrl: 'https://example.com/logo.png',
        dashboardTemplate: 'scorecard',
      }),
    );
  });

  it('should require authentication', async () => {
    mockRequireAuth.mockRejectedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );

    const req = new Request('http://localhost/api/v2/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: 'org-1' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should accept camelCase organizationId', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: 'org-1' }),
    });

    const res = await POST(req);

    expect(res.status).not.toBe(400);
  });

  it('should set onboardingCompleted to true even without optional fields', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: 'org-1' }),
    });

    await POST(req);

    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({
        onboardingCompleted: true,
      }),
    );
  });

  it('should handle database errors gracefully', async () => {
    mockDb.returning.mockRejectedValueOnce(new Error('Database timeout'));

    const req = new Request('http://localhost/api/v2/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: 'org-1' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Database timeout');
  });
});
