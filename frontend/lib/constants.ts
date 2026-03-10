import type { BusinessConfig } from '../types';

export const DEFAULT_CONFIG: BusinessConfig = {
  businessName: 'GrowEasy Realty Group',
  agentName: 'GrowEasy AI',
  industry: 'Real Estate',
  location: 'Pune',
  qualifyingQuestions: [
    "What is your budget for the property?",
    "Are you looking for 2BHK or 3BHK?",
    "When are you planning to move in?"
  ],
  rules: "Be polite. Do not reveal you are an AI. Always try to ask the qualifying questions naturally."
};

export const UI_TEXT = {
  headerTitle: "Workspace Environment",
  headerSubtitle: "Build & Simulate AI Dialogs",
  chatInputPlaceholder: "Type a message...",
  chatPlaceholderText: "Initialize the conversation to test the AI Agent's qualification logic.",
  resultsIdleText: "Awaiting chat session.",
  resultsAnalyzingText: "Analyzing telemetry...",
};
