import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {onRouteDidUpdate} from './tableRowHeaders';

/**
 * buildFaqAccordions is a post-mount DOM enhancement, so drive it through
 * onRouteDidUpdate against a mounted .markdown subtree mirroring what Docusaurus
 * emits for a "## FAQ(s)" section: an H2, per-item H3 questions (with the
 * trailing zero-width char the heading anchor link adds) and answer paragraphs.
 */
function faqSection(h2: string, questions: string[]): string {
  const items = questions
    .map((q, i) => `<h3 id="q-${i}">${q}\u200B</h3><p>answer ${i}</p>`)
    .join('');
  return `<div class="markdown"><h2 id="faq-heading">${h2}\u200B</h2>${items}</div>`;
}

describe('FAQ accordion CJK locale detection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function buildAccordions(): void {
    onRouteDidUpdate();
    vi.advanceTimersByTime(0);
  }

  it('builds accordion items from zh questions ending with the full-width ？', () => {
    document.body.innerHTML = faqSection('FAQs', [
      '是否提供 Zilliz Cloud 与其他竞品间的性能对比？',
      '如何获取技术支持？',
      'Zilliz Cloud 搜索延时是多少？',
    ]);
    buildAccordions();

    const items = document.querySelectorAll('.zd-faq-item');
    expect(items).toHaveLength(3);
    expect(items[0].querySelector('.zd-faq-qtext')?.textContent).toBe(
      '是否提供 Zilliz Cloud 与其他竞品间的性能对比？'
    );
    // the question heading's anchor id moves onto the accordion item and the
    // source H3 is hidden (still React-owned, never removed)
    expect(document.getElementById('q-0')).toBe(items[0]);
    expect(document.querySelector('.markdown h3')?.getAttribute('data-zd-faq-src')).toBe('1');
  });

  it.each([
    ['常见问题'],
    ['常见问题解答'],
    ['常见问题（FAQ）'],
    ['よくある質問'],
  ])('recognizes the translated FAQ heading "## %s"', (h2) => {
    document.body.innerHTML = faqSection(h2, ['这算一个问题吗？']);
    buildAccordions();
    expect(document.querySelectorAll('.zd-faq-item')).toHaveLength(1);
  });

  it('still builds accordions for ASCII-question English sections', () => {
    document.body.innerHTML = faqSection('FAQs', ['Is pricing the same in every region?']);
    buildAccordions();
    expect(document.querySelectorAll('.zd-faq-item')).toHaveLength(1);
  });

  it('leaves troubleshooting sections authored like FAQs as plain headings', () => {
    document.body.innerHTML = faqSection('问题排查', ['为什么集群创建失败？']);
    buildAccordions();
    expect(document.querySelector('.zd-faq')).toBeNull();
    expect(document.querySelector('[data-zd-faq-src]')).toBeNull();
  });
});
