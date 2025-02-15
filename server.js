const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Define your relevant keywords (must match those in Devi AI)
const RELEVANT_KEYWORDS = ["study", "UK", "university", "scholarship", "funded"]; // Modify these as needed

app.use(express.json());
app.use(cors());

app.post("/proxy-webhook", async (req, res) => {
    try {
        console.log("Webhook received:", JSON.stringify(req.body, null, 2));

        // Filter items based on keywords
        let filteredItems = req.body.items.filter(item =>
            item.keywords.some(keyword => 
                RELEVANT_KEYWORDS.includes(keyword.toLowerCase())
            )
        );

        if (filteredItems.length > 0) {
            let slackMessages = filteredItems.map(item => `
📌 *New Lead from ${item.provider.toUpperCase()}*
👤 *Author:* ${item.authorName}  
🔗 *Post URL:* <${item.url}|Click Here>  
📢 *Group:* ${item.groupName || "N/A"}  
💬 *Content:* "${item.content}"  
👍 *Likes:* ${item.likes}  
🕒 *Posted At:* ${item.postedAt}  
            `).join("\n\n");

            // Send filtered results to Slack
            await axios.post(SLACK_WEBHOOK_URL, { text: slackMessages });
        }

        res.json({ success: true, message: "Processed webhook data" });
    } catch (error) {
        console.error("Error forwarding to Slack:", error);
        res.status(500).json({ error: "Failed to process webhook" });
    }
});

// Health check route
app.get("/", (req, res) => {
    res.send("Slack Webhook Proxy is live!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handle Slack Interactive Button Clicks
app.post('/slack/actions', async (req, res) => {
    try {
        // Parse Slack action payload
        const payload = JSON.parse(req.body.payload);
        console.log("Button clicked:", payload);

        // Verify the action is from our button
        if (payload.actions[0].action_id === "pull_devi_ai_leads") {
            // Fetch new leads from Devi AI
            const deviAiResponse = await axios.get('https://devi-ai-api-url.com/get-leads'); // Replace with actual Devi AI API

            // Format response for Slack
            const leads = deviAiResponse.data.items.map(item => 
                `📢 *${item.authorName}* in *${item.groupName}*\n🔗 <${item.url}|View Post>\n📝 ${item.content}\n❤️ Likes: ${item.likes}`
            ).join("\n\n");

            // Send updated message to Slack
            await axios.post(payload.response_url, {
                replace_original: true,
                text: `✅ *Updated Leads from Devi AI:*\n${leads}`
            });

            return res.sendStatus(200);
        }
    } catch (error) {
        console.error("Error fetching Devi AI data:", error);
        res.send({ text: "❌ Error fetching data from Devi AI." });
    }
});
app.post('/send-leads-button', async (req, res) => {
    try {
        const slackMessage = {
            text: "📡 *Devi AI Leads Fetching System*",
            attachments: [
                {
                    text: "Click the button below to refresh leads.",
                    callback_id: "refresh_leads",
                    actions: [
                        {
                            type: "button",
                            text: "🔄 Pull Latest Leads",
                            action_id: "pull_devi_ai_leads",
                            style: "primary"
                        }
                    ]
                }
            ]
        };

        await axios.post('https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', slackMessage); // Replace with Slack Webhook

        res.send("✅ Button sent to Slack!");
    } catch (error) {
        console.error("Error sending button to Slack:", error);
        res.status(500).send("❌ Error sending button.");
    }
});

