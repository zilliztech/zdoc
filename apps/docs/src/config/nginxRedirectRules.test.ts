import {mkdtempSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {extractExact301Pairs, loadNginxRedirectRules, mergeRedirectRules, resolveRedirectChains} from './nginxRedirectRules';

const CONF_FIXTURE = `
server {
    location = /docs/old-page {
        return 301 /docs/new-page;
    }

    location = /docs/chain-start {
        return 301 /docs/old-page;
    }

    location = /docs/chain-two {
        return 301 /docs/chain-start;
    }

    location = /docs/trailing/ {
        return 301 /docs/new-page;
    }

    location = /docs/self-loop/ {
        return 301 /docs/self-loop;
    }

    location = /docs/frAGMENTED {
        return 301 /docs/new-page#section-anchor;
    }

    location = /docs/to-external {
        return 301 https://support.zilliz.com/help;
    }

    location = /docs/into-external {
        return 301 /docs/to-external;
    }

    location = /docs/to-var {
        return 301 /docs/$1-landing;
    }

    location = /ja-JP/docs/old-page {
        return 301 /ja-JP/docs/new-page;
    }

    location = /ja-JP/docs/fallback-page {
        try_files /ja-JP/docs/fallback-page.html /docs/fallback-page.html =404;
    }

    location = /docs/old-multi {
        return 301 /docs/new-page;
        return 301 /docs/other-page;
    }

    location ~ ^/blog/(.+)\\.xml$ {
        return 204;
    }

    location = /healthz {
        return 404 /healthz-404.html;
    }
}
`;

describe('extractExact301Pairs', () => {
  it('extracts one pair per exact-match block with a single 301', () => {
    expect(extractExact301Pairs(CONF_FIXTURE)).toEqual([
      {from: '/docs/old-page', to: '/docs/new-page'},
      {from: '/docs/chain-start', to: '/docs/old-page'},
      {from: '/docs/chain-two', to: '/docs/chain-start'},
      {from: '/docs/trailing', to: '/docs/new-page'},
      {from: '/docs/frAGMENTED', to: '/docs/new-page'},
      {from: '/docs/to-external', to: 'https://support.zilliz.com/help'},
      {from: '/docs/into-external', to: '/docs/to-external'},
      {from: '/docs/to-var', to: '/docs/$1-landing'},
      {from: '/ja-JP/docs/old-page', to: '/ja-JP/docs/new-page'},
    ]);
  });

  it('skips try_files fallbacks, multi-return blocks, regex locations, and non-301 gates', () => {
    const pairs = extractExact301Pairs(CONF_FIXTURE);
    const sources = pairs.map(pair => pair.from);
    expect(sources).not.toContain('/ja-JP/docs/fallback-page');
    expect(sources).not.toContain('/docs/old-multi');
    expect(sources).not.toContain('/blog/(.+)\\.xml$');
    expect(sources).not.toContain('/healthz');
    // trailing-slash catch rules collapse to a self-loop after normalization
    expect(sources).not.toContain('/docs/self-loop');
  });

  it('normalizes trailing slashes and strips fragments from both sides', () => {
    const pairs = extractExact301Pairs('location = /a/ { return 301 /b/#anchor; }');
    expect(pairs).toEqual([{from: '/a', to: '/b'}]);
  });
});

describe('resolveRedirectChains', () => {
  it('walks chains to their final internal target', () => {
    const resolved = resolveRedirectChains(extractExact301Pairs(CONF_FIXTURE));
    const byFrom = new Map(resolved.map(pair => [pair.from, pair.to]));
    expect(byFrom.get('/docs/chain-two')).toBe('/docs/new-page');
    expect(byFrom.get('/docs/chain-start')).toBe('/docs/new-page');
    expect(byFrom.get('/ja-JP/docs/old-page')).toBe('/ja-JP/docs/new-page');
  });

  it('drops rules that resolve to a target only nginx can serve', () => {
    const resolved = resolveRedirectChains(extractExact301Pairs(CONF_FIXTURE));
    const byFrom = new Map(resolved.map(pair => [pair.from, pair.to]));
    expect(byFrom.has('/docs/to-external')).toBe(false);
    expect(byFrom.has('/docs/into-external')).toBe(false);
    expect(byFrom.has('/docs/to-var')).toBe(false);
  });

  it('throws on conflicting duplicate sources', () => {
    expect(() => resolveRedirectChains([
      {from: '/a', to: '/b'},
      {from: '/a', to: '/c'},
    ])).toThrow(/conflicting targets/);
  });

  it('throws on cycles', () => {
    expect(() => resolveRedirectChains([
      {from: '/a', to: '/b'},
      {from: '/b', to: '/a'},
    ])).toThrow(/cycle/);
  });
});

describe('mergeRedirectRules', () => {
  it('unions both rule sets keyed by source', () => {
    expect(mergeRedirectRules(
      [{from: '/a', to: '/b'}, {from: '/c', to: '/d'}],
      [{from: '/e', to: '/f'}],
    )).toEqual([{from: '/a', to: '/b'}, {from: '/c', to: '/d'}, {from: '/e', to: '/f'}]);
  });

  it('tolerates an identical rule carried by both sides', () => {
    expect(mergeRedirectRules(
      [{from: '/a', to: '/b'}],
      [{from: '/a', to: '/b'}],
    )).toEqual([{from: '/a', to: '/b'}]);
  });

  it('throws when the nginx conf and the profile disagree on one source', () => {
    expect(() => mergeRedirectRules(
      [{from: '/a', to: '/b'}],
      [{from: '/a', to: '/c'}],
    )).toThrow(/nginx conf.*site profile/s);
  });
});

describe('loadNginxRedirectRules', () => {
  it('fails closed when the conf is unreadable', () => {
    expect(() => loadNginxRedirectRules('/nonexistent/nginx.conf')).toThrow(/Unable to read the nginx redirect map/);
  });

  it('derives the full resolved map from a conf file', () => {
    const dir = mkdtempSync(join(os.tmpdir(), 'nginx-redirect-'));
    const confPath = join(dir, 'nginx.conf');
    writeFileSync(confPath, CONF_FIXTURE);
    const resolved = loadNginxRedirectRules(confPath);
    const byFrom = new Map(resolved.map(pair => [pair.from, pair.to]));
    expect(byFrom.get('/docs/chain-two')).toBe('/docs/new-page');
    expect(byFrom.has('/docs/to-external')).toBe(false);
  });
});
