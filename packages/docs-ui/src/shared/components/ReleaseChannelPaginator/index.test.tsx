import React from 'react';
import {describe, expect, it, vi, afterEach} from 'vitest';
import {render, cleanup} from '@testing-library/react';

const {docState, sidebarState} = vi.hoisted(() => ({
  docState: {current: {} as Record<string, unknown>},
  sidebarState: {current: undefined as {items: unknown[]} | undefined},
}));

vi.mock('@docusaurus/plugin-content-docs/client', () => ({
  useDoc: () => ({metadata: docState.current}),
  useDocsSidebar: () => sidebarState.current,
}));

import ReleaseChannelPaginator from './index';

const NEXT_PERMALINK = '/docs/single-sign-on-with-ping-one';

const SIDEBAR = [
  {type: 'link', key: 'a', href: '/docs/stable', label: 'Stable'},
  {type: 'link', key: 'b', href: NEXT_PERMALINK, label: 'PingOne', customProps: {channel: 'next'}},
];

/** Stands in for @theme/DocPaginator, which the theme override injects. */
function Paginator(props: {
  className?: string;
  previous?: {title: string};
  next?: {title: string};
}) {
  return (
    <nav className={props.className} data-testid="paginator">
      <span data-testid="prev">{props.previous?.title ?? ''}</span>
      <span data-testid="next">{props.next?.title ?? ''}</span>
    </nav>
  );
}

type EnvState = {RELEASE_CHANNEL?: unknown} | undefined;

function withEnv(env: EnvState, run: () => void) {
  const original = (window as {__ZDOC_ENV__?: EnvState}).__ZDOC_ENV__;
  (window as {__ZDOC_ENV__?: EnvState}).__ZDOC_ENV__ = env;
  try {
    run();
  } finally {
    (window as {__ZDOC_ENV__?: EnvState}).__ZDOC_ENV__ = original;
  }
}

describe('ReleaseChannelPaginator', () => {
  afterEach(() => cleanup());

  it('drops a NEXT pagination target on a CURRENT deployment', () => {
    docState.current = {
      previous: {title: 'Google Workspace', permalink: '/docs/stable'},
      next: {title: 'PingOne', permalink: NEXT_PERMALINK},
    };
    sidebarState.current = {items: SIDEBAR};

    withEnv({RELEASE_CHANNEL: 'current'}, () => {
      const {getByTestId} = render(<ReleaseChannelPaginator Paginator={Paginator} />);
      expect(getByTestId('prev').textContent).toBe('Google Workspace');
      expect(getByTestId('next').textContent).toBe('');
    });
  });

  it('keeps every link on a NEXT deployment', () => {
    docState.current = {
      previous: {title: 'Google Workspace', permalink: '/docs/stable'},
      next: {title: 'PingOne', permalink: NEXT_PERMALINK},
    };
    sidebarState.current = {items: SIDEBAR};

    withEnv({RELEASE_CHANNEL: 'next'}, () => {
      const {getByTestId} = render(<ReleaseChannelPaginator Paginator={Paginator} />);
      expect(getByTestId('next').textContent).toBe('PingOne');
    });
  });

  it('renders nothing when both neighbours are NEXT', () => {
    docState.current = {
      previous: {title: 'PingOne', permalink: NEXT_PERMALINK},
      next: {title: 'PingOne', permalink: NEXT_PERMALINK},
    };
    sidebarState.current = {items: SIDEBAR};

    withEnv({RELEASE_CHANNEL: 'current'}, () => {
      const {container} = render(<ReleaseChannelPaginator Paginator={Paginator} />);
      expect(container.textContent).toBe('');
    });
  });

  it('fails closed without an injected channel', () => {
    docState.current = {next: {title: 'PingOne', permalink: NEXT_PERMALINK}};
    sidebarState.current = {items: SIDEBAR};

    withEnv(undefined, () => {
      const {container} = render(<ReleaseChannelPaginator Paginator={Paginator} />);
      expect(container.textContent).toBe('');
    });
  });

  it('passes the className through to the theme paginator', () => {
    docState.current = {next: {title: 'Stable', permalink: '/docs/stable'}};
    sidebarState.current = {items: SIDEBAR};

    withEnv({RELEASE_CHANNEL: 'current'}, () => {
      const {getByTestId} = render(
        <ReleaseChannelPaginator Paginator={Paginator} className="docusaurus-mt-lg" />,
      );
      expect(getByTestId('paginator').className).toBe('docusaurus-mt-lg');
    });
  });
});
