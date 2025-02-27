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
  "study law in", "study construction management", "study hospitality management",
  "study professional policing", "study software engineering", "study accounting",
  "study project management", "study graphic design", "study law", "study marketing",
  "uk scholarships", "uk student accommodation", "student visa help", "still apply for",
  "uk university applications", "best universities for", "best agency for", 
  "for uk studies", "student finance uk", "student loan advice", "tuition fee loans",
  "de interviu", "baza de interviu", "doar pe baza", "vrei la facultate", "interviu",
  "pe baza de", "inscriere doar", "Interview-based admission", "Admission by interview",
  "Easy university admission", "Quick admission process", "Grid exam required",
  "English grid test", "Exam-based admission", "Fast-track admission", "Direct university entry",
  "University interview needed", "No entry exam", "Simple admission process",
  "Easy application process", "Fast enrollment process", "Interview for admission",
  "University entry exam", "Admission no test", "Easy study access", "Quick study enrollment",
  "Open university access", "alkaline water", "ionized water", "hydrogen-rich water",
  "best drinking water", "hydration benefits", "electrolyzed water", "water purification",
  "structured water", "antioxidant water", "alkaline diet", "anti-oxidation",
  "anti-inflammation", "water detox", "cellular hydration", "energy boost", "improve sleep",
  "reduce fatigue", "clear skin", "mental clarity", "joint pain relief",
  "inflammation reduction", "oxidative stress relief", "chronic dehydration",
  "improve digestion", "pH balance", "better hydration", "natural energy",
  "healthy lifestyle", "detox solution", "water filter system", "hydration solution",
  "advanced water technology", "business growth", "career change", "skill development",
  "personal growth", "professional coaching", "business mentor", "goal setting",
  "productivity boost", "time management", "career advancement", "mindset shift",
  "overcome procrastination", "career transition", "job search help", "leadership skills",
  "remote work tips", "business success", "startup advice", "entrepreneur mindset",
  "university application", "study abroad", "UK universities", "student visa help",
  "international student", "university admission", "course enrollment", "higher education",
  "degree program", "college scholarship", "campus life", "university guide",
  "online courses", "distance learning", "academic success", "study tips",
  "exam preparation", "student accommodation", "tuition fees", "best universities",
  "MBA program", "postgraduate courses", "undergraduate courses", "course deadlines",
  "pain", "chronic pain", "fatigue", "tired all the time", "joint pain", "inflammation",
  "headache", "migraine", "body aches", "swelling", "stiffness", "brain fog", "low energy",
  "insomnia", "can’t sleep", "anxiety", "depression", "stressed out", "skin issues",
  "eczema", "dry skin", "itchy skin", "digestive problems", "stomach pain", "bloating",
  "acid reflux", "heartburn", "constipation", "diarrhea", "dehydration", "always thirsty",
  "frequent urination", "muscle cramps", "weakness", "dizziness", "nausea",
  "heart palpitations", "high blood pressure", "low blood pressure", "weight gain",
  "weight loss", "obesity", "difficulty losing weight", "diabetes symptoms",
  "blood sugar problems", "high cholesterol", "asthma attack", "breathing problems",
  "shortness of breath", "coughing", "allergies", "sinus infection", "frequent colds",
  "immune system problems", "autoimmune disease", "arthritis flare-up", "joint swelling",
  "gout attack", "psoriasis outbreak", "eye problems", "blurry vision", "memory problems",
  "forgetfulness", "lack of focus", "restless legs", "tingling sensation", "numbness",
  "back pain", "neck pain", "shoulder pain", "poor circulation", "cold hands",
  "cold feet", "stress eating", "poor appetite", "loss of appetite", "slow recovery",
  "poor healing", "frequent infections", "weakness after exercise", "muscle soreness",
  "exhaustion", "post-workout fatigue"
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
