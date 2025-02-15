const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load environment variables
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DEVI_AI_API_URL = process.env.DEVI_AI_API_URL;

// 🚀 Root Endpoint (Health Check)
app.get('/', (req, res) => {
    res.send('Slack Webhook Proxy is Running!');
});

// 📩 Incoming Webhook Handler (Slack)
app.post('/slack/webhook', async (req, res) => {
    try {
        const data = req.body;
        
        // Format message for Slack
        const slackMessage = {
            text: `*New Webhook Data Received:*\n\`\`\`${JSON.stringify(data, null, 2)}\`\`\``
        };

        // Send message to Slack Webhook
        await axios.post(SLACK_WEBHOOK_URL, slackMessage);

        res.status(200).send({ success: true, message: 'Webhook processed' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send({ success: false, error: 'Internal Server Error' });
    }
});

// 🎯 Slack Interactivity & Shortcuts
app.post('/slack/actions', async (req, res) => {
    try {
        const payload = JSON.parse(req.body.payload);

        if (payload.type === 'block_actions') {
            const action = payload.actions[0];

            if (action.action_id === 'pull_devi_ai') {
                // Call Devi AI API
                const response = await axios.get(DEVI_AI_API_URL);
                const deviData = response.data;

                // Send response back to Slack
                const slackMessage = {
                    text: `*📡 Pulled Latest Data from Devi AI:*\n\`\`\`${JSON.stringify(deviData, null, 2)}\`\`\``
                };

                await axios.post(SLACK_WEBHOOK_URL, slackMessage);
            }
        }

        res.status(200).send();
    } catch (error) {
        console.error('Error processing Slack action:', error);
        res.status(500).send({ success: false, error: 'Internal Server Error' });
    }
});

// 🔄 Manual Data Pull from Devi AI (On-Demand)
app.get('/pull-devi-ai', async (req, res) => {
    try {
        const response = await axios.get(DEVI_AI_API_URL);
        const deviData = response.data;

        // Format message for Slack
        const slackMessage = {
            text: `*🔄 Pulled Latest Leads from Devi AI:*\n\`\`\`${JSON.stringify(deviData, null, 2)}\`\`\``
        };

        await axios.post(SLACK_WEBHOOK_URL, slackMessage);

        res.status(200).send({ success: true, message: 'Pulled data from Devi AI', data: deviData });
    } catch (error) {
        console.error('Error pulling data from Devi AI:', error);
        res.status(500).send({ success: false, error: 'Failed to fetch Devi AI data' });
    }
});

// 🚀 Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
