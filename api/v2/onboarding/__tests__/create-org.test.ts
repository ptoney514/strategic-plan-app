import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, mockRequireAuth } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockReturnThis(),
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
  plans: {
    id: 'id',
    organizationId: 'organizationId',
  },
}));

vi.mock('../../../lib/middleware/auth.js', () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock('../../../lib/response.js', async () => {
  return await vi.importActual('../../../lib/response.js');
});

import { POST } from '../create-org';

describe('POST /api/v2/onboarding/create-org', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockReturnThis();
    mockDb.delete.mockReturnThis();
    mockRequireAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });

    mockDb.returning.mockReset();

    // Default returning chain: org insert, membership insert, plan insert
    let insertCallCount = 0;
    mockDb.returning.mockImplementation(() => {
      insertCallCount++;
      if (insertCallCount === 1) {
        return Promise.resolve([{
          id: 'org-1',
          name: 'Test Org',
          slug: 'test-org',
          entityType: 'school_district',
          dashboardTemplate: 'hierarchical',
          primaryColor: '#0099CC',
          secondaryColor: null,
          logoUrl: null,
          createdBy: 'user-1',
          onboardingCompleted: false,
        }]);
      }
      if (insertCallCount === 2) {
        return Promise.resolve([{ id: 'mem-1', role: 'owner' }]);
      }
      return Promise.resolve([{ id: 'plan-1', name: 'Strategic Plan', slug: 'strategic-plan' }]);
    });
  });

  it('should create an organization and return 201', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'test-org',
        entity_type: 'school_district',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.organization.id).toBe('org-1');
    expect(data.organization.slug).toBe('test-org');
    expect(data.plan.id).toBe('plan-1');
    expect(data.membership.role).toBe('owner');
  });

  it('should return 400 when name is missing', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'test-org',
        entity_type: 'school_district',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('name is required');
  });

  it('should return 400 when entity_type is missing', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'test-org',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('entity_type is required');
  });

  it('should return 400 when slug is too short', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'ab',
        entity_type: 'school_district',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('between 3 and 50 characters');
  });

  it('should return 400 for invalid slug format', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'INVALID_SLUG!',
        entity_type: 'school_district',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('lowercase letters, numbers, and hyphens');
  });

  it('should return 409 when slug already exists', async () => {
    mockDb.limit.mockResolvedValueOnce([{ id: 'existing-org' }]);

    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'existing-slug',
        entity_type: 'school_district',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toContain('already exists');
  });

  it('should return 400 when user has too many orgs', async () => {
    // slug check: db.select().from().where().limit(1) → no match
    mockDb.limit.mockResolvedValueOnce([]);

    // org count: db.select().from(organizationMembers).where(and(...)) → 5 orgs
    // where() is the terminal call here (no .limit()), so use mockImplementation
    // to return mockDb on first call (slug check chain) and array on second (org count)
    let whereCallCount = 0;
    mockDb.where.mockImplementation(() => {
      whereCallCount++;
      if (whereCallCount === 2) {
        return Promise.resolve([
          { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' },
        ]);
      }
      return mockDb; // for chaining .limit()
    });

    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'test-org',
        entity_type: 'school_district',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('maximum number of organizations');
  });

  it('should require authentication', async () => {
    mockRequireAuth.mockRejectedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );

    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'test-org',
        entity_type: 'school_district',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should accept camelCase field names', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'test-org',
        entityType: 'school_district',
        dashboardTemplate: 'hierarchical',
        primaryColor: '#FF0000',
      }),
    });

    const res = await POST(req);

    expect(res.status).not.toBe(400);
  });

  it('should use default primary color when none provided', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'test-org',
        entity_type: 'school_district',
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        primaryColor: '#0099CC',
      }),
    );
  });

  it('should auto-generate slug from name when slug is not provided', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'My Great District',
        entity_type: 'school_district',
      }),
    });

    await POST(req);

    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'my-great-district',
      }),
    );
  });

  it('should default dashboard_template to hierarchical', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Org',
        slug: 'test-org',
        entity_type: 'school_district',
      }),
    });

    await POST(req);

    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardTemplate: 'hierarchical',
      }),
    );
  });
});
