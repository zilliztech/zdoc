import React, {type ComponentType, type ReactNode} from 'react';
import {useDoc, useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {filterNextChannelPaginationLinks, filterRetiredChannelPaginationLinks, useRuntimeReleaseChannel} from '../../utils/releaseChannel';

type PageLink = {title: string; permalink: string};

type PaginatorProps = {
  className?: string;
  previous?: PageLink;
  next?: PageLink;
};

type Props = {
  /** The theme paginator (`@theme/DocPaginator`), injected by the theme override
   * so this module stays free of `@theme` imports and remains testable. */
  Paginator: ComponentType<PaginatorProps>;
  className?: string;
};

/** Paginator with the release-channel gate applied. Docusaurus derives the
 * Previous/Next links from the sidebar order but keeps only `{title,
 * permalink}`, so without this a deployment hides a page from the sidebar and
 * 404s it via nginx while still advertising it in pagination: CURRENT drops
 * NEXT targets, NEXT drops RETIRE-IN-NEXT targets. The prerendered CURRENT
 * view matches hydration because the runtime channel only flips after
 * mount. */
export default function ReleaseChannelPaginator({Paginator, className}: Props): ReactNode {
  const {metadata} = useDoc();
  const sidebar = useDocsSidebar();
  const runtimeChannel = useRuntimeReleaseChannel();
  const previous = metadata.previous as PageLink | undefined;
  const next = metadata.next as PageLink | undefined;

  const links = runtimeChannel === 'next'
    ? filterRetiredChannelPaginationLinks(previous, next, sidebar?.items)
    : filterNextChannelPaginationLinks(previous, next, sidebar?.items);

  if (!links.previous && !links.next) {
    return null;
  }

  return <Paginator className={className} previous={links.previous} next={links.next} />;
}
