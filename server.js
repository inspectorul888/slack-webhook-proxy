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

// Add the extended keyword list from Devi AI
const FILTER_KEYWORDS = [
  "chronic dehydration", "best drinking water", "always thirsty dehydrated",
  "headaches dehydration cure", "acid reflux solution", "alkaline diet water",
  "water for inflammation", "cure for fatigue", "skin hydration best",
  "joint pain relief", "detox water solution", "anti-inflammatory water",
  "oxidative stress relief", "hydration energy boost", "water mental clarity",
  "digestion water best", "cellular hydration", "healthy water benefits",
  "structured healing water", "high blood pressure cure", "health water filter",
  "gut health improvement", "hydration weight loss", "longevity water best",
  "always thirsty dehydration", "dehydration symptoms cure", "best water for hydration",
  "dry mouth solutions", "chronic dehydration help", "water for energy boost",
  "acid reflux solution", "cure for acid reflux", "best water for digestion",
  "bloating and gut health", "indigestion natural remedy", "stomach pain cure",
  "constipation hydration fix", "IBS natural solution", "detox body naturally",
  "best detox water", "anti-inflammatory water", "inflammation natural cure",
  "joint pain water cure", "swollen joints help", "arthritis natural treatment",
  "always tired solution", "chronic fatigue help", "low energy problem",
  "brain fog cure", "best water for energy", "poor concentration fix",
  "sleep better naturally", "eczema water cure", "dry skin hydration",
  "clear skin naturally", "acne detox solution", "best water for skin",
  "psoriasis treatment natural", "migraine natural relief", "headache dehydration fix",
  "chronic migraines help", "water for headaches", "best alkaline water",
  "pH balance solution", "acidic body symptoms", "alkaline diet water",
  "arthritis inflammation cure", "knee pain natural remedy", "joint pain water solution",
  "stiffness morning fix", "high blood pressure water", "diabetes natural help",
  "blood sugar balance water", "kidney stones water cure", "gout inflammation help",
  "cholesterol lowering water", "detox kidney naturally", "liver cleanse water",
  "career change plan", "career pivot strategy", "need new skills",
  "career growth plan", "change career 30", "career change 40",
  "find career path", "monetize my skills", "job switch roadmap",
  "need business skills", "job search help", "be self-employed",
  "professional reinvention", "find true calling", "job dissatisfaction fix",
  "career change university", "degree better job", "teaching qualification need",
  "business degree start", "highest paying degree", "self-employment degree",
  "fast degree program", "mature student university", "study work abroad",
  "degree immigration need", "affordable degree program", "career switch degree",
  "career upgrade university", "online degree adults", "student finance help",
  "university course funding", "entrepreneur best degree", "business degree no experience",
  "manager qualification study", "back to school", "career switch master’s",
  "job promotion degree", "find job course", "job upgrade degree"
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
