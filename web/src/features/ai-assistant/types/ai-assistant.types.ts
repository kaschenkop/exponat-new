export type AiMessageRole = 'user' | 'assistant';

export type AiMessageType = {
  id: string;
  role: AiMessageRole;
  content: string;
};
