import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';

const routeState = vi.hoisted(() => ({pathname: '/docs/alpha'}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({pathname: routeState.pathname}),
}));

import NextChannelToast, {resetDismissedRoutes} from './index';

describe('NextChannelToast', () => {
  beforeEach(() => {
    cleanup();
    resetDismissedRoutes();
  });

  it('prerenders nothing so the static HTML never carries the notice', () => {
    const html = renderToString(
      <NextChannelToast message="unreleased notice" dismissLabel="Dismiss" />,
    );
    expect(html).toBe('');
  });

  it('announces the message as a polite status after mount', () => {
    render(<NextChannelToast message="unreleased notice" dismissLabel="Dismiss" />);
    expect(screen.getByRole('status')).toHaveTextContent('unreleased notice');
    expect(screen.getByRole('button', {name: 'Dismiss'})).toBeDefined();
  });

  it('stays dismissed for the same route, including remounts', () => {
    const {unmount} = render(
      <NextChannelToast message="unreleased notice" dismissLabel="Dismiss" />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(screen.queryByRole('status')).toBeNull();
    unmount();

    const {container} = render(
      <NextChannelToast message="unreleased notice" dismissLabel="Dismiss" />,
    );
    expect(container.textContent).toBe('');
  });

  it('shows again on a different unreleased page and honors the reset hook', () => {
    render(<NextChannelToast message="page one notice" dismissLabel="Dismiss" />);
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));

    routeState.pathname = '/docs/beta';
    const {container} = render(
      <NextChannelToast message="page two notice" dismissLabel="Dismiss" />,
    );
    expect(container.textContent).toContain('page two notice');

    resetDismissedRoutes();
    const {container: again} = render(
      <NextChannelToast message="page two notice" dismissLabel="Dismiss" />,
    );
    expect(again.textContent).toContain('page two notice');
  });
});
