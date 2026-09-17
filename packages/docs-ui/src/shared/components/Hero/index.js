import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python.min.js';
import 'prismjs/components/prism-java.min.js';
import 'prismjs/components/prism-go.min.js';
import 'prismjs/components/prism-bash.min.js';
import 'prismjs/components/prism-json.min.js';
import {useDocsUiText} from '../../i18n/uiText.ts';
import styles from './styles.module.css';

const PRISM_LANG_MAP = {
  Python: 'python',
  Java: 'java',
  Go: 'go',
  NodeJS: 'javascript',
  cURL: 'bash',
};

function highlight(code, lang) {
  const prismLang = PRISM_LANG_MAP[lang] || lang || 'plain';
  if (Prism.languages[prismLang]) {
    return Prism.highlight(code, Prism.languages[prismLang], prismLang);
  }
  return code;
}

// Detect element types in Docusaurus v3 MDX v2.
// Standard HTML tags are mapped to custom components via the MDX provider:
//   h2 → (props) => <Heading as="h2" {...props} />  (anonymous wrapper)
//   pre → MDXPre, code → MDXCode, ul → MDXUl, etc.
// The `as` prop is added inside the wrapper during render, NOT on the element's
// own props. So we cannot rely on child.type or child.props.as for detection.
// Instead we use structural heuristics:
//   - Headings: Docusaurus adds an `id` prop via rehype-slug
//   - Code blocks: nested child has className containing 'language-'
//   - Paragraphs: `p` is NOT remapped by Docusaurus, so type stays 'p'

function isHeading(child) {
  if (!React.isValidElement(child)) return false;
  if (child.type === 'h2') return true;
  if (child.props?.as === 'h2' || child.props?.mdxType === 'h2') return true;
  // Docusaurus MDX v2: headings are function components with auto-generated id
  if (typeof child.type === 'function' && typeof child.props?.id === 'string') return true;
  return false;
}

function isParagraph(child) {
  if (!React.isValidElement(child)) return false;
  // `p` is not remapped by Docusaurus MDXComponents, so type stays 'p'
  if (child.type === 'p') return true;
  if (child.props?.mdxType === 'p') return true;
  return false;
}

// Extract the code element from a pre/CodeBlock child tree.
// Docusaurus wraps pre → MDXPre → MDXCode, so the code element with
// className="language-*" may be nested one or two levels deep.
function extractCodeEl(preChild) {
  if (!React.isValidElement(preChild)) return null;
  // Check the element itself first
  const selfCls = preChild.props?.className || '';
  if (selfCls.includes('language-')) return preChild;
  // Walk up to 3 levels deep to find a code element with a language className
  let el = preChild.props?.children;
  for (let i = 0; i < 3 && React.isValidElement(el); i++) {
    const cls = el.props?.className || '';
    if (cls.includes('language-')) return el;
    el = el.props?.children;
  }
  return null;
}

function isCodeBlock(child) {
  if (!React.isValidElement(child)) return false;
  if (child.type === 'pre') return true;
  // Docusaurus MDXPre/CodeBlock — check if children contain a language class
  if (extractCodeEl(child)) return true;
  return false;
}

function isList(child) {
  if (!React.isValidElement(child)) return false;
  if (child.type === 'ul') return true;
  if (child.props?.mdxType === 'ul') return true;
  // Docusaurus MDXUl: function component whose children are li-like elements
  if (typeof child.type === 'function' && !isHeading(child) && !isCodeBlock(child)) {
    const arr = React.Children.toArray(child.props?.children);
    if (arr.length > 0 && arr.every(c => React.isValidElement(c) && c.props?.children !== undefined)) {
      // Check if first child looks like a list item (has nested content)
      const first = arr[0];
      if (React.isValidElement(first)) {
        const inner = React.Children.toArray(first.props.children);
        const hasLink = inner.some(c => React.isValidElement(c) && (c.type === 'a' || c.props?.href !== undefined));
        if (hasLink) return true;
      }
    }
  }
  return false;
}

const LANG_ORDER = ['Python', 'Java', 'NodeJS', 'Go', 'cURL'];

// Maps fenced code fence identifiers to display tab names.
// Add entries here for aliases or special display names (e.g. cpp → C++).
// Any identifier NOT in this map falls back to: first letter uppercased.
const LANG_MAP = {
  python: 'Python',
  java: 'Java',
  javascript: 'NodeJS',
  js: 'NodeJS',
  nodejs: 'NodeJS',
  go: 'Go',
  bash: 'cURL',
  shell: 'cURL',
  curl: 'cURL',
  cpp: 'C++',
  typescript: 'TypeScript',
  ts: 'TypeScript',
};

function tabName(lang) {
  return LANG_MAP[lang] || (lang.charAt(0).toUpperCase() + lang.slice(1));
}

