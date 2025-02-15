const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors()); // Enable CORS

// Load Slack Webhook URL from .env
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
console.log("Slack Webhook URL:", SLACK_WEBHOOK_URL); // Debugging

// Webhook Route
app.post("/proxy-webhook", async (req, res) => {
    try {
        console.log("Webhook received:", req.body);

        // Format the data properly for Slack
        const slackPayload = {
            text: `New Webhook Data:\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``
        };

        // Send to Slack
        const slackResponse = await axios.post(SLACK_WEBHOOK_URL, slackPayload, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("Slack Response:", slackResponse.data);
        res.json({ success: true, message: "Forwarded to Slack!" });
    } catch (error) {
        console.error("Error forwarding to Slack:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to process webhook" });
    }
});

// Root Route (for testing if the server is live)
app.get("/", (req, res) => {
    res.send("Slack Webhook Proxy is live!");
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
