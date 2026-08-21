import {describe, expect, it} from 'vitest';
import {getManualReferenceNavigation} from './manualReferenceNavigation';

describe('getManualReferenceNavigation', () => {
  it('returns the English reference labels, back routes, and target order', () => {
    const navigation = getManualReferenceNavigation('en');

    expect(navigation.clientLibrariesLabel).toBe('Client Libraries');
    expect(navigation.toolsLabel).toBe('Tools');
    expect(navigation.installSdksLabel).toBe('Install SDKs');
    expect(navigation.installSdksHref).toBe('/docs/install-sdks');
    expect(navigation.toolsHref).toBe('/docs/agents-and-prompts');
    expect(navigation.targets.map(target => [target.kind, target.label])).toEqual([
      ['python', 'Python SDK'],
      ['java', 'Java SDK'],
      ['nodejs', 'Node.js SDK'],
      ['go', 'Go SDK'],
      ['cpp', 'C++ SDK'],
      ['cli', 'CLI'],
      ['restful', 'REST API'],
    ]);
    expect(navigation.targets.find(target => target.kind === 'nodejs')).toMatchObject({
      landingHref: '/reference/nodejs',
      hrefPrefixes: ['/reference/nodejs', '/reference/node'],
    });
    expect(navigation.targets.find(target => target.kind === 'cli')).toMatchObject({
      landingHref: '/reference/cli',
      hrefPrefixes: ['/reference/cli'],
    });
    expect(navigation.entryRedirects).toEqual({
      '/reference/cli/overview': '/reference/cli/cli/overview',
    });
  });

  it('uses the English adapter for the Japanese site integration', () => {
    const navigation = getManualReferenceNavigation('en');

    expect(navigation.clientLibrariesLabel).toBe('Client Libraries');
    expect(navigation.targets.map(target => target.label)).toContain('Node.js SDK');
  });

  it('returns Chinese labels, shared back routes, and the same target order', () => {
    const navigation = getManualReferenceNavigation('zh-CN');

    expect(navigation.clientLibrariesLabel).toBe('客户端参考');
    expect(navigation.toolsLabel).toBe('工具');
    expect(navigation.installSdksLabel).toBe('安装 SDK');
    expect(navigation.installSdksHref).toBe('/docs/install-sdks');
    expect(navigation.toolsHref).toBe('/docs/agents-and-prompts');
    expect(navigation.targets.map(target => [target.kind, target.label])).toEqual([
      ['python', 'Python SDK'],
      ['java', 'Java SDK'],
      ['nodejs', 'Node.js SDK'],
      ['go', 'Go SDK'],
      ['cpp', 'C++ SDK'],
      ['cli', 'Zilliz CLI'],
      ['restful', 'RESTful API'],
    ]);
    expect(navigation.entryRedirects).toEqual({
      '/reference/cli/overview': '/reference/cli/cli/overview',
    });
  });

  it('returns immutable adapters', () => {
    const navigation = getManualReferenceNavigation('en');

    expect(Object.isFrozen(navigation)).toBe(true);
    expect(Object.isFrozen(navigation.targets)).toBe(true);
    expect(Object.isFrozen(navigation.targets[0])).toBe(true);
    expect(Object.isFrozen(navigation.targets[0].hrefPrefixes)).toBe(true);
    expect(Object.isFrozen(navigation.entryRedirects)).toBe(true);
  });
});
