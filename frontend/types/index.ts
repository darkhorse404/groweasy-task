// ─── Shared TypeScript types for the Lead Qualification Chatbot ───────────────

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  suggestedReplies?: string[];
}

export interface LeadInfo {
  name: string;
  source?: string;
  initialMessage?: string;
}

export interface BusinessConfig {
  businessName: string;
  agentName: string;
  industry: string;
  location?: string;
  qualifyingQuestions?: string[];
  rules?: string;
}

export interface ExtractedMetadata {
  budget: string | null;
  timeline: string | null;
  propertyType: string | null;
  location: string | null;
  purpose: string | null;
  leadName: string | null;
}

export type LeadStatus = 'Hot' | 'Cold' | 'Invalid';
export type Confidence = 'High' | 'Medium' | 'Low';

export interface Classification {
  status: LeadStatus;
  extractedMetadata: ExtractedMetadata;
  summary: string;
  confidence: Confidence;
}

export interface StartResponse {
  message: string;
  suggested_replies?: string[];
}

export interface ChattingResponse {
  status: 'chatting';
  message: string;
  suggested_replies?: string[];
}

export interface CompletedResponse {
  status: 'completed';
  result: Classification;
}

export type SendResponse = ChattingResponse | CompletedResponse;

export type ConversationState = 'idle' | 'active' | 'ended';
