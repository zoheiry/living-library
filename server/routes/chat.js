const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { chatWithBook } = require('../services/gemini');

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { title, author, userMessage, history, isInit } = req.body;

    if (!title || !author || (!userMessage && !isInit)) {
        return res.status(400).json({ error: "Missing required fields: title, author, userMessage" });
    }

    const message = isInit
        ? "Hello! Please introduce yourself using your persona. be brief, and then suggest a conversation path by asking me a question about my experience reading you."
        : userMessage;

    try {
        const reply = await chatWithBook(title, author, message, history);
        res.json({ reply, userMessage: message }); // Return the used userMessage so frontend can store it
    } catch (error) {
        console.error("Chat route error:", error);
        res.status(500).json({ error: "Failed to process chat message" });
    }
});

module.exports = router;
