const express = require('express');
const router = express.Router();
const { docClient } = require('../db');
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { generateExcerpt } = require('../services/gemini');

const TABLE_NAME = process.env.TABLE_NAME || "LivingBookshelf";

const authMiddleware = require('../middleware/auth');

router.get('/:entityId', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { entityId } = req.params;

    // 1. Get Book Info
    const params = {
        TableName: TABLE_NAME,
        Key: {
            UserId: userId,
            EntityId: entityId
        }
    };

    try {
        const { Item } = await docClient.send(new GetCommand(params));
        if (!Item) {
            return res.status(404).json({ error: "Book not found" });
        }

        // 2. Call Gemini
        const excerpt = await generateExcerpt(Item.Title, Item.Author);

        // Optional: Save excerpt to history? For now just return it.
        res.json({ excerpt });

    } catch (error) {
        console.error("Error generating excerpt:", error);
        res.status(500).json({ error: "Could not generate excerpt" });
    }
});

module.exports = router;
