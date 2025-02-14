const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS

// Slack Webhook URL (Stored in .env for security)
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Handle Incoming Webhooks from Devi AI
app.post("/proxy-webhook", async (req, res) => {
    try {
        const { id, type, created, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "No valid items found in payload" });
        }

        // Extract relevant lead details
        let messages = items.map(item => {
            return `🚀 **New Lead from ${item.provider.toUpperCase()}**\n📌 *${item.authorName}* posted in *${item.groupName || "N/A"}*\n📝 "${item.content}"\n🔗 [View Post](${item.url})\n📅 Posted at: ${item.postedAt}\n❤️ Likes: ${item.likes}\n🆔 Lead ID: ${item.id}`;
        });

        // Slack message payload
        const slackPayload = {
            text: messages.join("\n\n")
        };

        // Send message to Slack Webhook
        await axios.post(SLACK_WEBHOOK_URL, slackPayload, {
            headers: { "Content-Type": "application/json" }
        });

        res.json({ success: true, message: "Lead forwarded to Slack successfully!" });
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Failed to process webhook" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy Server running on port ${PORT}`));
