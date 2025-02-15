const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for external webhook connections
app.use(cors());
app.use(bodyParser.json());

// Load Slack Webhook URL and Devi AI API URL from environment variables
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DEVI_AI_API_URL = process.env.DEVI_AI_API_URL; // This needs to be provided when available

// Add the keyword list from Devi AI
const FILTER_KEYWORDS = [
  "study law in", "study construction management", "study hospitality management",
  "study professional policing", "study software engineering", "study accounting",
  "study project management", "study graphic design", "study law", "study marketing",
  "project management", "accounting and finance", "study in northampton", 
  "study in luton", "study in bradford", "study in scotland", "study in wales",
  "study in england", "studiez ziua", "studiez seara", "construction management",
  "digital marketing", "in cursul saptamanii", "studiez in weekend", "business management",
  "uk scholarships", "uk student accommodation", "studiez in scotia", "studiez in leeds",
  "studiez in birmingham", "studiez in leicester", "studiez in londra", "studying in coventry",
  "studying in manchester", "studying in harrow", "studying in leeds", "studying in leicester",
  "studying in birmingham", "studying in london", "study visa process", "how to apply",
  "best universities for", "looking for university", "student visa help", "still apply for",
  "uk university applications", "deadline for uk", "i need help", "still accepting applications",
  "best uk universities", "anyone applied for", "for april intake", "for march intake",
  "for october intake", "for june intake", "for may intake", "for february intake",
  "for january intake", "for september intake", "urgent application", "to apply asap",
  "need to apply", "de la facultate", "uk student finance", "international students",
  "best places for", "anyone studying", "which is better", "uk student applications",
  "best agency for", "for uk studies", "do you recommend", "which agency", "student visa",
  "uk university", "apply uk", "cand pot studia", "cand incep universitatile", 
  "cand incep facultatile", "unde sa studiez", "looking to study", "merg la universitate",
  "merg la facultate", "university for migrants", "university for immigrants",
  "best universities", "studiez", "study", "facultate", "facultate in uk", "studiez in anglia",
  "cine face", "want to study", "vreau sa studiez"
];

// Function to check if a post contains any keyword
const containsKeyword = (content) => {
  return FILTER_KEYWORDS.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
};

// ✅ Webhook to receive data from Devi AI
app.post("/proxy-webhook", async (req, res) => {
  try {
    const leads = req.body.items || [];
    console.log("Received Leads:", leads.length);

    for (const lead of leads) {
      if (containsKeyword(lead.content)) {
        await sendToSlack(lead);
      } else {
        console.log("Ignoring post - does not match keywords:", lead.content);
      }
    }

    res.status(200).send("Webhook received successfully");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

// ✅ Endpoint for Slack Interactivity (Button Clicks, etc.)
app.post("/slack/actions", async (req, res) => {
  console.log("Slack action received:", req.body);
  res.status(200).send("Action received");
});

// ✅ Manual Pull Data from Devi AI
app.get("/pull-devi-ai", async (req, res) => {
  try {
    if (!DEVI_AI_API_URL) {
      return res.status(500).send("Devi AI API URL is missing in environment variables");
    }

    const response = await axios.get(DEVI_AI_API_URL);
    const leads = response.data.items || [];
    console.log("Manually pulled leads:", leads.length);

    for (const lead of leads) {
      if (containsKeyword(lead.content)) {
        await sendToSlack(lead);
      }
    }

    res.status(200).send("Manual Devi AI pull successful");
  } catch (error) {
    console.error("Error fetching Devi AI data:", error);
    res.status(500).send("Error fetching Devi AI data");
  }
});

// ✅ Function to send formatted message to Slack
async function sendToSlack(lead) {
  if (!SLACK_WEBHOOK_URL) {
    console.error("SLACK_WEBHOOK_URL is missing in environment variables");
    return;
  }

  const slackMessage = {
    text: `🚀 *New Lead from Devi AI!*`,
    attachments: [
      {
        color: "#36a64f",
        fields: [
          { title: "🧑‍💼 Author", value: lead.authorName || "Unknown", short: true },
          { title: "📌 Content", value: lead.content || "No content provided", short: false },
          { title: "🔗 Post URL", value: `<${lead.url}|View Post>`, short: true },
          { title: "👍 Likes", value: lead.likes.toString(), short: true },
          { title: "📅 Posted At", value: lead.postedAt || "Unknown", short: true }
        ]
      }
    ]
  };

  try {
    await axios.post(SLACK_WEBHOOK_URL, slackMessage);
    console.log("Sent to Slack:", lead.content);
  } catch (error) {
    console.error("Error sending to Slack:", error);
  }
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
