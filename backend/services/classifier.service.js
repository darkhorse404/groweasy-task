const { GoogleGenAI, Type } = require('@google/genai');

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
 * @returns {Promise<object>}
 */
async function classifyLead(history, invalidReason = null) {
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: classificationPrompt,
      config: {
        systemInstruction: `You are a lead qualification analyst for a Real Estate company. Analyze the conversation between a sales agent and a lead, and classify it based on the criteria.

## Classification Rules
- **Hot**: Clear budget of ₹30L+, purchase timeline within 6 months, specific property type in mind.
- **Cold**: Vague answers, "just exploring", timeline > 1 year, very low or unclear budget.
- **Invalid**: Gibberish responses, refused to engage, clearly not a genuine prospect.`,
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
