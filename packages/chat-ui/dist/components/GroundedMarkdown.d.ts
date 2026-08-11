import { default as React } from 'react';
import { GroundingCitation, Source } from '../types';
export interface GroundedMarkdownProps {
    text: string;
    sources?: Source[];
    grounding?: GroundingCitation[];
}
export declare function GroundedMarkdown({ text, sources, grounding }: GroundedMarkdownProps): React.ReactElement;
//# sourceMappingURL=GroundedMarkdown.d.ts.map