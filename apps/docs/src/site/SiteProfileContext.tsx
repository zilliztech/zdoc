import {createContext, useContext, type ReactNode} from 'react';
import type {DeepReadonly, SiteProfile} from '@zilliz/site-config';

const SiteProfileContext = createContext<DeepReadonly<SiteProfile> | undefined>(undefined);

export function SiteProfileProvider({
  profile,
  children,
}: Readonly<{profile: DeepReadonly<SiteProfile>; children: ReactNode}>) {
  return <SiteProfileContext.Provider value={profile}>{children}</SiteProfileContext.Provider>;
}

export function useSiteProfile(): DeepReadonly<SiteProfile> {
  const profile = useContext(SiteProfileContext);
  if (!profile) {
    throw new Error('useSiteProfile must be used within SiteProfileProvider');
  }
  return profile;
}
