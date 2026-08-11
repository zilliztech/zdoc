import { default as React } from 'react';
import { ChatMessage } from '../types';
export interface ChatMessageBubbleProps {
    message: ChatMessage;
    isStreaming?: boolean;
    isLast?: boolean;
    onFeedback?: (rating: 'up' | 'down') => void;
}
export declare function ChatMessageBubble({ message, isStreaming, isLast, onFeedback, }: ChatMessageBubbleProps): React.ReactElement;
//# sourceMappingURL=ChatMessageBubble.d.ts.map