import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, mockRequireOrgMember } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
  };
  const mockRequireOrgMember = vi.fn().mockResolvedValue({
    user: { id: 'user-1' },
    session: { id: 'session-1' },
    organization: { id: 'org-1', slug: 'test-org' },
    membership: { id: 'mem-1', role: 'editor' },
    role: 'editor',
  });
  return { mockDb, mockRequireOrgMember };
});

vi.mock('../../../lib/db.js', () => ({ db: mockDb }));
vi.mock('../../../lib/schema/index.js', () => ({
  widgets: {
    id: 'id',
    organizationId: 'organizationId',
    type: 'type',
    title: 'title',
    isActive: 'isActive',
    position: 'position',
    planId: 'planId',
  },
  organizations: { id: 'id', slug: 'slug' },
}));
vi.mock('../../../lib/middleware/auth.js', () => ({
  requireOrgMember: mockRequireOrgMember,
}));
vi.mock('../../../lib/response.js', async () => await vi.importActual('../../../lib/response.js'));

import { GET, PUT, DELETE } from '../[id]';

const sampleWidget = {
  id: 'w-1',
  organizationId: 'org-1',
  planId: null,
  type: 'donut',
  title: 'Goal Progress',
  subtitle: null,
  config: {},
  position: 0,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const sampleOrg = {
  id: 'org-1',
  slug: 'test-org',
  name: 'Test Org',
};

describe('GET /api/v2/widgets/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
  });

  it('should return a widget by ID', async () => {
    mockDb.limit.mockResolvedValueOnce([sampleWidget]);

    const req = new Request('http://localhost/api/v2/widgets/w-1');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe('w-1');
    expect(data.organization_id).toBe('org-1');
    expect(data.type).toBe('donut');
  });

  it('should return 404 when widget not found', async () => {
    mockDb.limit.mockResolvedValueOnce([]);

    const req = new Request('http://localhost/api/v2/widgets/nonexistent');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Widget not found');
  });
});

describe('PUT /api/v2/widgets/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();

    // Default: first limit call returns widget, second returns org
    let limitCallCount = 0;
    mockDb.limit.mockImplementation(() => {
      limitCallCount++;
      if (limitCallCount === 1) return Promise.resolve([sampleWidget]);
      if (limitCallCount === 2) return Promise.resolve([sampleOrg]);
      return Promise.resolve([]);
    });

    mockDb.returning.mockResolvedValue([{ ...sampleWidget, title: 'Updated Title' }]);
  });

  it('should update a widget and return 200', async () => {
    const req = new Request('http://localhost/api/v2/widgets/w-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe('Updated Title');
  });

  it('should return 404 when widget not found', async () => {
    mockDb.limit.mockReset();
    mockDb.limit.mockResolvedValue([]);

    const req = new Request('http://localhost/api/v2/widgets/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Widget not found');
  });
});

describe('DELETE /api/v2/widgets/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.delete.mockReturnThis();

    // Default: first limit call returns widget, second returns org
    let limitCallCount = 0;
    mockDb.limit.mockImplementation(() => {
      limitCallCount++;
      if (limitCallCount === 1) return Promise.resolve([sampleWidget]);
      if (limitCallCount === 2) return Promise.resolve([sampleOrg]);
      return Promise.resolve([]);
    });
  });

  it('should delete a widget and return 200', async () => {
    const req = new Request('http://localhost/api/v2/widgets/w-1', {
      method: 'DELETE',
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 404 when widget not found', async () => {
    mockDb.limit.mockReset();
    mockDb.limit.mockResolvedValue([]);

    const req = new Request('http://localhost/api/v2/widgets/nonexistent', {
      method: 'DELETE',
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Widget not found');
  });
});