function parseSlidesFromChildren(children) {
  const slides = [];
  let current = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (isHeading(child)) {
      if (current) slides.push(current);
      const raw = child.props.children;
      const label = Array.isArray(raw)
        ? raw.filter(c => typeof c === 'string').join('')
        : String(raw || '');
      current = { id: label.toLowerCase().replace(/\s+/g, '-'), label, json: '', snippets: {} };

    } else if (isParagraph(child) && current && !current.description) {
      current.description = child.props.children;

    } else if (isCodeBlock(child) && current) {
      const codeEl = extractCodeEl(child) || child.props.children;
      if (!React.isValidElement(codeEl)) return;
      const lang = (codeEl.props.className || '').replace('language-', '').toLowerCase();
      if (!lang) return;
      const text = typeof codeEl.props.children === 'string'
        ? codeEl.props.children.trimEnd()
        : '';
      if (lang === 'json') {
        current.json = text;
      } else {
        current.snippets[tabName(lang)] = text;
      }
    }
  });

  if (current) slides.push(current);
  return slides.filter(s => s.json || Object.keys(s.snippets).length > 0);
}

// Parse CTAs from a leading <ul> that appears before the first <h2> slide.
// Returns [{label, href}] or [] if none found.
function parseCtasFromChildren(children) {
  for (const child of React.Children.toArray(children)) {
    if (!React.isValidElement(child)) continue;
    if (isHeading(child)) break; // reached slides — stop
    if (isList(child)) {
      return React.Children.toArray(child.props.children)
        .filter(c => React.isValidElement(c))
        .map(li => {
          let el = React.Children.toArray(li.props.children)
            .filter(c => typeof c !== 'string' || c.trim() !== '')[0];
          // unwrap p > a
          if (React.isValidElement(el) && (el.type === 'p' || el.props?.as === 'p')) {
            el = React.Children.toArray(el.props.children)
              .find(c => React.isValidElement(c));
          }
          if (React.isValidElement(el) && el.props.href !== undefined) {
            return { label: el.props.children, href: el.props.href };
          }
          return null;
        })
        .filter(Boolean);
    }
  }
  return [];
}

const SLIDE_DURATION = 5000;

// The same icon pair the docs' code blocks use (CodeBlock/Layout), so a copy
// button on the home page is the same control as a copy button in an article.
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

