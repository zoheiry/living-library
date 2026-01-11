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
    // Run every 10 minutes to check for scheduled emails
    cron.schedule('*/10 * * * *', async () => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)
        // Format time as HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        // Total minutes from midnight
        const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

        console.log(`[Scheduler] Waking up. Server Time: ${currentTime} (${nowTotalMinutes} mins)`);

        try {
            // 1. Scan for all users
            const scanParams = {
                TableName: TABLE_NAME,
                FilterExpression: "begins_with(EntityId, :prefix)",
                ExpressionAttributeValues: {
                    ":prefix": "USER#"
                }
            };
            // FIX: Pass scanParams to ScanCommand
            const { Items: users } = await docClient.send(new ScanCommand(scanParams));
            const userProfiles = users.filter(item => item.EntityId === 'USER#Profile');

            console.log(`[Scheduler] Found ${userProfiles.length} users.`);

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

                // Calculate User Preference in Minutes
                const [prefHour, prefMinute] = preferredTime.split(':').map(Number);
                const prefTotalMinutes = prefHour * 60 + prefMinute;

                // Calculate difference considering midnight wrap-around (1440 mins/day)
                // (ServerTime - PrefTime + 1440) % 1440
                const diff = (nowTotalMinutes - prefTotalMinutes + 1440) % 1440;

                console.log(`[Scheduler] Checking User: ${user.UserId}`);
                console.log(`   - Pref Time: ${preferredTime} (${prefTotalMinutes} mins)`);
                console.log(`   - Diff: ${diff} mins (Needs 0-9)`);

                // If scheduled time was within the last 10 minutes (0 to 9)
                if (diff >= 0 && diff < 10) {
                    console.log(`   --> MATCH! Sending email...`);
                    if (frequency === 'daily') {
                        await processUserEmail(user.UserId);
                    } else if (frequency === 'weekly' && currentDay === preferredDay) {
                        await processUserEmail(user.UserId);
                    }
                } else {
                    console.log(`   --> No match.`);
                }
            }

        } catch (error) {
            console.error("[Scheduler] Error:", error);
        }
    });

    console.log("Scheduler started: Checks every 10 minutes");
};

module.exports = { startScheduler, processUserEmail };
