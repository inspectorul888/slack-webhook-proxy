// Import necessary modules
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors());  // Enable CORS for Devi AI

// ✅ Webhook for Receiving Leads from Devi AI
app.post('/proxy-webhook', async (req, res) => {
    console.log("🔹 Webhook received from Devi AI:", req.body);

    if (!req.body.items || req.body.items.length === 0) {
        return res.status(400).json({ success: false, message: "⚠️ No valid lead data received." });
    }

    // Extract lead details
    const lead = req.body.items[0];  // First item in the array
    const slackMessage = {
        text: `🚀 *New Lead from Devi AI!*`,
        attachments: [
            {
                color: "#36a64f",
                fields: [
                    { title: "👤 Author", value: lead.authorName, short: true },
                    { title: "📌 Content", value: lead.content || "No content", short: false },
                    { title: "🔗 Post URL", value: `<${lead.url}|View Post>`, short: false },
                    { title: "👍 Likes", value: lead.likes.toString(), short: true },
                    { title: "📅 Posted At", value: lead.postedAt, short: true }
                ]
            }
        ]
    };

    try {
        const slackResponse = await axios.post(process.env.SLACK_WEBHOOK_URL, slackMessage);
        console.log("✅ Sent to Slack:", slackResponse.data);
        res.json({ success: true, message: "✅ Webhook processed & sent to Slack." });
    } catch (error) {
        console.error("❌ Error forwarding to Slack:", error);
        res.status(500).json({ success: false, message: "⚠️ Failed to forward to Slack." });
    }
});

// ✅ Manual Data Pull from Devi AI (Triggered by Slack Button)
app.post('/pull-devi-ai', async (req, res) => {
    console.log("🔹 Pull request received from Slack.");

    const DEVI_AI_API_URL = process.env.DEVI_AI_API_URL;  // Fetch from environment variable
    if (!DEVI_AI_API_URL) {
        return res.status(500).json({ success: false, message: "⚠️ Devi AI API URL not configured." });
    }

    try {
        const deviResponse = await axios.get(DEVI_AI_API_URL);
        const leads = deviResponse.data.items || [];

        if (leads.length === 0) {
            return res.json({ success: true, message: "⚠️ No new leads found." });
        }

        // Send leads to Slack
        const slackMessages = leads.map(lead => ({
            text: `🚀 *Manual Pull: New Lead from Devi AI!*`,
            attachments: [
                {
                    color: "#36a64f",
                    fields: [
                        { title: "👤 Author", value: lead.authorName, short: true },
                        { title: "📌 Content", value: lead.content || "No content", short: false },
                        { title: "🔗 Post URL", value: `<${lead.url}|View Post>`, short: false },
                        { title: "👍 Likes", value: lead.likes.toString(), short: true },
                        { title: "📅 Posted At", value: lead.postedAt, short: true }
                    ]
                }
            ]
        }));

        for (const msg of slackMessages) {
            await axios.post(process.env.SLACK_WEBHOOK_URL, msg);
        }

        res.json({ success: true, message: `✅ Pulled ${leads.length} leads from Devi AI & sent to Slack.` });

    } catch (error) {
        console.error("❌ Error pulling data from Devi AI:", error);
        res.status(500).json({ success: false, message: "⚠️ Failed to fetch data from Devi AI." });
    }
});

// ✅ Slack Interactive Buttons & Shortcuts
app.post('/slack/actions', async (req, res) => {
    console.log("🔹 Slack interaction received:", req.body);

    const payload = JSON.parse(req.body.payload);
    const actionId = payload.actions[0]?.action_id || "unknown_action";

    if (actionId === "pull_devi_ai") {
        // Manually trigger data pull
        axios.post(`${process.env.BASE_URL}/pull-devi-ai`)
            .then(() => res.json({ text: "✅ Fetching latest leads from Devi AI..." }))
            .catch(() => res.json({ text: "⚠️ Error triggering data fetch." }));
    } else {
        res.json({ text: "⚠️ Unrecognized action." });
    }
});

// ✅ Home Route (For Testing)
app.get('/', (req, res) => {
    res.send("✅ Slack Webhook Proxy is Running!");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
