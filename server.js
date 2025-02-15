const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// Load Slack Webhook URL from environment variables
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

app.use(express.json());
app.use(cors());

// Function to format the message for Slack
function formatSlackMessage(data) {
    return {
        text: `📢 *New Webhook Data Received*`,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `📌 *Lead ID:* \`${data.id}\`\n📅 *Created:* <t:${Math.floor(data.created)}:F>`
                }
            },
            {
                type: "divider"
            },
            ...data.items.map(item => ({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `🆔 *Provider:* ${item.provider}  
👤 *Author:* *${item.authorName}*  
🔗 *Post URL:* <${item.url}|Click Here>  
📌 *Group:* *${item.groupName}*  
💬 *Content:* "${item.content}"  
👍 *Likes:* ${item.likes}  
📅 *Posted At:* <t:${Math.floor(new Date(item.postedAt).getTime() / 1000)}:F>`
                },
                accessory: {
                    type: "image",
                    image_url: item.authorProfilePicture || "https://via.placeholder.com/100",
                    alt_text: "Author Profile Picture"
                }
            }))
        ]
    };
}

app.post("/proxy-webhook", async (req, res) => {
    try {
        console.log("Webhook received:", req.body);

        // Format the message using Block Kit
        const slackMessage = formatSlackMessage(req.body);

        // Send the formatted message to Slack
        await axios.post(SLACK_WEBHOOK_URL, slackMessage, {
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
