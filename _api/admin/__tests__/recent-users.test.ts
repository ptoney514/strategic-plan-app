import { describe, it, expect, vi } from 'vitest';

// Mock db and auth to prevent neon()/BetterAuth init errors at import time
vi.mock('../../lib/db.js', () => ({ db: {} }));
vi.mock('../../lib/middleware/auth.js', () => ({ requireSystemAdmin: vi.fn() }));

import { toDisplayRole } from '../recent-users';

describe('toDisplayRole', () => {
  it('returns system_admin when user is a system admin', () => {
    expect(toDisplayRole(true, null)).toBe('system_admin');
    expect(toDisplayRole(true, 'admin')).toBe('system_admin');
    expect(toDisplayRole(true, 'viewer')).toBe('system_admin');
  });

  it('returns viewer when memberRole is null (no org membership)', () => {
    expect(toDisplayRole(false, null)).toBe('viewer');
  });

  it('maps owner org role to district_admin', () => {
    expect(toDisplayRole(false, 'owner')).toBe('district_admin');
  });

  it('maps admin org role to district_admin', () => {
    expect(toDisplayRole(false, 'admin')).toBe('district_admin');
  });

  it('maps editor org role to editor', () => {
    expect(toDisplayRole(false, 'editor')).toBe('editor');
  });

  it('maps viewer org role to viewer', () => {
    expect(toDisplayRole(false, 'viewer')).toBe('viewer');
  });

  it('defaults unknown roles to viewer', () => {
    expect(toDisplayRole(false, 'some_unknown_role')).toBe('viewer');
  });
});
