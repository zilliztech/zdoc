import { default as React } from 'react';
import { GroundingCitation, Source } from '../types';
export interface GroundedMarkdownProps {
    text: string;
    sources?: Source[];
    grounding?: GroundingCitation[];
    /** Fired when the user clicks an inline citation superscript. Receives the
     * 0-based index into `sources` (the badge shows index + 1) and that source's
     * URL. Navigation is not intercepted — the link opens normally. */
    onCitationClick?: (sourceIndex: number, url?: string) => void;
}
export declare function GroundedMarkdown({ text, sources, grounding, onCitationClick }: GroundedMarkdownProps): React.ReactElement;
//# sourceMappingURL=GroundedMarkdown.d.ts.map