import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, mockRequireAuth } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
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
}));

vi.mock('../../../lib/middleware/auth.js', () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock('../../../lib/response.js', async () => {
  return await vi.importActual('../../../lib/response.js');
});

import { GET } from '../check-slug';

describe('GET /api/v2/onboarding/check-slug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
    mockRequireAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
  });

  it('should return available: true for a valid, unique slug', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/check-slug?slug=newdistrict');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.available).toBe(true);
    expect(data.slug).toBe('newdistrict');
  });

  it('should return 400 when slug query param is missing', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/check-slug');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('slug query parameter is required');
  });

  it('should return available: false when slug is too short', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/check-slug?slug=ab');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.reason).toContain('between 3 and 50 characters');
  });

  it('should return available: false for invalid characters', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/check-slug?slug=UPPER_case!');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.reason).toContain('lowercase letters, numbers, and hyphens');
  });

  it('should return available: false for reserved words', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/check-slug?slug=admin');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.reason).toBe('This URL is reserved');
    expect(data.suggestion).toBe('admin-org');
  });

  it('should return available: false when slug already exists', async () => {
    mockDb.limit.mockResolvedValueOnce([{ id: 'existing-org' }]);

    const req = new Request('http://localhost/api/v2/onboarding/check-slug?slug=westside');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.reason).toBe('This URL is already taken');
    expect(data.suggestion).toBeDefined();
  });

  it('should require authentication', async () => {
    mockRequireAuth.mockRejectedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );

    const req = new Request('http://localhost/api/v2/onboarding/check-slug?slug=test');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should lowercase the slug before checking', async () => {
    const req = new Request('http://localhost/api/v2/onboarding/check-slug?slug=MyDistrict');
    const res = await GET(req);
    const data = await res.json();

    expect(data.slug).toBe('mydistrict');
  });

  it('should return available: false for other reserved slugs', async () => {
    // Only test slugs that are >= 3 chars and match the regex (so they reach the reserved check)
    const reservedSlugs = ['api', 'www', 'app', 'login', 'signup', 'dashboard', 'settings', 'support', 'help'];

    for (const slug of reservedSlugs) {
      const req = new Request(`http://localhost/api/v2/onboarding/check-slug?slug=${slug}`);
      const res = await GET(req);
      const data = await res.json();

      expect(data.available).toBe(false);
      expect(data.reason).toBe('This URL is reserved');
    }
  });

  it('should handle internal server errors gracefully', async () => {
    mockDb.limit.mockRejectedValueOnce(new Error('Database connection lost'));

    const req = new Request('http://localhost/api/v2/onboarding/check-slug?slug=testdistrict');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Database connection lost');
  });
});
