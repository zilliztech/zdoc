import {afterEach, describe, expect, it, vi} from 'vitest';

async function importRegistration() {
  return import('./registration.js');
}

afterEach(() => {
  vi.doUnmock('node:fs');
  vi.resetModules();
});

describe('policy registration config', () => {
  it('loads enabled topics from registration config', async () => {
    const {getPolicyModeRegistration} = await importRegistration();
    const config = getPolicyModeRegistration();
    expect(config.enabled).toBe(true);
    expect([...config.topics]).toEqual(['on-demand-search', 'zilliz-cli']);
  });

  it('returns safe defaults when file is missing', async () => {
    vi.doMock('node:fs', () => ({
      readFileSync: vi.fn(() => {
        throw new Error('ENOENT');
      }),
    }));

    const {getPolicyModeRegistration} = await importRegistration();
    const config = getPolicyModeRegistration();
    expect(config.enabled).toBe(false);
    expect(config.topics.size).toBe(0);
  });

  it('returns safe defaults when shape is invalid', async () => {
    vi.doMock('node:fs', () => ({
      readFileSync: vi.fn(() => 'policyMode:\n  enabled: true\n  topics: not-a-list\n'),
    }));

    const {getPolicyModeRegistration} = await importRegistration();
    const config = getPolicyModeRegistration();
    expect(config.enabled).toBe(false);
    expect(config.topics.size).toBe(0);
  });

  it('normalizes and deduplicates topics', async () => {
    vi.doMock('node:fs', () => ({
      readFileSync: vi.fn(() => 'policyMode:\n  enabled: true\n  topics:\n    - ZILLIZ-CLI\n    - zilliz-cli\n    - invalid topic\n'),
    }));

    const {getPolicyModeRegistration} = await importRegistration();
    const config = getPolicyModeRegistration();
    expect(config.enabled).toBe(true);
    expect([...config.topics]).toEqual(['zilliz-cli']);
  });

  it('uses cache until cleared', async () => {
    const readFileSync = vi.fn(() => 'policyMode:\n  enabled: true\n  topics:\n    - zilliz-cli\n');
    vi.doMock('node:fs', () => ({readFileSync}));

    const {getPolicyModeRegistration, clearPolicyRegistrationCache} = await importRegistration();

    getPolicyModeRegistration();
    getPolicyModeRegistration();
    expect(readFileSync).toHaveBeenCalledTimes(1);

    clearPolicyRegistrationCache();
    getPolicyModeRegistration();
    expect(readFileSync).toHaveBeenCalledTimes(2);
  });

  it('returns immutable topic sets', async () => {
    const {getPolicyModeRegistration} = await importRegistration();

    const first = getPolicyModeRegistration();
    first.topics.add('mutated-topic');

    const second = getPolicyModeRegistration();
    expect(second.topics.has('mutated-topic')).toBe(false);
  });
});
