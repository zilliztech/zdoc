import {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import adapterModule from './adapter.js';

const buildModel = adapterModule.buildModel;
import enSnapshot from './snapshots/en.json';
import zhSnapshot from './snapshots/zh-CN.json';
import type {CloudDataModel} from './renderReact';

// Data source for <CloudRegions>/<CloudFeatures>/<RegionIps>. The committed
// snapshot is the SSR first frame (deterministic: server and client agree, no
// hydration mismatch, no layout shift); after mount each page fetches the live
// CMS JSON once — regardless of how many components the page carries — and
// swaps in the fresh model. A failed or missing fetch keeps the snapshot.
// Request-time freshness for the `.md` route is nginx SSI's job, not this hook.

type SnapshotFile = {schemaVersion: number; site: string; generatedAt: string; source: string; model: CloudDataModel};

const SNAPSHOTS: Record<string, CloudDataModel> = {
  en: (enSnapshot as unknown as SnapshotFile).model,
  'zh-CN': (zhSnapshot as unknown as SnapshotFile).model,
};

function resolveSite(value: unknown): string {
  return value === 'zh-CN' ? 'zh-CN' : 'en';
}

function cmsBaseUrlFor(customFields: Record<string, unknown> | undefined): string | null {
  const integrations = customFields?.integrations as {cloudData?: {cmsBaseUrl?: string}} | undefined;
  const baseUrl = integrations?.cloudData?.cmsBaseUrl;
  return typeof baseUrl === 'string' && baseUrl ? baseUrl : null;
}

// Module-level cache: the 3–6 components on one page share a single fetch pair.
const liveModelPromises = new Map<string, Promise<CloudDataModel | null>>();

function getLiveModel(site: string, cmsBaseUrl: string): Promise<CloudDataModel | null> {
  const key = site + '|' + cmsBaseUrl;
  const existing = liveModelPromises.get(key);
  if (existing) return existing;
  const promise = Promise.all([
    fetch(cmsBaseUrl.replace(/\/$/, '') + '/api/cloud-regions').then((response) => (response.ok ? response.json() : null)),
    fetch(cmsBaseUrl.replace(/\/$/, '') + '/api/cloud-features').then((response) => (response.ok ? response.json() : null)),
  ]).then(([regions, features]) => {
    if (!regions || !features) return null;
    return buildModel(site, regions, features) as unknown as CloudDataModel;
  });
  liveModelPromises.set(key, promise);
  // Drop failed attempts so a later mount can retry; successful models stay cached.
  // A non-ok HTTP status resolves to null instead of rejecting, so the null
  // result must be evicted too or the page would never retry until a reload.
  promise.then(
    (model) => {
      if (!model) liveModelPromises.delete(key);
    },
    () => liveModelPromises.delete(key),
  );
  return promise;
}

export function useCloudDataModel(): CloudDataModel {
  const {siteConfig} = useDocusaurusContext();
  const site = resolveSite(siteConfig?.customFields?.site);
  const snapshotModel = SNAPSHOTS[site];
  const [model, setModel] = useState<CloudDataModel>(snapshotModel);

  useEffect(() => {
    const cmsBaseUrl = cmsBaseUrlFor(siteConfig?.customFields as Record<string, unknown> | undefined);
    if (!cmsBaseUrl) return;
    let cancelled = false;
    getLiveModel(site, cmsBaseUrl)
      .then((live) => {
        if (!cancelled && live) setModel(live);
      })
      .catch(() => {
        // Snapshot fallback is the documented degradation (CMS unreachable);
        // the SSI stub blocks inside `.md` follow the same rule server-side.
      });
    return () => {
      cancelled = true;
    };
  }, [site, siteConfig]);

  return model;
}
