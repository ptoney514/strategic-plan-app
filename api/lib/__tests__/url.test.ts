import { describe, it, expect, beforeEach } from 'vitest';
import { getAppBaseUrl } from '../url';

describe('getAppBaseUrl', () => {
  beforeEach(() => {
    // Clear env vars before each test
    delete process.env.BETTER_AUTH_URL;
    delete process.env.VERCEL_URL;
  });

  it('returns BETTER_AUTH_URL when set', () => {
    process.env.BETTER_AUTH_URL = 'https://www.stratadash.org';
    expect(getAppBaseUrl()).toBe('https://www.stratadash.org');
  });

  it('returns https://VERCEL_URL when BETTER_AUTH_URL is not set', () => {
    process.env.VERCEL_URL = 'my-app-abc123.vercel.app';
    expect(getAppBaseUrl()).toBe('https://my-app-abc123.vercel.app');
  });

  it('prefers BETTER_AUTH_URL over VERCEL_URL', () => {
    process.env.BETTER_AUTH_URL = 'https://www.stratadash.org';
    process.env.VERCEL_URL = 'my-app-abc123.vercel.app';
    expect(getAppBaseUrl()).toBe('https://www.stratadash.org');
  });

  it('returns localhost:5174 when no env vars are set', () => {
    expect(getAppBaseUrl()).toBe('http://localhost:5174');
  });
});
