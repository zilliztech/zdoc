import React, {type ReactNode} from 'react';
import {useRuntimeReleaseChannel} from '../../utils/releaseChannel';

export type NextChannelAction = 'include' | 'exclude';

interface NextChannelProps {
  action?: NextChannelAction;
  children?: ReactNode;
}

/** Block-level Release Channel gate for generated docs content. Untagged
 * content is CURRENT by convention, so only staged blocks are tagged:
 * action="include" content is visible on next deployments only, while
 * action="exclude" content is what that block replaces once next ships.
 * Prerender and hydration resolve to CURRENT (fail closed), so include
 * blocks are absent from the static HTML and appear after mount on next. */
export default function NextChannel({action = 'include', children}: NextChannelProps) {
  const channel = useRuntimeReleaseChannel();
  const matchesNext = channel === 'next';
  const visible = action === 'include' ? matchesNext : !matchesNext;
  return visible ? <>{children}</> : null;
}
