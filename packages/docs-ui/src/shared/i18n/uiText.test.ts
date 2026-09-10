import {describe, expect, it} from 'vitest';
import {vi} from 'vitest';

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({siteConfig: {customFields: {site: 'en'}}}),
}));

import {getDocsUiText, localizeChatStatus, localizeNavLabel, localizeSearchSection, resolveDocsUiSite} from './uiText';

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

  it('selects Japanese by locale on the English site and keeps English otherwise', () => {
    expect(getDocsUiText('en', 'ja-JP').navbar.docs).toBe('ドキュメント');
    expect(getDocsUiText('en', 'ja-JP').chat.title).toBe('AI に質問');
    expect(getDocsUiText('en', 'ja-JP').search.placeholder).toBe('ドキュメントを検索...');
    expect(getDocsUiText('en', 'ja-JP').toc.onThisPage).toBe('このページの内容');
    expect(getDocsUiText('en', 'en').navbar.docs).toBe('Docs');
    expect(getDocsUiText('en').navbar.docs).toBe('Docs');
    // The Chinese site never serves the Japanese locale, but if it ever did,
    // locale must win so the two dictionaries can never mix.
    expect(getDocsUiText('zh-CN', 'ja-JP').navbar.docs).toBe('ドキュメント');
  });

  it('maps secondary navbar labels for Japanese and passes unmapped labels through', () => {
    const text = getDocsUiText('en', 'ja-JP');
    expect(localizeNavLabel('Zilliz-Managed Cloud', text)).toBe('Zilliz マネージド Cloud');
    expect(localizeNavLabel('Bring Your Own Cloud', text)).toBe('BYOC');
    expect(localizeNavLabel('Releases', text)).toBe('リリースノート');
    expect(localizeNavLabel('API & SDK', text)).toBe('API & SDK');
    expect(localizeNavLabel(undefined, text)).toBeUndefined();
    expect(localizeNavLabel('Zilliz-Managed Cloud', getDocsUiText('en'))).toBe('Zilliz-Managed Cloud');
  });

  it('localizes Japanese runtime status and search sections', () => {
    const text = getDocsUiText('en', 'ja-JP');
    expect(localizeChatStatus('Searching docs', text)).toBe('検索中');
    expect(localizeChatStatus('Analyzing query', text)).toBe('考え中');
    expect(localizeChatStatus('Running custom tool', text)).toBe('Running custom tool');
    expect(localizeSearchSection('Reference', text)).toBe('リファレンス');
    expect(localizeSearchSection('Community', text)).toBe('Community');
  });
});
