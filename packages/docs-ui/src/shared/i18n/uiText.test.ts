import {describe, expect, it} from 'vitest';
import {vi} from 'vitest';

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({siteConfig: {customFields: {site: 'en'}}}),
}));

import {getDocsUiText, localizeChatStatus, localizeSearchSection, resolveDocsUiSite} from './uiText';

describe('docs UI localization', () => {
  it('selects Chinese only for the Chinese site profile', () => {
    expect(resolveDocsUiSite('zh-CN')).toBe('zh-CN');
    expect(resolveDocsUiSite('en')).toBe('en');
    expect(resolveDocsUiSite(undefined)).toBe('en');
  });

  it('provides Chinese navigation, chat, search, and utility copy', () => {
    const text = getDocsUiText('zh-CN');
    expect(text.breadcrumbs.docsHome).toBe('文档首页');
    expect(text.sidebar.documentationSections).toBe('文档栏目');
    expect(text.sidebar.documentationPages).toBe('文档页面');
    expect(text.sidebar.backTo('客户端库')).toBe('返回客户端库');
    expect(text.chat.title).toBe('询问 AI');
    expect(text.search.placeholder).toBe('搜索文档...');
    expect(text.notFound.heading).toBe('找不到页面');
    expect(text.copyPage.copyPage).toBe('复制页面');
    expect(text.toc.onThisPage).toBe('本页内容');
  });

  it('localizes known runtime status and section values without rewriting unknown values', () => {
    const text = getDocsUiText('zh-CN');
    expect(localizeChatStatus('Searching docs', text)).toBe('搜索中');
    expect(localizeChatStatus('Analyzing query', text)).toBe('思考中');
    expect(localizeChatStatus('Running custom tool', text)).toBe('Running custom tool');
    expect(localizeSearchSection('Reference', text)).toBe('API 与 SDK');
    expect(localizeSearchSection('Community', text)).toBe('Community');
  });
});
