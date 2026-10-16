import React from 'react';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import {describe, it, expect, vi, afterEach} from 'vitest';

import {GroundedMarkdown} from './GroundedMarkdown';
import type {GroundingCitation, Source} from '../types';

afterEach(cleanup);

const sources: Source[] = [
  {title: 'Vector search', url: 'https://docs.zilliz.com/docs/single-vector-search'},
  {title: 'Partition key', url: 'https://docs.zilliz.com/docs/use-partition-key'},
];

const grounding: GroundingCitation[] = [
  {paragraphIndex: 0, sourceIndices: [0, 1]},
];

const text = 'First paragraph, cited twice.\n\nSecond paragraph, uncited.';

describe('GroundedMarkdown onCitationClick', () => {
  it('reports the 0-based source index and its URL on citation click', () => {
    const onCitationClick = vi.fn();
    render(
      <GroundedMarkdown text={text} sources={sources} grounding={grounding} onCitationClick={onCitationClick} />,
    );

    fireEvent.click(screen.getByTitle('Partition key'));
    expect(onCitationClick).toHaveBeenCalledTimes(1);
    expect(onCitationClick).toHaveBeenCalledWith(1, 'https://docs.zilliz.com/docs/use-partition-key');

    fireEvent.click(screen.getByTitle('Vector search'));
    expect(onCitationClick).toHaveBeenCalledWith(0, 'https://docs.zilliz.com/docs/single-vector-search');
  });

  it('renders citations without the callback without crashing', () => {
    render(<GroundedMarkdown text={text} sources={sources} grounding={grounding} />);
    expect(screen.getByTitle('Vector search')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Vector search'));
  });

  it('never fires for uncited or ungrounded text', () => {
    const onCitationClick = vi.fn();
    const {container} = render(
      <GroundedMarkdown text="Plain markdown, no grounding." onCitationClick={onCitationClick} />,
    );
    expect(container.querySelector('a')).toBeNull();
    expect(onCitationClick).not.toHaveBeenCalled();
  });
});
