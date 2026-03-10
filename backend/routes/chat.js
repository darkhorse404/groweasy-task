const express = require('express');
const router = express.Router();
const { generateChatResponse } = require('../services/gemini.service');
const { classifyLead } = require('../services/classifier.service');
const { isGibberish } = require('../utils/gibberish');
const config = require('../config.json');

const sessions = {};

const MAX_TURNS = config.conversationStyle?.maxTurns || 10;
const MAX_CLARIFICATIONS = config.conversationStyle?.clarificationAttempts || 1;

async function evaluateSession(session, invalidReason = null) {
  try {
    session.classification = await classifyLead(session.history, invalidReason);
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

    const initialContext = leadInfo.initialMessage?.trim()
      ? `Lead initial message: "${leadInfo.initialMessage}". Please greet them and begin qualifying.`
      : `Lead Name: ${leadInfo.name || 'Anonymous'}. Lead Source: ${leadInfo.source || 'Direct'}. No initial message. Please introduce yourself and start the conversation naturally.`;

    session.history.push({ role: 'user', content: initialContext });

    try {
      const assistantReply = await generateChatResponse(session.history, session.configOverrides);
      session.history.push({ role: 'assistant', content: assistantReply });

      return res.json({ message: assistantReply });
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

    session.history.push({ role: 'user', content: userMessage });
    session.turnCount++;

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
      const aiResponse = await generateChatResponse(session.history, session.configOverrides);

      if (aiResponse.includes('<END_CONVERSATION>')) {
        session.isEnded = true;
        session.history.push({ role: 'assistant', content: 'Conversation naturally concluded by agent.' });
        await evaluateSession(session);

        return res.json({
          status: 'completed',
          result: session.classification,
        });
      }

      // Continue Path
      session.history.push({ role: 'assistant', content: aiResponse });
      return res.json({
        status: 'chatting',
        message: aiResponse,
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

router.get('/:sessionId', (req, res) => {
  if (!sessions[req.params.sessionId]) return res.status(404).json({ error: 'Not found' });
  return res.json(sessions[req.params.sessionId]);
});

router.delete('/:sessionId', (req, res) => {
  delete sessions[req.params.sessionId];
  return res.json({ message: 'Cleared' });
});

module.exports = router;
