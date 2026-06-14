import type {ChatMessage} from '@zdoc/chat-ui';

export type {
  Source,
  FeedbackRating,
  ConfidenceLevel,
  AgentType,
  GroundingCitation,
  ChatMessage,
} from '@zdoc/chat-ui';

export interface ChatHistoryEntry {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}
