const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS to allow external requests
app.use(cors());

// Parse incoming JSON requests
app.use(bodyParser.json());

// Webhook Route
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).json({ message: 'Webhook received successfully!' });
});

// Root Route (for testing if server is running)
app.get('/', (req, res) => {
    res.send('Slack Webhook Proxy is live!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
