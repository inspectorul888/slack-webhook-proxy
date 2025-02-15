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
