import React, {type ReactNode, useState, useRef, useEffect} from 'react';
import clsx from 'clsx';
import {useCodeBlockContext} from '@docusaurus/theme-common/internal';
import Container from '@theme/CodeBlock/Container';
import Content from '@theme/CodeBlock/Content';
import styles from './styles.module.css';

// Same icon set as the "Copy page" button, so code copy + page copy match.
const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function CodeCopyButton({code}: {code: string}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={clsx(styles.copyBtn, copied && styles.copyBtnCopied)}
      data-tip={copied ? 'Copied' : 'Copy'}
      aria-label="Copy code"
      onClick={() => {
        navigator.clipboard.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

function TrafficLights() {
  return (
    <div className={styles.trafficLights} aria-hidden="true">
      <span className={clsx(styles.dot, styles.dotRed)} />
      <span className={clsx(styles.dot, styles.dotYellow)} />
      <span className={clsx(styles.dot, styles.dotGreen)} />
    </div>
  );
}

function AskAiCodeButton({code, label, lang}: {code: string; label?: string; lang?: string}) {
  return (
    <button
      type="button"
      className={styles.askAiBtn}
      data-tip="Ask AI"
      onClick={() => {
        document.dispatchEvent(new CustomEvent('open-chat'));
        document.dispatchEvent(
          new CustomEvent('ask-ai-context', {detail: {kind: 'code', content: code, lang, label: label || 'Code snippet'}}),
        );
      }}
      aria-label="Ask AI about this code">
      <svg width="9" height="15" viewBox="0 0 8 14" fill="none" aria-hidden="true">
        <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
      </svg>
    </button>
  );
}

export default function CodeBlockLayout({className}: {className?: string}): ReactNode {
  const {metadata} = useCodeBlockContext();
  const rawName = typeof (metadata.title ?? metadata.language) === 'string'
    ? (metadata.title ?? metadata.language) as string
    : undefined;
  const LANG_LABELS: Record<string, string> = {
    javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
    bash: 'Bash', shell: 'Shell', json: 'JSON', yaml: 'YAML',
    html: 'HTML', css: 'CSS', java: 'Java', go: 'Go', rust: 'Rust',
    cpp: 'C++', c: 'C', sql: 'SQL', graphql: 'GraphQL',
    markdown: 'Markdown', mdx: 'MDX', tsx: 'TSX', jsx: 'JSX',
    toml: 'TOML', xml: 'XML',
  };
  const displayName = rawName
    ? (LANG_LABELS[rawName.toLowerCase()] ?? rawName.charAt(0).toUpperCase() + rawName.slice(1))
    : undefined;

  // Where to show the language label:
  //  - 'left'   : standalone code block (no tab) — label on the left.
  //  - 'hidden' : inside a tab whose name already states the language (redundant,
  //               e.g. "Python" tab → python code).
  //  - 'right'  : inside a tab whose name differs from the language (e.g. "NodeJS"
  //               tab → javascript code) — surface the language right of Ask AI.
  const titleBarRef = useRef<HTMLDivElement>(null);
  const [labelPos, setLabelPos] = useState<'left' | 'hidden' | 'right'>('left');

  useEffect(() => {
    const el = titleBarRef.current;
    if (!el) return;
    const container = el.closest('.tabs-container');
    const panel = el.closest('[role="tabpanel"]');
    const frame = el.closest('[class*="windowFrame"]');
    // Only the code block that merges INTO the tab strip (the panel's first child)
    // participates in this logic; everything else keeps the left label.
    if (!container || !panel || !frame || panel.firstElementChild !== frame) {
      setLabelPos('left');
      return;
    }
    const tabs = Array.from(container.querySelectorAll<HTMLElement>('.tabs__item'));
    const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));
    const tabForPanel = tabs[panels.indexOf(panel)] as HTMLElement | undefined;
    const tabText =
      panels.length === tabs.length
        ? (tabForPanel?.textContent || '').trim()
        : (container.querySelector<HTMLElement>('.tabs__item--active')?.textContent || '').trim();
    const tabL = tabText.toLowerCase();
    const langL = (displayName || '').toLowerCase();
    setLabelPos(tabL && tabL === langL ? 'hidden' : 'right');
  }, [displayName]);

  return (
    <Container as="div" className={clsx(styles.windowFrame, className, metadata.className)}>
      <div className={styles.titleBar} ref={titleBarRef}>
        {rawName && labelPos === 'left' && <span className={styles.titleBarLabel}>{rawName}</span>}
        <div className={styles.titleBarRight}>
          {rawName && labelPos === 'right' && <span className={styles.titleBarLabelRight}>{rawName}</span>}
          <AskAiCodeButton
            code={typeof metadata.code === 'string' ? metadata.code : ''}
            label={displayName}
            lang={typeof rawName === 'string' ? rawName : undefined}
          />
          <CodeCopyButton code={typeof metadata.code === 'string' ? metadata.code : ''} />
        </div>
      </div>
      <div className={styles.codeContent}>
        <Content />
      </div>
    </Container>
  );
}