export default function Hero({ children }) {
  const text = useDocsUiText();
  // Separate title/subtitle from slide content
  const childArray = React.Children.toArray(children)
    .filter(c => typeof c !== 'string' || c.trim() !== '');
  const title = childArray[0];
  const subtitle = childArray[1];

  const afterSubtitle = childArray.slice(2);

  const activeSlides = parseSlidesFromChildren(afterSubtitle);

  // Parse CTA buttons from a leading <ul> before the first <h2> slide
  const parsedCtas = parseCtasFromChildren(afterSubtitle);

  // Derive available language tabs from first slide:
  // known languages in canonical order first, then any unknowns in insertion order
  const firstSnippetKeys = Object.keys(activeSlides[0]?.snippets || {});
  const defaultTab = firstSnippetKeys[0] || 'Python';

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlightedJson, setHighlightedJson] = useState('');
  const [highlightedCode, setHighlightedCode] = useState('');
  const [copiedInstall, setCopiedInstall] = useState(false);

  const INSTALL_COMMANDS = {
    humans: 'pip install pymilvus',
    agents: 'npx skills add zilliztech/zilliz-skill',
  };

  // Highlight code when slide or tab changes
  useEffect(() => {
    if (activeSlides.length === 0) return;
    const slide = activeSlides[activeSlide];
    setHighlightedJson(highlight(slide.json, 'json'));
    setHighlightedCode(highlight(slide.snippets[activeTab], activeTab));
  }, [activeSlide, activeTab, activeSlides]);

  // Auto-advance stays; only its readout changed. It used to tick every 50ms to
  // drive a progress bar — with plain tabs there is nothing to fill, so this is
  // one timeout per slide instead of 100 re-renders.
  useEffect(() => {
    if (isPaused) return undefined;
    const id = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % activeSlides.length);
      setCopiedJson(false);
      setCopiedCode(false);
    }, SLIDE_DURATION);
    return () => clearTimeout(id);
  }, [isPaused, activeSlide, activeSlides.length]);

  // If the active tab isn't available in the new slide, reset to first available
  useEffect(() => {
    const keys = Object.keys(activeSlides[activeSlide]?.snippets || {});
    if (keys.length > 0 && !keys.includes(activeTab)) {
      setActiveTab(keys[0]);
    }
  }, [activeSlide, activeSlides, activeTab]);

  // Guard: if no slides parsed, render only text area (after all hooks)
  if (activeSlides.length === 0) {
    return (
      <div className={styles.heroWrapper}>
        <div className={styles.hero}>
          <div className={styles.textArea}>
            <div className={styles.introCopy}>
              {title}
              {subtitle}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const slide = activeSlides[activeSlide];
  // Known langs in canonical order, then any extras (e.g. C++, TypeScript)
  const slideSnippetKeys = Object.keys(slide?.snippets || {});
  const slideLanguages = [
    ...LANG_ORDER.filter(l => slideSnippetKeys.includes(l)),
    ...slideSnippetKeys.filter(l => !LANG_ORDER.includes(l)),
  ];

  function handleSlideChange(index) {
    setActiveSlide(index);
    setCopiedJson(false);
    setCopiedCode(false);
  }

  function handleCopyJson() {
    navigator.clipboard.writeText(slide.json).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 1500);
    });
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(slide.snippets[activeTab]).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    });
  }

  return (
    <div className={styles.heroWrapper}>
      <div className={styles.hero}>
        <div className={styles.textArea}>
          <div className={styles.introCopy}>
            {title}
            {subtitle}
          </div>
          <div className={styles.installWidget}>
            <div className={styles.installWidgetItem}>
              <div className={styles.installWidgetLabel}>{text.hero.forHumans}</div>
              <div className={styles.installCmd}>
                <span className={styles.installPrompt}>$</span>
                <span className={styles.installText}>{INSTALL_COMMANDS.humans}</span>
                <button
                  className={`${styles.installCopy} ${copiedInstall ? styles.copyBtnCopied : ''}`}
                  onClick={() => {
                    navigator.clipboard.writeText(INSTALL_COMMANDS.humans).then(() => {
                      setCopiedInstall(true);
                      setTimeout(() => setCopiedInstall(false), 1500);
                    });
                  }}
                  title={text.common.copyCommand}
                  aria-label={text.common.copyCommand}
                >
                  {copiedInstall ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>
            <div className={styles.installWidgetItem}>
              <div className={styles.installWidgetLabel}>{text.hero.forAgents}</div>
              <div className={styles.installCmd}>
                <span className={styles.installPrompt}>$</span>
                <span className={styles.installText}>{INSTALL_COMMANDS.agents}</span>
                <button
                  className={`${styles.installCopy} ${copiedInstall ? styles.copyBtnCopied : ''}`}
                  onClick={() => {
                    navigator.clipboard.writeText(INSTALL_COMMANDS.agents).then(() => {
                      setCopiedInstall(true);
                      setTimeout(() => setCopiedInstall(false), 1500);
                    });
                  }}
                  title={text.common.copyCommand}
                  aria-label={text.common.copyCommand}
                >
                  {copiedInstall ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Every block below the page title carries its own h2, the way
            Vercel's docs index pages are structured. */}
        <h2 className={styles.sectionTitle}>{text.hero.examplesTitle}</h2>

        <div
          className={styles.slidePane}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/*
            Panel geometry:
              Left panel  → top: 0,    height: 300px
              Right panel → top: 100px (= 300/3)
              Slide title → top: 0, right: 0, width: 56% (above right panel)
          */}
          {/* Slide heading sits ABOVE the panels now — it used to be absolutely
              positioned into the gap left by the overlapping layout. */}
          {/* The slide picker IS the heading now: the chip that is on says which
              slide you are looking at, so the separate title line is gone. */}
          <div className={styles.slideHead}>
            {/* SLIDE_DURATION drives both the timer and the sweep, so the bar
                cannot drift out of step with the actual advance. */}
            <div
              className={styles.slideTabs}
              style={{ '--zd-slide-duration': `${SLIDE_DURATION}ms` }}
            >
              {activeSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.slideTab} ${i === activeSlide ? styles.slideTabActive : ''}`}
                  onClick={() => handleSlideChange(i)}
                >
                  <span className={styles.slideTabLabel}>{s.label}</span>
                </button>
              ))}
            </div>
            <div className={styles.slideDesc}>{slide.description}</div>
          </div>

          <div className={styles.codePanels}>
            {/* LEFT — the data. Deliberately NOT a code block: it is the state of
                the world, not something you copy and run. No white code card, no
                syntax colour, no language label — that chrome is what made a JSON
                array next to a search call read as the call's response. */}
            <div className={styles.jsonPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelCaption}>{text.hero.dataCaption}</span>
                <span className={styles.panelLabel}>json</span>
                <button
                  className={`${styles.copyBtn} ${copiedJson ? styles.copyBtnCopied : ''}`}
                  onClick={handleCopyJson}
                  title={text.hero.copyJson}
                  aria-label={text.hero.copyJson}
                >
                  {copiedJson ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
              <pre
                className={`${styles.code} ${styles.dataCode} language-json`}
                dangerouslySetInnerHTML={{ __html: highlightedJson }}
              />
            </div>

            {/* The arrow rides the divider: it, not the two labels, is what says
                these are one example read left to right. */}
            <div className={styles.flowArrow} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* RIGHT — the query. Full code chrome, because this IS the thing you
                copy and run. */}
            <div className={styles.searchOuter}>
              <div className={styles.searchPanel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelCaption}>{text.hero.codeCaption}</span>
                  <div className={styles.tabs}>
                    {slideLanguages.map((lang) => (
                      <button
                        key={lang}
                        className={`${styles.tab} ${activeTab === lang ? styles.tabActive : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveTab(lang); }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  <button
                    className={`${styles.copyBtn} ${copiedCode ? styles.copyBtnCopied : ''}`}
                    onClick={handleCopyCode}
                    title={text.common.copyCode}
                    aria-label={text.common.copyCode}
                  >
                    {copiedCode ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
                <pre
                  className={`${styles.code} language-${PRISM_LANG_MAP[activeTab] || 'plain'}`}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
