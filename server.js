const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const KEYWORDS_LIST = process.env.KEYWORDS_LIST ? process.env.KEYWORDS_LIST.split(",") : [];

app.post("/webhook", async (req, res) => {
    try {
        const data = req.body;

        if (!data.items || !Array.isArray(data.items)) {
            return res.status(400).json({ error: "Invalid data format" });
        }

        // Filter posts that contain at least one keyword from KEYWORDS_LIST
        const filteredPosts = data.items.filter(item => {
            return KEYWORDS_LIST.some(keyword => item.content.toLowerCase().includes(keyword.toLowerCase()));
        });

        if (filteredPosts.length === 0) {
            console.log("No relevant posts found. Skipping Slack message.");
            return res.status(200).json({ message: "No relevant posts to send." });
        }

        for (const post of filteredPosts) {
            const slackMessage = {
                text: "🚀 *New Lead from Devi AI!*",
                attachments: [
                    {
                        color: "#36a64f",
                        fields: [
                            { title: "🧑 Author", value: post.authorName, short: true },
                            { title: "📌 Content", value: post.content, short: false },
                            { title: "🔗 Post URL", value: `<${post.url}|View Post>`, short: false },
                            { title: "👍 Likes", value: post.likes.toString(), short: true },
                            { title: "📅 Posted At", value: post.postedAt, short: true }
                        ]
                    }
                ]
            };

            await axios.post(SLACK_WEBHOOK_URL, slackMessage);
        }

        res.status(200).json({ message: "Filtered posts sent to Slack." });

    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
