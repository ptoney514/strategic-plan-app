import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{ id: 'org-1' }]),
  };
  return { mockDb };
});

vi.mock('../../lib/sentry.js', () => ({}));

vi.mock('../../lib/db.js', () => ({
  db: mockDb,
}));

vi.mock('../../lib/schema/index.js', () => ({
  organizations: { id: 'id' },
}));

import { GET } from '../health';

describe('GET /api/v2/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.limit.mockResolvedValue([{ id: 'org-1' }]);
  });

  it('should return 200 with ok status when database is healthy', async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.version).toBe('v2');
  });

  it('should include database latency in checks', async () => {
    const res = await GET();
    const data = await res.json();

    expect(data.checks.database.status).toBe('ok');
    expect(typeof data.checks.database.latencyMs).toBe('number');
    expect(data.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should return 503 when database query fails', async () => {
    mockDb.limit.mockRejectedValueOnce(new Error('Connection refused'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.status).toBe('error');
    expect(data.checks.database.status).toBe('error');
    expect(data.checks.database.error).toBe('Connection refused');
  });

  it('should include timestamp and uptime in response', async () => {
    const res = await GET();
    const data = await res.json();

    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).getTime()).not.toBeNaN();
    expect(typeof data.uptime).toBe('number');
  });
});
