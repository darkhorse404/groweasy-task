import axios from 'axios';
import { StartResponse, SendResponse, LeadInfo, BusinessConfig, CompletedResponse } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Initiates a new conversation session.
 */
export async function startConversation(
  sessionId: string,
  config: BusinessConfig,
  leadInfo: LeadInfo
): Promise<StartResponse> {
  const { data } = await axios.post<StartResponse>(`${API_BASE}/api/chat/start`, {
    sessionId,
    config,
    leadInfo,
  });
  return data;
}

/**
 * Sends a message in an existing conversation.
 */
export async function sendMessage(sessionId: string, message: string): Promise<SendResponse> {
  const { data } = await axios.post<SendResponse>(`${API_BASE}/api/chat/send`, {
    sessionId,
    message,
  });
  return data;
}

/**
 * Force classifies a session (e.g. on inactivity).
 */
export async function classifySession(sessionId: string, reason: string): Promise<CompletedResponse> {
  const { data } = await axios.post<CompletedResponse>(`${API_BASE}/api/chat/classify`, {
    sessionId,
    reason,
  });
  return data;
}
