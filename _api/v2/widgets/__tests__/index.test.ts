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

import { GET, POST } from '../index';

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

describe('GET /api/v2/widgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
    mockDb.orderBy.mockResolvedValue([]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockReturnThis();
    mockDb.returning.mockResolvedValue([]);
  });

  it('should return widgets for an organization', async () => {
    mockDb.orderBy.mockResolvedValueOnce([sampleWidget]);

    const req = new Request('http://localhost/api/v2/widgets?orgSlug=test-org');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('w-1');
    expect(data[0].organizationId).toBe('org-1');
    expect(data[0].type).toBe('donut');
  });

  it('should return 400 when orgSlug is missing', async () => {
    const req = new Request('http://localhost/api/v2/widgets');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('orgSlug is required');
  });

  it('should return empty array when no widgets exist', async () => {
    mockDb.orderBy.mockResolvedValueOnce([]);

    const req = new Request('http://localhost/api/v2/widgets?orgSlug=test-org');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });
});

describe('POST /api/v2/widgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockReturnThis();
    mockDb.orderBy.mockResolvedValue([]);

    // max position query returns null (no existing widgets)
    mockDb.where.mockResolvedValueOnce([{ maxPos: null }]);

    mockDb.returning.mockResolvedValue([{
      ...sampleWidget,
      id: 'w-new',
    }]);
  });

  it('should create a widget and return 201', async () => {
    const req = new Request('http://localhost/api/v2/widgets?orgSlug=test-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'donut', title: 'Goal Progress' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.id).toBe('w-new');
    expect(data.type).toBe('donut');
  });

  it('should return 400 when orgSlug is missing', async () => {
    const req = new Request('http://localhost/api/v2/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'donut', title: 'Test' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('orgSlug is required');
  });

  it('should return 400 when type is missing', async () => {
    const req = new Request('http://localhost/api/v2/widgets?orgSlug=test-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('type must be one of');
  });

  it('should return 400 when title is missing', async () => {
    const req = new Request('http://localhost/api/v2/widgets?orgSlug=test-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'donut' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('title is required');
  });

  it('should return 400 for invalid widget type', async () => {
    const req = new Request('http://localhost/api/v2/widgets?orgSlug=test-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'invalid-type', title: 'Test' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('type must be one of');
  });

  it('should auto-assign position based on max existing', async () => {
    // Override: max position query returns 3
    mockDb.where.mockReset();
    mockDb.where.mockResolvedValueOnce([{ maxPos: 3 }]);

    const req = new Request('http://localhost/api/v2/widgets?orgSlug=test-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'donut', title: 'Test' }),
    });

    await POST(req);

    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({ position: 4 }),
    );
  });
});
