const cron = require('node-cron');
const { docClient } = require('../db');
const { QueryCommand, ScanCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { generateExcerpt } = require('../services/gemini');
const { sendEmail } = require('../services/email');

const TABLE_NAME = process.env.TABLE_NAME || "LivingBookshelf";

async function processUserEmail(userId) {
    try {
        const command = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "UserId = :uid AND begins_with(EntityId, :prefix)",
            ExpressionAttributeValues: {
                ":uid": userId,
                ":prefix": "BOOK#"
            }
        });
        const { Items } = await docClient.send(command);

        if (Items && Items.length > 0) {
            const randomBook = Items[Math.floor(Math.random() * Items.length)];
            const excerpt = await generateExcerpt(randomBook.Title, randomBook.Author);
            // In a real app we would store email in the user profile and better retrieval
            // For now using userId as email since that was our auth design
            await sendEmail(userId, `Daily Excerpt: ${randomBook.Title}`, `Here is your daily excerpt from ${randomBook.Title} by ${randomBook.Author}:\n\n${excerpt}`);
            console.log(`Sent email to ${userId}`);
        }
    } catch (err) {
        console.error(`Failed to process email for ${userId}:`, err);
    }
}

const startScheduler = () => {
    // Run every day at 8 AM
    // Run every minute to check for scheduled emails
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)
        // Format time as HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        try {
            // 1. Scan for all users
            const scanParams = {
                TableName: TABLE_NAME,
                FilterExpression: "begins_with(EntityId, :prefix)",
                ExpressionAttributeValues: {
                    ":prefix": "USER#"
                }
            };
            const { Items: users } = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
            const userProfiles = users.filter(item => item.EntityId === 'USER#Profile');

            for (const user of userProfiles) {
                const settingsParams = {
                    TableName: TABLE_NAME,
                    Key: {
                        UserId: user.UserId,
                        EntityId: `SETTINGS#${user.UserId}`
                    }
                };
                const { Item: settings } = await docClient.send(new GetCommand(settingsParams));

                // Defaults
                const frequency = settings ? settings.EmailFrequency : 'daily';
                const preferredTime = settings?.EmailTime || '08:00';
                const preferredDay = settings?.EmailDay !== undefined ? Number(settings.EmailDay) : 1; // Default Monday

                // Check if it's time to send
                if (preferredTime === currentTime) {
                    if (frequency === 'daily') {
                        await processUserEmail(user.UserId);
                    } else if (frequency === 'weekly' && currentDay === preferredDay) {
                        await processUserEmail(user.UserId);
                    }
                }
            }

        } catch (error) {
            console.error("Error in scheduler:", error);
        }
    });

    console.log("Scheduler started: Checks every minute for scheduled emails");
};

module.exports = { startScheduler, processUserEmail };
