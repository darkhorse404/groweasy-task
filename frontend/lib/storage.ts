import type { Classification, LeadInfo, BusinessConfig } from '../types';

export interface SavedSession {
  sessionId: string;
  date: string;
  leadInfo: LeadInfo;
  config: BusinessConfig;
  classification: Classification;
}

const STORAGE_KEY = 'lead_qualifier_sessions';

export function saveCompletedSession(
  sessionId: string,
  leadInfo: LeadInfo,
  config: BusinessConfig,
  classification: Classification
) {
  if (typeof window === 'undefined') return;

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const sessions: SavedSession[] = existing ? JSON.parse(existing) : [];

    // Avoid duplicates
    if (!sessions.find((s) => s.sessionId === sessionId)) {
      sessions.unshift({
        sessionId,
        date: new Date().toISOString(),
        leadInfo,
        config,
        classification,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Failed to save session to localStorage', error);
  }
}

export function getSavedSessions(): SavedSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Failed to read sessions from localStorage', error);
    return [];
  }
}
