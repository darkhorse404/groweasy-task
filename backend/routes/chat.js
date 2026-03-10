const express = require('express');
const router = express.Router();
const { generateChatResponse } = require('../services/gemini.service');
const { classifyLead } = require('../services/classifier.service');
const { isGibberish } = require('../utils/gibberish');
const config = require('../config.json');

// ─── In-Memory Session Store ───────────────────────────────────────────────────
// { [sessionId]: { history, leadInfo, configOverrides, turnCount,
//                  clarificationCount, classification, isEnded } }
const sessions = {};

const MAX_TURNS = config.conversationStyle?.maxTurns || 10;
const MAX_CLARIFICATIONS = config.conversationStyle?.clarificationAttempts || 1;

// ─── Helper: Evaluate classification async ─────────────────────────────────────
async function evaluateSession(session, invalidReason = null) {
  try {
    const industry = session.configOverrides?.industry || config.industry || 'General';
    session.classification = await classifyLead(session.history, invalidReason, industry);
  } catch (err) {
    session.classification = {
      status: invalidReason ? 'Invalid' : 'Cold',
      extractedMetadata: {
        budget: null, timeline: null, propertyType: null,
        location: null, purpose: null, leadName: null,
      },
      summary: 'Classification unavailable. Error: ' + err.message,
      confidence: 'Low',
    };
  }
}

// ─── 1. POST /api/chat/start ───────────────────────────────────────────────────
/**
 * Body: { sessionId: string, config: object, leadInfo: object }
 * Response: { message: string }
 */
router.post('/start', async (req, res) => {
  try {
    const { sessionId, config: configOverrides = {}, leadInfo = {} } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required.' });
    }

    // Initialize session
    sessions[sessionId] = {
      history: [],
      leadInfo,
      configOverrides,
      turnCount: 0,
      clarificationCount: 0,
      classification: null,
      isEnded: false,
    };

    const session = sessions[sessionId];

    // Build the initial context injected as the first "user" message
    const initialContext = leadInfo.initialMessage?.trim()
      ? `Lead initial message: "${leadInfo.initialMessage}". Please greet them and begin qualifying.`
      : `Lead Name: ${leadInfo.name || 'Anonymous'}. Lead Source: ${leadInfo.source || 'Direct'}. No initial message. Please introduce yourself and start the conversation naturally.`;

    session.history.push({ role: 'user', content: initialContext });

    try {
      const gptReply = await generateChatResponse(session.history, session.configOverrides);
      session.history.push({ role: 'assistant', content: gptReply.ai_message });

      return res.json({ 
        message: gptReply.ai_message,
        suggested_replies: gptReply.suggested_user_replies
      });
    } catch (apiError) {
      if (apiError.message.includes('timed out')) {
        return res.status(504).json({ error: 'Sorry, our agent is experiencing high traffic. Please try again.' });
      }
      throw apiError;
    }

  } catch (err) {
    console.error('❌ /api/chat/start error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ─── 2. POST /api/chat/send ────────────────────────────────────────────────────
/**
 * Body: { sessionId: string, message: string }
 * Response:
 *  - Continue:  { status: "chatting", message: string }
 *  - Concluded: { status: "completed", result: { classification: string, metadata: object, summary: string } }
 */
router.post('/send', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !sessions[sessionId]) {
      return res.status(404).json({ error: 'Session not found or expired.' });
    }

    const session = sessions[sessionId];

    if (session.isEnded) {
      return res.status(400).json({ error: 'This conversation has already ended.' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'message cannot be empty.' });
    }

    const userMessage = message.trim();

    // ── Gibberish Detection (Path B) ───────────────────────────────────────────
    if (isGibberish(userMessage)) {
      if (session.clarificationCount >= MAX_CLARIFICATIONS) {
        session.isEnded = true;
        session.history.push({ role: 'user', content: userMessage });
        await evaluateSession(session, 'Lead consistently gave gibberish responses.');

        return res.json({
          status: 'completed',
          result: session.classification,
        });
      }

      // First time clarifying
      session.clarificationCount++;
      const clarifyReply = "I'm sorry, I didn't quite catch that. Could you clarify your property requirements?";
      session.history.push({ role: 'user', content: userMessage });
      session.history.push({ role: 'assistant', content: clarifyReply });
      session.turnCount++;

      return res.json({
        status: 'chatting',
        message: clarifyReply,
      });
    }

    // ── Path A: Normal Conversation ────────────────────────────────────────────
    session.history.push({ role: 'user', content: userMessage });
    session.turnCount++;

    // Check Max turns
    if (session.turnCount >= MAX_TURNS) {
      session.isEnded = true;
      const closingFallback = "I have all the details I need. Our team will follow up shortly. Thank you!";
      session.history.push({ role: 'assistant', content: closingFallback });
      await evaluateSession(session);

      return res.json({
        status: 'completed',
        result: session.classification,
      });
    }

    try {
      // Call Gemini API
      const aiResponseObj = await generateChatResponse(session.history, session.configOverrides);
      const aiResponseText = aiResponseObj.ai_message;

      // Path C: End Trigger Detected
      if (aiResponseText.includes('<END_CONVERSATION>')) {
        session.isEnded = true;
        session.history.push({ role: 'assistant', content: 'Conversation naturally concluded by agent.' });
        await evaluateSession(session);

        return res.json({
          status: 'completed',
          result: session.classification,
        });
      }

      // Continue Path
      session.history.push({ role: 'assistant', content: aiResponseText });
      return res.json({
        status: 'chatting',
        message: aiResponseText,
        suggested_replies: aiResponseObj.suggested_user_replies
      });

    } catch (apiError) {
      if (apiError.message.includes('timed out')) {
        return res.status(504).json({ error: 'Sorry, our agent is experiencing high traffic. Please try again.' });
      }
      throw apiError;
    }

  } catch (err) {
    console.error('❌ /api/chat/send error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ─── 3. POST /api/chat/classify ────────────────────────────────────────────────
/**
 * Force ends and classifies a session (e.g., for inactivity or manual stop)
 * Body: { sessionId: string, reason: string }
 */
router.post('/classify', async (req, res) => {
  try {
    const { sessionId, reason } = req.body;
    const session = sessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.isEnded && session.classification) {
      return res.json({ result: session.classification });
    }

    session.isEnded = true;
    
    if (reason === 'Inactivity') {
      session.history.push({ role: 'user', content: '[SYSTEM NOTE: User abandoned chat.]' });
    }

    await evaluateSession(session, reason || 'Manual termination');

    return res.json({
      status: 'completed',
      result: session.classification,
    });
  } catch (err) {
    console.error('❌ /api/chat/classify error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ─── Debug Routes ──────────────────────────────────────────────────────────────
router.get('/:sessionId', (req, res) => {
  if (!sessions[req.params.sessionId]) return res.status(404).json({ error: 'Not found' });
  return res.json(sessions[req.params.sessionId]);
});

router.delete('/:sessionId', (req, res) => {
  delete sessions[req.params.sessionId];
  return res.json({ message: 'Cleared' });
});

module.exports = router;
