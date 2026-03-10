const { GoogleGenAI, Type } = require('@google/genai');
const config = require('../config.json');
const { getSectorQuestions, DEFAULT_RULES } = require('../constants');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Builds the dynamic system prompt instructions based on the config.json.
 * @param {object} overrides - Optional config overrides.
 * @returns {string}
 */
function buildSystemInstruction(overrides = {}) {
  const biz = { ...config, ...overrides };

  const locationText = biz.location ? ` in ${biz.location}` : '';
  const rulesText = biz.rules 
    ? `\n## STRICT BEHAVIORAL RULES\n${biz.rules}` 
    : `\n## YOUR PERSONALITY\n${DEFAULT_RULES}`;

  const questionsText = biz.qualifyingQuestions && biz.qualifyingQuestions.length > 0
    ? `\n## YOUR QUALIFICATION GOAL\nYou must gather information to answer the following qualifying questions:\n${biz.qualifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : `\n## YOUR QUALIFICATION GOAL\nGather the following information naturally — do NOT ask all questions at once:\n${getSectorQuestions(biz.industry).map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

  return `You are ${biz.agentName}, a highly professional and empathetic human sales assistant representing ${biz.businessName}, operating in the ${ biz.industry} sector.

## YOUR OBJECTIVE
Have a natural, friendly, WhatsApp-style text conversation to qualify the lead. You must gently gather information to answer the following qualifying questions:
${questionsText}

## LOCATION & BRANCH ROUTING
Our primary service location is: ${locationText}.
- If the user requires physical services, properties, or investments outside this location, politely inform them that while you are based in ${locationText}, you will note their details and have the respective regional branch reach out to them.
- Once you tell them they will be transferred to another branch, consider the qualification complete and proceed to END THE CONVERSATION.
    
Your ONLY job is to qualify leads through a friendly WhatsApp-style conversation.

## CONVERSATION RULES
- Ask ONE question at a time. Wait for the answer before asking the next.
- If a response is unclear or off-topic, gently ask for clarification ONCE.
- Keep the conversation focused and short.
- When you have collected all required information or if the user is clearly disqualified, output ONLY the exact phrase "<END_CONVERSATION>" in the ai_message field. Do NOT say goodbye or wrap up — just output the trigger phrase.
${rulesText}

## CONTEXT
${biz.hotLeadConditions ? biz.hotLeadConditions.description : ''}
${biz.coldLeadConditions ? biz.coldLeadConditions.description : ''}
${biz.invalidLeadConditions ? biz.invalidLeadConditions.description : ''}`.trim();
}

/**
 * Converts generic {role, content} history to Gemini's expected format.
 */
function formatHistory(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

/**
 * Sends a message to the Gemini API with a 10s timeout using AbortController.
 * Returns an object with the ai message and suggested replies.
 * @param {Array} messages - Full conversation history [{role, content}].
 * @param {object} configOverrides - Optional overrides.
 * @returns {Promise<{ ai_message: string, suggested_user_replies: string[] }>}
 */
async function generateChatResponse(messages, configOverrides = {}) {
  const systemInstruction = buildSystemInstruction(configOverrides);
  const geminiHistory = formatHistory(messages);

  const latestMessage = geminiHistory.pop()?.parts[0]?.text || '';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: [
        ...geminiHistory,
        { role: 'user', parts: [{ text: latestMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ai_message: { 
              type: Type.STRING,
              description: "The actual text response from the assistant."
            },
            suggested_user_replies: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "2-3 short, clickable strings predicting what the user might say next based on the AI's question to speed up the conversation."
            }
          },
          required: ["ai_message", "suggested_user_replies"]
        }
      },
    });

    clearTimeout(timeoutId);
    return JSON.parse(response.text);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('API Request timed out (exceeded 10 seconds).');
    }
    throw error;
  }
}

module.exports = { generateChatResponse };
