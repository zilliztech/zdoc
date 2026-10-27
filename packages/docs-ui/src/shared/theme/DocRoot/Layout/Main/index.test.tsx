import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from '@testing-library/react';

const routeState = vi.hoisted(() => ({
  pathname: '/docs/sample',
  hash: '',
}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({pathname: routeState.pathname, hash: routeState.hash}),
}));

vi.mock('@docusaurus/plugin-content-docs/client', () => ({
  useDocsSidebar: () => undefined,
}));

import DocRootLayoutMain from './index';

function navigate(pathname: string, hash: string, rerender: (ui: React.ReactElement) => void) {
  routeState.pathname = pathname;
  routeState.hash = hash;
  window.history.replaceState(null, '', hash ? `${pathname}${hash}` : pathname);
  rerender(
    <DocRootLayoutMain hiddenSidebarContainer={false}>
      <p>doc body</p>
    </DocRootLayoutMain>,
  );
}

function renderMain() {
  return render(
    <DocRootLayoutMain hiddenSidebarContainer={false}>
      <p>doc body</p>
    </DocRootLayoutMain>,
  );
}

/** A heading whose scrollIntoView is observable; detached until appended, so
 * getElementById misses it exactly like NEXT-channel content pre-mount. */
function makeHeading(id: string): HTMLElement {
  const heading = document.createElement('h2');
  heading.id = id;
  heading.scrollIntoView = vi.fn();
  return heading;
}

const scrollIntoViewOf = (heading: HTMLElement) =>
  heading.scrollIntoView as ReturnType<typeof vi.fn>;

describe('DocRootLayoutMain hash scrolling', () => {
  const scrollToMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollToMock,
    });
    scrollToMock.mockClear();
    window.history.replaceState(null, '', '/docs/sample');
    routeState.pathname = '/docs/sample';
    routeState.hash = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    document.body.innerHTML = '';
    delete (HTMLElement.prototype as {scrollTo?: unknown}).scrollTo;
  });

  it('scrolls to a hash heading that mounts after navigation', () => {
    navigate('/docs/sample', '#current-heading', renderMain);

    const heading = makeHeading('current-heading');
    vi.advanceTimersByTime(300);
    expect(scrollIntoViewOf(heading)).not.toHaveBeenCalled();

    document.body.appendChild(heading);
    vi.advanceTimersByTime(100);
    expect(scrollIntoViewOf(heading)).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(scrollIntoViewOf(heading)).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending retry when the navigation goes stale', () => {
    const {rerender} = renderMain();
    navigate('/docs/sample', '#current-heading', rerender);
    vi.advanceTimersByTime(300);

    navigate('/docs/sample', '#latest-heading', rerender);
    vi.advanceTimersByTime(600);
    const abandoned = makeHeading('current-heading');
    document.body.appendChild(abandoned);
    vi.advanceTimersByTime(400);
    expect(scrollIntoViewOf(abandoned)).not.toHaveBeenCalled();

    const current = makeHeading('latest-heading');
    document.body.appendChild(current);
    vi.advanceTimersByTime(100);
    expect(scrollIntoViewOf(current)).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending retry on unmount', () => {
    const {rerender, unmount} = renderMain();
    navigate('/docs/sample', '#current-heading', rerender);
    vi.advanceTimersByTime(300);
    unmount();

    const heading = makeHeading('current-heading');
    document.body.appendChild(heading);
    vi.advanceTimersByTime(500);
    expect(scrollIntoViewOf(heading)).not.toHaveBeenCalled();
  });

  it('gives up after the bounded retry window', () => {
    navigate('/docs/sample', '#current-heading', renderMain);
    vi.advanceTimersByTime(10_100);

    const heading = makeHeading('current-heading');
    document.body.appendChild(heading);
    vi.advanceTimersByTime(500);
    expect(scrollIntoViewOf(heading)).not.toHaveBeenCalled();
  });

  it('decodes percent-encoded hash targets', () => {
    navigate('/docs/sample', '#%E4%BD%A0%E5%A5%BD', renderMain);
    vi.advanceTimersByTime(200);

    const heading = makeHeading('你好');
    document.body.appendChild(heading);
    vi.advanceTimersByTime(100);
    expect(scrollIntoViewOf(heading)).toHaveBeenCalledTimes(1);
  });

  it('keeps the scroll-to-top reset for hashless navigation', () => {
    const {rerender} = renderMain();
    expect(scrollToMock).toHaveBeenCalledTimes(1);
    expect(scrollToMock).toHaveBeenLastCalledWith({top: 0});

    navigate('/docs/other', '', rerender);
    expect(scrollToMock).toHaveBeenCalledTimes(2);

    navigate('/docs/other', '#section', rerender);
    expect(scrollToMock).toHaveBeenCalledTimes(2);
  });
});
