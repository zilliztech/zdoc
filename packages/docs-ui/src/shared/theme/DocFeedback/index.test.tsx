import React from 'react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, cleanup, waitFor} from '@testing-library/react';

const {siteState, pathState, localeState} = vi.hoisted(() => ({
  siteState: {current: 'en'},
  pathState: {current: '/docs/example'},
  localeState: {current: 'en'},
}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        site: siteState.current,
      },
    },
    i18n: {currentLocale: localeState.current},
  }),
}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({pathname: pathState.current}),
}));

import DocFeedback from './index';

describe('DocFeedback', () => {
  beforeEach(() => {
    siteState.current = 'en';
    pathState.current = '/docs/example';
    window.dataLayer = [];
    window.localStorage.clear();
    localeState.current = 'en';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the question with both vote buttons', () => {
    render(<DocFeedback />);
    expect(screen.getByText('Was this page helpful?')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Helpful'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Not helpful'})).toBeInTheDocument();
  });

  it('sends the doc_feedback event with the rating and locks after voting', () => {
    render(<DocFeedback />);
    fireEvent.click(screen.getByRole('button', {name: 'Helpful'}));
    expect(window.dataLayer).toEqual([{event: 'doc_feedback', rating: 'up'}]);
    expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Helpful'})).not.toBeInTheDocument();
    expect(window.localStorage.getItem('zd_doc_feedback_voted:/docs/example')).toBe('up');
  });

  it('records a down vote symmetrically', () => {
    render(<DocFeedback />);
    fireEvent.click(screen.getByRole('button', {name: 'Not helpful'}));
    expect(window.dataLayer).toEqual([{event: 'doc_feedback', rating: 'down'}]);
    expect(window.localStorage.getItem('zd_doc_feedback_voted:/docs/example')).toBe('down');
  });

  it('shows the locked state for a page already voted in this browser', async () => {
    window.localStorage.setItem('zd_doc_feedback_voted:/docs/example', 'down');
    render(<DocFeedback />);
    // First frame matches SSR (buttons), then the stored vote takes over.
    await waitFor(() =>
      expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', {name: 'Helpful'})).not.toBeInTheDocument();
    expect(window.dataLayer).toEqual([]);
  });

  it('votes independently per page path', () => {
    window.localStorage.setItem('zd_doc_feedback_voted:/docs/other', 'up');
    render(<DocFeedback />);
    expect(screen.getByRole('button', {name: 'Helpful'})).toBeInTheDocument();
  });

  it('renders Japanese copy on the en site for the ja-JP locale', () => {
    localeState.current = 'ja-JP';
    render(<DocFeedback />);
    expect(screen.getByText('このページは役に立ちましたか？')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '役に立った'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '役に立たなかった'})).toBeInTheDocument();
  });

  it('renders nothing on the Chinese site (no GA property to receive votes)', () => {
    siteState.current = 'zh-CN';
    const {container} = render(<DocFeedback />);
    expect(container.innerHTML).toBe('');
  });
});
