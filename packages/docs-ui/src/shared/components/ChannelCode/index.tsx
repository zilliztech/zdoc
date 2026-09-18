import React, {type ComponentType, type ReactNode} from 'react';

import {containsChannelCodeDirectives, resolveChannelCode} from '../../utils/channelCode';
import {useRuntimeReleaseChannel} from '../../utils/releaseChannel';

type ChannelCodeProps = {
  /** The MDX `code` component being wrapped (injected by MDXComponents so this module stays free of @theme imports). */
  inner: ComponentType<{children?: ReactNode} & Record<string, unknown>>;
  children?: ReactNode;
} & Record<string, unknown>;

/** MDX `code` mapping wrapper. Fenced blocks carrying channel directives are
 * filtered to the deployment channel before Docusaurus's client-side
 * highlighting, so directive lines never render and never copy, and include
 * lines are absent from the prerendered HTML (revealed post-mount on next,
 * the same fail-closed CURRENT view as every other release-channel surface).
 * Inline code and directive-free blocks pass through untouched. */
export default function ChannelCode({children, inner: Inner, ...rest}: ChannelCodeProps) {
  const channel = useRuntimeReleaseChannel();
  const resolved =
    typeof children === 'string' && children.includes('\n') && containsChannelCodeDirectives(children)
      ? resolveChannelCode(children, channel)
      : children;
  return <Inner {...rest}>{resolved}</Inner>;
}
