import { Router } from 'express';
import { pool } from '../db.js';
import { translateText } from '../services/translation.js';

const router = Router();

router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await pool.query(
      `SELECT m.id, m.body, m.source_language, m.created_at,
              u.id AS sender_id, u.name AS sender_name
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT 200`,
      [conversationId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to load messages' });
  }
});

router.post('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, body, sourceLanguage = 'th' } = req.body;

    if (!senderId || !body?.trim()) {
      return res.status(400).json({ success: false, message: 'senderId and body are required' });
    }

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, body, source_language)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversationId, senderId, body.trim(), sourceLanguage]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to create message' });
  }
});

router.post('/:messageId/translate', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { targetLanguage } = req.body;

    const message = await pool.query(
      'SELECT id, body, source_language FROM messages WHERE id = $1',
      [messageId]
    );

    if (!message.rows[0]) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const m = message.rows[0];
    const translated = await translateText(m.body, m.source_language, targetLanguage);

    await pool.query(
      `INSERT INTO message_translations (message_id, language, translated_body)
       VALUES ($1, $2, $3)
       ON CONFLICT (message_id, language)
       DO UPDATE SET translated_body = EXCLUDED.translated_body`,
      [messageId, targetLanguage, translated]
    );

    res.json({ success: true, data: { messageId, language: targetLanguage, translated } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Translation failed' });
  }
});

export default router;
