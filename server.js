const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Define keywords that should trigger sending to Slack
const KEYWORDS = ["study", "UK", "funded", "university", "scholarship"]; // Add relevant words

app.use(express.json());
app.use(cors());

app.post("/proxy-webhook", async (req, res) => {
    try {
        console.log("Webhook received:", req.body);
        let filteredItems = req.body.items.filter(item => 
            KEYWORDS.some(keyword => item.content.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (filteredItems.length > 0) {
            await axios.post(SLACK_WEBHOOK_URL, { 
                text: `Filtered Leads: ${JSON.stringify(filteredItems, null, 2)}` 
            });
        }

        res.json({ success: true, message: "Processed webhook data" });
    } catch (error) {
        console.error("Error forwarding to Slack:", error);
        res.status(500).json({ error: "Failed to process webhook" });
    }
});

app.get("/", (req, res) => {
    res.send("Slack Webhook Proxy is live!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
