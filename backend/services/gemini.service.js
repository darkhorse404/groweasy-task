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

  // 1. Safely Handle Location Routing
  // Only add the routing block if a root location is explicitly provided
  let routingBlock = '';
  if (biz.location) {
    routingBlock = `\n## LOCATION & BRANCH ROUTING\nOur primary service location is: ${biz.location}.\n- If the user requires services/properties outside ${biz.location}, politely inform them you will note their details and have the regional branch reach out.\n- After informing them of the transfer, proceed to END THE CONVERSATION.`;
  }

  // 2. Handle Rules & Conversation Style
  const customTone = biz.conversationStyle ? `\n- Tone: ${biz.conversationStyle.tone}` : '';
  const rulesText = biz.rules 
    ? `\n## STRICT BEHAVIORAL RULES\n${biz.rules}${customTone}` 
    : `\n## STRICT BEHAVIORAL RULES\n${DEFAULT_RULES}${customTone}`;

  // 3. Handle Questions (from overrides, config, or constants)
  let questionsText = '';
  if (biz.qualifyingQuestions && biz.qualifyingQuestions.length > 0) {
    questionsText = biz.qualifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  } else {
    questionsText = getSectorQuestions(biz.industry).map((q, i) => `${i + 1}. ${q}`).join('\n');
  }

  // 4. Inject specific Target Criteria from config.json
  // This tells the LLM EXACTLY what budget ranges and timelines to look for.
  let criteriaContext = '';
  if (biz.qualificationCriteria) {
    criteriaContext = `\n## TARGET CRITERIA OPTIONS\nWhen asking questions, try to map their answers to these available options:\n`;
    for (const [key, val] of Object.entries(biz.qualificationCriteria)) {
      if (val.options) {
        criteriaContext += `- ${val.label}: ${val.options.join(', ')}\n`;
      }
    }
  }

  return `You are ${biz.agentName}, a highly professional and empathetic human sales assistant representing ${biz.businessName}, operating in the ${biz.industry} sector.

## YOUR OBJECTIVE
Have a natural, friendly, WhatsApp-style text conversation to qualify the lead. You must gently gather information to answer these questions:
${questionsText}
${criteriaContext}${routingBlock}
${rulesText}

## CONVERSATION FLOW RULES
- Ask ONE question at a time. Wait for the answer before asking the next.
- Do NOT list out all the options to the user like a robot. Just ask the question naturally.
- If a response is unclear or off-topic, gently ask for clarification ONCE.
- When you have collected all required information or if the user is clearly disqualified/unresponsive, output ONLY the exact phrase "<END_CONVERSATION>" in the ai_message field. Do NOT say goodbye or wrap up.

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
        abortSignal: controller.signal, // Crucial for the timeout to work
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
              description: "2-3 short, clickable strings predicting what the user might say next."
            }
          },
          required: ["ai_message", "suggested_user_replies"]
        }
      },
    });

    clearTimeout(timeoutId);
    
    // Clean up markdown block if API returns it
    let rawText = response.text.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    return JSON.parse(rawText);

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('API Request timed out (exceeded 10 seconds).');
    }
    throw error;
  }
}

module.exports = { generateChatResponse };