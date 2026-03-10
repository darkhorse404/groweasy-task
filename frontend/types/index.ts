export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
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
}

export interface ChattingResponse {
  status: 'chatting';
  message: string;
}

export interface CompletedResponse {
  status: 'completed';
  result: Classification;
}

export type SendResponse = ChattingResponse | CompletedResponse;

export type ConversationState = 'idle' | 'active' | 'ended';
