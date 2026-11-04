import type {ChatMessage as BaseChatMessage} from '@zdoc/chat-ui';

export interface ChatMessage extends BaseChatMessage {
  busy?: boolean;
}

export type {
  Source,
  FeedbackRating,
  ConfidenceLevel,
  AgentType,
  GroundingCitation,
} from '@zdoc/chat-ui';

export interface ChatHistoryEntry {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  sessionId?: string | null;
  conversationId?: string | null;
}
