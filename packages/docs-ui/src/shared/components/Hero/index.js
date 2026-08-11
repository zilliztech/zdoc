import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
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
  const [progress, setProgress] = useState(0);
  const [topPanel, setTopPanel] = useState('right'); // 'left' or 'right'
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

  useEffect(() => {
    setProgress(0);
    if (isPaused) return;
    const start = Date.now();
    const id = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        setActiveSlide((prev) => (prev + 1) % activeSlides.length);
        setCopiedJson(false);
        setCopiedCode(false);
      }
    }, 50);
    return () => clearInterval(id);
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
            {title}
            {subtitle}
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
          {title}
          {subtitle}
          <div className={styles.installWidget}>
            <div className={styles.installWidgetItem}>
              <div className={styles.installWidgetLabel}>{text.hero.forHumans}</div>
              <div className={styles.installCmd}>
                <span className={styles.installPrompt}>$</span>
                <span className={styles.installText}>{INSTALL_COMMANDS.humans}</span>
                <button
                  className={styles.installCopy}
                  onClick={() => {
                    navigator.clipboard.writeText(INSTALL_COMMANDS.humans).then(() => {
                      setCopiedInstall(true);
                      setTimeout(() => setCopiedInstall(false), 1500);
                    });
                  }}
                  title={text.common.copyCommand}
                  aria-label={text.common.copyCommand}
                >
                  {copiedInstall ? '✓' : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className={styles.installWidgetItem}>
              <div className={styles.installWidgetLabel}>{text.hero.forAgents}</div>
              <div className={styles.installCmd}>
                <span className={styles.installPrompt}>$</span>
                <span className={styles.installText}>{INSTALL_COMMANDS.agents}</span>
                <button
                  className={styles.installCopy}
                  onClick={() => {
                    navigator.clipboard.writeText(INSTALL_COMMANDS.agents).then(() => {
                      setCopiedInstall(true);
                      setTimeout(() => setCopiedInstall(false), 1500);
                    });
                  }}
                  title={text.common.copyCommand}
                  aria-label={text.common.copyCommand}
                >
                  {copiedInstall ? '✓' : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/*
            Panel geometry:
              Left panel  → top: 0,    height: 300px
              Right panel → top: 100px (= 300/3)
              Slide title → top: 0, right: 0, width: 56% (above right panel)
          */}
          <div className={styles.codePanels}>
            {/* Title + description — top-right corner above right panel */}
            <div className={styles.slideTitle}>
              {slide.label}
            </div>
            <div className={styles.slideDesc}>
              {slide.description}
            </div>

            {/* Left: JSON document panel */}
            <div
              className={styles.jsonPanel}
              style={{ zIndex: topPanel === 'left' ? 2 : 1 }}
              onClick={() => setTopPanel('left')}
            >
              <div className={styles.panelHeader}>
                <div className={styles.dots}>
                  <span className={`${styles.dot} ${styles.dotRed}`} />
                  <span className={`${styles.dot} ${styles.dotYellow}`} />
                  <span className={`${styles.dot} ${styles.dotGreen}`} />
                </div>
                <span className={styles.panelLabel} />
                <button
                  className={styles.copyBtn}
                  onClick={handleCopyJson}
                  title={text.hero.copyJson}
                  aria-label={text.hero.copyJson}
                >
                  {copiedJson ? '✓' : <Copy size={16} />}
                </button>
              </div>
              <pre
                className={`${styles.code} language-json`}
                dangerouslySetInnerHTML={{ __html: highlightedJson }}
              />
            </div>

            {/* Right: Search code panel */}
            <div
              className={styles.searchOuter}
              style={{ zIndex: topPanel === 'right' ? 2 : 1 }}
              onClick={() => setTopPanel('right')}
            >
              <div className={styles.tabs}>
                {slideLanguages.map((lang) => (
                  <button
                    key={lang}
                    className={`${styles.tab} ${activeTab === lang ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <div className={styles.searchPanel}>
                <div className={styles.panelHeader}>
                  <div className={styles.dots}>
                    <span className={`${styles.dot} ${styles.dotRed}`} />
                    <span className={`${styles.dot} ${styles.dotYellow}`} />
                    <span className={`${styles.dot} ${styles.dotGreen}`} />
                  </div>
                  <span className={styles.panelLabel}>{activeTab}</span>
                  <button
                    className={styles.copyBtn}
                    onClick={handleCopyCode}
                    title={text.common.copyCode}
                    aria-label={text.common.copyCode}
                  >
                    {copiedCode ? '✓' : <Copy size={16} />}
                  </button>
                </div>
                <pre
                  className={`${styles.code} language-${PRISM_LANG_MAP[activeTab] || 'plain'}`}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </div>
            </div>
          </div>

          {/* Progress bars — clickable to jump to slide */}
          <div className={styles.progressBars}>
            {activeSlides.map((s, i) => (
              <button
                key={s.id}
                className={styles.progressTrack}
                onClick={() => handleSlideChange(i)}
                aria-label={text.hero.goTo(s.label)}
              >
                <div
                  className={styles.progressFill}
                  style={{
                    width:
                      i < activeSlide ? '100%' :
                      i === activeSlide ? `${progress}%` :
                      '0%',
                  }}
                />
                <span className={styles.progressLabel}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
