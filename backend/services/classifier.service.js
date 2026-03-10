const { GoogleGenAI, Type } = require('@google/genai');
const { getSectorCriteria } = require('../constants');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Classifies a completed lead conversation using Gemini Structured Outputs.
 *
 * Returns a strict JSON object with:
 * {
 *   status: "Hot" | "Cold" | "Invalid",
 *   extractedMetadata: {
 *     budget: string | null,
 *     timeline: string | null,
 *     propertyType: string | null,
 *     location: string | null,
 *     purpose: string | null,
 *     leadName: string | null
 *   },
 *   summary: string,
 *   confidence: "High" | "Medium" | "Low"
 * }
 *
 * @param {Array}  history     - Full conversation history [{role, content}, ...]
 * @param {string} invalidReason - Optional explicit reason if flagged before natural end
 * @param {string} industry      - The business industry for specialized context
 * @returns {Promise<object>}
 */
async function classifyLead(history, invalidReason = null, industry = 'General') {
  const conversationText = history
    .map((m) => `${m.role === 'user' ? 'Lead' : 'Agent'}: ${m.content}`)
    .join('\n');

  const classificationPrompt = invalidReason
    ? `The lead was flagged as INVALID for the following reason: "${invalidReason}".\n\nConversation:\n${conversationText}`
    : `Conversation:\n${conversationText}`;

  // Use Gemini Structured Outputs schema definition
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      status: {
        type: Type.STRING,
        enum: ['Hot', 'Cold', 'Invalid'],
        description: 'Lead qualification status based on the business rules.',
      },
      extractedMetadata: {
        type: Type.OBJECT,
        properties: {
          budget: { type: Type.STRING, nullable: true },
          timeline: { type: Type.STRING, nullable: true },
          propertyType: { type: Type.STRING, nullable: true },
          location: { type: Type.STRING, nullable: true },
          purpose: { type: Type.STRING, nullable: true },
          leadName: { type: Type.STRING, nullable: true },
        },
        required: ['budget', 'timeline', 'propertyType', 'location', 'purpose', 'leadName'],
      },
      summary: {
        type: Type.STRING,
        description: 'A 2-3 sentence summary of the lead\'s situation and why they were classified this way.',
      },
      confidence: {
        type: Type.STRING,
        enum: ['High', 'Medium', 'Low'],
      },
    },
    required: ['status', 'extractedMetadata', 'summary', 'confidence'],
  };

  try {
    const criteria = getSectorCriteria(industry);
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: classificationPrompt,
      config: {
        systemInstruction: `You are a lead qualification analyst for a ${industry} company. Analyze the conversation between a sales agent and a lead, and classify it based on the criteria.

## Classification Rules
- **Hot**: ${criteria.hot}
- **Cold**: ${criteria.cold}
- **Invalid**: ${criteria.invalid}

If the transcript ends with a SYSTEM NOTE stating the user abandoned the chat, classify the Lead Status as 'Cold' immediately.`,
        temperature: 0.2, // Low temp for extraction tasks
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (error) {
    console.error('❌ Gemini Classifier JSON parse/network error:', error.message);

    // Safe fallback
    return {
      status: invalidReason ? 'Invalid' : 'Cold',
      extractedMetadata: {
        budget: null, timeline: null, propertyType: null,
        location: null, purpose: null, leadName: null,
      },
      summary: 'Classification could not be determined due to a parsing or API error.',
      confidence: 'Low',
    };
  }
}

module.exports = { classifyLead };
