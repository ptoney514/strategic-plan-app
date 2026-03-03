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

import { PUT } from '../reorder';

describe('PUT /api/v2/widgets/reorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
    mockDb.where.mockResolvedValue([]);
  });

  it('should reorder widgets and return 200', async () => {
    const req = new Request('http://localhost/api/v2/widgets/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgSlug: 'test-org',
        widgets: [
          { id: 'w-1', position: 0 },
          { id: 'w-2', position: 1 },
          { id: 'w-3', position: 2 },
        ],
      }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockRequireOrgMember).toHaveBeenCalledWith(req, 'test-org', 'editor');
  });

  it('should return 400 when orgSlug is missing', async () => {
    const req = new Request('http://localhost/api/v2/widgets/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        widgets: [{ id: 'w-1', position: 0 }],
      }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('orgSlug is required');
  });

  it('should return 400 when widgets array is missing', async () => {
    const req = new Request('http://localhost/api/v2/widgets/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgSlug: 'test-org',
      }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('widgets array is required');
  });
});
