import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {getVisitorId} from './visitorIdentity';

const id = '550e8400-e29b-41d4-a716-446655440000';

describe('anonymous visitor identity', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('generates once and reuses the stored UUID across calls', () => {
    const randomUUID = vi.fn(() => id);
    vi.stubGlobal('crypto', {randomUUID});
    expect(getVisitorId()).toBe(`browser:v1:${id}`);
    expect(getVisitorId()).toBe(`browser:v1:${id}`);
    expect(localStorage.getItem('zd-user-id')).toBe(id);
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  it.each([id.toUpperCase(), `browser:v1:${id}`])('reuses an existing UUID %s without creating another identity', stored => {
    localStorage.setItem('zd-user-id', stored);
    vi.stubGlobal('crypto', undefined);
    expect(getVisitorId()).toBe(`browser:v1:${id}`);
  });

  it('replaces a malformed stored identity with a securely generated UUID', () => {
    localStorage.setItem('zd-user-id', 'not-an-identity');
    vi.stubGlobal('crypto', {randomUUID: () => id});
    expect(getVisitorId()).toBe(`browser:v1:${id}`);
    expect(localStorage.getItem('zd-user-id')).toBe(id);
  });

  it('uses secure random bytes when randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {getRandomValues: (bytes: Uint8Array) => bytes.fill(1)});
    expect(getVisitorId()).toBe('browser:v1:01010101-0101-4101-8101-010101010101');
    expect(getVisitorId()).toBe('browser:v1:01010101-0101-4101-8101-010101010101');
  });

  it('omits identity when secure randomness is unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    expect(getVisitorId()).toBeUndefined();
    expect(localStorage.getItem('zd-user-id')).toBeNull();
  });

  it.each(['getItem', 'setItem'] as const)('omits identity when storage %s fails', method => {
    vi.stubGlobal('crypto', {randomUUID: () => id});
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {throw new Error('storage blocked');});
    expect(getVisitorId()).toBeUndefined();
  });
});
