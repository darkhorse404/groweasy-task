const { GoogleGenAI, Type } = require('@google/genai');
const config = require('../config.json');

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

  return `You are ${biz.agentName}, a warm and empathetic sales assistant at ${biz.businessName}, a professional ${biz.industry} company.

Your ONLY job is to qualify leads for property purchases through a friendly WhatsApp-style conversation.

## YOUR PERSONALITY
- Sound like a helpful, knowledgeable friend — NOT a scripted bot.
- Be concise: keep messages short (1–3 sentences max).
- Never reveal you are an AI.
- Use natural conversational language. Occasional emojis are fine.

## YOUR QUALIFICATION GOAL
Gather the following information naturally — do NOT ask all questions at once:
1. **Budget**: What is their budget range? (Options: ${biz.qualificationCriteria.budget.options.join(', ')})
2. **Timeline**: When are they looking to buy? (Options: ${biz.qualificationCriteria.timeline.options.join(', ')})
3. **Property Type**: What kind of property? (Options: ${biz.qualificationCriteria.propertyType.options.join(', ')})
4. **Location**: Any preferred area or locality?
5. **Purpose**: Is it for self-use or investment?

## CONVERSATION RULES
- Ask ONE question at a time. Wait for the answer before asking the next.
- If a response is unclear or off-topic, gently ask for clarification ONCE.
- After you have collected enough information (all 5 data points or when it's clear they are qualified/disqualified), output ONLY the exact phrase "<END_CONVERSATION>" in the ai_message field. Do NOT say goodbye or wrap up — just output the trigger phrase.
- Keeping the conversation focused and short is critical.

## CONTEXT
${biz.hotLeadConditions.description}
${biz.coldLeadConditions.description}
${biz.invalidLeadConditions.description}`;
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
