import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';

const localeState = vi.hoisted(() => ({locale: 'ja-JP'}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {customFields: {site: 'en'}},
    i18n: {currentLocale: localeState.locale},
  }),
}));

import MachineTranslationToast, {resetDismissedForSession} from './index';

function renderToast() {
  return render(<MachineTranslationToast />);
}

describe('MachineTranslationToast', () => {
  beforeEach(() => {
    cleanup();
    resetDismissedForSession();
    localeState.locale = 'ja-JP';
  });

  it('renders nothing outside the ja-JP locale', () => {
    localeState.locale = 'en';
    const {container} = renderToast();
    expect(container.textContent).toBe('');

    cleanup();
    localeState.locale = 'zh-CN';
    const zh = renderToast();
    expect(zh.container.textContent).toBe('');
  });

  it('prerenders nothing so the static HTML never carries the notice', () => {
    expect(renderToString(<MachineTranslationToast />)).toBe('');
  });

  it('renders the disclosure with plain-text guidance and a single support link after mount', () => {
    renderToast();
    const status = screen.getByRole('status');
    expect(status.textContent).toContain('機械翻訳');
    expect(status.textContent).toContain('下の入力欄にご質問を入力して確認する');
    // The close button is the only button, and the support center is the only
    // interactive link in the notice.
    expect(screen.getAllByRole('button').length).toBe(1);
    expect(screen.getAllByRole('link', {name: 'サポート'}).length).toBe(1);
    const contact = screen.getByRole('link', {name: 'サポート'});
    expect(contact.getAttribute('href')).toBe('https://support.zilliz.com/hc/en-us');
    expect(contact.getAttribute('target')).toBe('_blank');
    expect(contact.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('stays dismissed for the whole session, including remounts and route changes', () => {
    const {unmount} = renderToast();
    fireEvent.click(screen.getByRole('button', {name: '機械翻訳の通知を閉じる'}));
    expect(screen.queryByRole('status')).toBeNull();
    unmount();

    localeState.locale = 'ja-JP';
    const {container} = renderToast();
    expect(container.textContent).toBe('');

    resetDismissedForSession();
    const {container: again} = renderToast();
    expect(again.textContent).toContain('機械翻訳');
  });
});
