export interface Source {
    title: string;
    url: string;
    score?: number;
    section?: string;
}
export type FeedbackRating = 'up' | 'down' | null;
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type AgentType = 'general' | 'schema' | 'resources' | 'product' | 'code';
export interface GroundingCitation {
    paragraphIndex: number;
    sourceIndices: number[];
}
export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    sources?: Source[];
    grounding?: GroundingCitation[];
    feedback?: FeedbackRating;
    confidence?: ConfidenceLevel;
    agent?: string;
    agentType?: AgentType;
    hookAppend?: string;
    toolCallCount?: number;
    status?: string;
}
//# sourceMappingURL=types.d.ts.map