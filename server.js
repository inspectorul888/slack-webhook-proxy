const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON & URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Slack interactive components (buttons, shortcuts) -> /slack/actions
app.post('/slack/actions', async (req, res) => {
    console.log("🔹 Received Slack action:", req.body);

    // Slack sends payload as a URL-encoded string, so we need to parse it
    const payload = JSON.parse(req.body.payload);
    
    if (payload.type === "block_actions") {
        const action = payload.actions[0];

        // Example: Handle button clicks
        if (action.action_id === "refresh_data") {
            res.json({ text: "🔄 Fetching fresh data from Devi AI..." });

            // Trigger manual Devi AI fetch
            try {
                const deviResponse = await axios.get(process.env.DEVI_AI_API_URL || "https://dummy-devi-ai-api.com");
                console.log("✅ Devi AI Data Fetched:", deviResponse.data);
                
                // Send data back to Slack
                await axios.post(payload.response_url, {
                    text: "✅ Data pulled successfully!",
                    blocks: [
                        {
                            "type": "section",
                            "text": { "type": "mrkdwn", "text": `*Latest Leads:*\n\`\`\`${JSON.stringify(deviResponse.data, null, 2)}\`\`\`` }
                        }
                    ]
                });

            } catch (error) {
                console.error("❌ Error pulling Devi AI data:", error);
                await axios.post(payload.response_url, { text: "⚠️ Failed to fetch data from Devi AI." });
            }
        } else {
            res.json({ text: "🛑 Unknown action received." });
        }
    } else {
        res.json({ text: "🛑 Unsupported interaction type." });
    }
});

// Manual Pull Data from Devi AI -> /pull-devi-ai
app.get('/pull-devi-ai', async (req, res) => {
    console.log("🔹 Manual pull request received");

    try {
        const response = await axios.get(process.env.DEVI_AI_API_URL || "https://dummy-devi-ai-api.com");
        console.log("✅ Data from Devi AI:", response.data);

        res.json({
            success: true,
            message: "✅ Successfully fetched data from Devi AI",
            data: response.data
        });
    } catch (error) {
        console.error("❌ Error fetching Devi AI data:", error);
        res.status(500).json({ success: false, message: "⚠️ Error fetching Devi AI data" });
    }
});

// Root Route
app.get('/', (req, res) => {
    res.send('✅ Slack Webhook Proxy is Running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
