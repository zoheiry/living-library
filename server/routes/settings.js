const express = require('express');
const router = express.Router();
const { docClient } = require('../db');
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME || "LivingBookshelf";

const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get user settings
router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const params = {
        TableName: TABLE_NAME,
        Key: {
            UserId: userId,
            EntityId: `SETTINGS#${userId}`
        }
    };

    try {
        const { Item } = await docClient.send(new GetCommand(params));
        // Return defaults if no settings found
        res.json(Item || { emailFrequency: 'daily', emailAddress: '' });
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Could not fetch settings" });
    }
});

// Update user settings
router.post('/', async (req, res) => {
    const userId = req.user.userId;
    const { emailFrequency, emailTime, emailDay } = req.body;

    const params = {
        TableName: TABLE_NAME,
        Item: {
            UserId: userId,
            EntityId: `SETTINGS#${userId}`,
            EmailFrequency: emailFrequency,
            EmailTime: emailTime,
            EmailDay: emailDay,
            AvatarIndex: req.body.avatarIndex // Add AvatarIndex
        }
    };

    try {
        await docClient.send(new PutCommand(params));
        res.json({ success: true, settings: params.Item });
    } catch (error) {
        console.error("Error saving settings:", error);
        res.status(500).json({ error: "Could not save settings" });
    }
});

const { startScheduler, processUserEmail } = require('../cron/scheduler');

// ... existing code ...

// Trigger daily email manually (Test)
router.post('/trigger-email', async (req, res) => {
    const userId = req.user.userId;
    try {
        console.log(`Manually triggering email for ${userId}`);
        await processUserEmail(userId);
        res.json({ message: 'Email process triggered. Check server logs/email.' });
    } catch (error) {
        console.error("Manual trigger error:", error);
        res.status(500).json({ error: 'Failed to trigger email' });
    }
});

module.exports = router;
