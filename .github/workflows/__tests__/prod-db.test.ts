import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WORKFLOW_PATH = resolve(__dirname, '..', 'prod-db.yml');

describe('prod-db.yml workflow (Issue #166 — gate prod deploys on Neon migration status)', () => {
  it('exists at .github/workflows/prod-db.yml', () => {
    expect(existsSync(WORKFLOW_PATH)).toBe(true);
  });

  describe('contents', () => {
    const yaml = existsSync(WORKFLOW_PATH) ? readFileSync(WORKFLOW_PATH, 'utf-8') : '';

    it('triggers on push to main', () => {
      expect(yaml).toMatch(/on:\s*[\s\S]*push:\s*[\s\S]*branches:\s*\[\s*main\s*\]/);
    });

    it('only runs when migrations or schema actually change (paths filter)', () => {
      expect(yaml).toContain('drizzle/migrations/**');
      expect(yaml).toContain('drizzle/custom/**');
      expect(yaml).toContain('_api/lib/schema/**');
    });

    it('supports manual replay via workflow_dispatch', () => {
      expect(yaml).toContain('workflow_dispatch');
    });

    it('serializes prod migration runs (concurrency group, no cancel)', () => {
      expect(yaml).toMatch(/concurrency:\s*[\s\S]*group:\s*prod-db-migrate/);
      expect(yaml).toMatch(/cancel-in-progress:\s*false/);
    });

    it('uses the Production GitHub environment for secret scoping + future approval rules', () => {
      expect(yaml).toMatch(/environment:\s*Production/);
    });

    it('runs drizzle-kit migrate against secrets.DATABASE_URL', () => {
      expect(yaml).toContain('npx drizzle-kit migrate');
      expect(yaml).toContain('${{ secrets.DATABASE_URL }}');
    });

    it('applies the updated_at trigger SQL (idempotent)', () => {
      expect(yaml).toContain('drizzle/custom/0001_updated_at_trigger.sql');
    });

    it('opens a labeled GitHub Issue on failure (loud signal vs silent prod break)', () => {
      expect(yaml).toMatch(/if:\s*failure\(\)/);
      expect(yaml).toContain('actions/github-script');
      expect(yaml).toContain('prod-incident');
    });
  });
});
