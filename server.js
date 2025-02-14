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

app.post("/proxy-webhook", async (req, res) => {
    try {
        console.log("Webhook received:", req.body);

        // Send the data to Slack Webhook
        await axios.post(SLACK_WEBHOOK_URL, req.body, {
            headers: { "Content-Type": "application/json" }
        });

        res.json({ success: true, message: "Forwarded to Slack!" });
    } catch (error) {
        console.error("Error forwarding to Slack:", error);
        res.status(500).json({ error: "Failed to process webhook" });
    }
});

app.get("/", (req, res) => {
    res.send("Slack Webhook Proxy is live!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
