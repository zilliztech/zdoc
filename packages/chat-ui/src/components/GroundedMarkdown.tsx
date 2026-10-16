import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { GroundingCitation, Source } from '../types';
import styles from './GroundedMarkdown.module.css';

function splitParagraphs(text: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inCodeBlock = false;

  for (const line of text.split('\n')) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      current += line + '\n';
      continue;
    }
    if (inCodeBlock) {
      current += line + '\n';
      continue;
    }
    if (line.trim() === '' && current.trim()) {
      parts.push(current.trim());
      current = '';
    } else {
      current += line + '\n';
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const markdownComponents = {
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => {
    const wrapped = React.Children.map(children, child => {
      if (React.isValidElement(child) && child.type === 'tr') {
        return <tbody>{child}</tbody>;
      }
      return child;
    });
    return <table {...props}>{wrapped}</table>;
  },
};

function makeCitedComponents(
  sourceIndices: number[],
  sources: Source[],
  onCitationClick?: (sourceIndex: number, url?: string) => void,
) {
  const sups = sourceIndices.map(si => (
    <sup key={`cite-${si}`} className={styles.citationSup}>
      <a
        href={sources[si]?.url}
        className={styles.citationLink}
        title={sources[si]?.title}
        onClick={() => onCitationClick?.(si, sources[si]?.url)}
      >
        {si + 1}
      </a>
    </sup>
  ));

  const CiteP = ({ children, ...props }: any) => (
    <p {...props}>
      {children}
      <span className={styles.citationGroup}>{sups}</span>
    </p>
  );

  return { ...markdownComponents, p: CiteP };
}

export interface GroundedMarkdownProps {
  text: string;
  sources?: Source[];
  grounding?: GroundingCitation[];
  /** Fired when the user clicks an inline citation superscript. Receives the
   * 0-based index into `sources` (the badge shows index + 1) and that source's
   * URL. Navigation is not intercepted — the link opens normally. */
  onCitationClick?: (sourceIndex: number, url?: string) => void;
}

export function GroundedMarkdown({text, sources, grounding, onCitationClick}: GroundedMarkdownProps): React.ReactElement {
  if (!grounding || !sources || grounding.length === 0) {
    return <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{text}</Markdown>;
  }

  const citationMap = new Map<number, number[]>();
  for (const c of grounding) {
    citationMap.set(c.paragraphIndex, c.sourceIndices);
  }

  const paragraphs = splitParagraphs(text);

  return (
    <>
      {paragraphs.map((para, pi) => {
        const cites = citationMap.get(pi);
        const components = cites && cites.length > 0
          ? makeCitedComponents(cites, sources, onCitationClick)
          : markdownComponents;
        return <Markdown key={pi} remarkPlugins={[remarkGfm]} components={components}>{para}</Markdown>;
      })}
    </>
  );
}
