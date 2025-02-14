const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for external requests

// Webhook endpoint to handle POST requests
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);

    // Respond with success message
    res.status(200).json({ message: "Webhook received successfully!" });
});

// Default route to check if the server is running
app.get('/', (req, res) => {
    res.send("Slack Webhook Proxy is running!");
});

// Define the PORT (from environment variables or default to 10000)
const PORT = process.env.PORT || 10000;

// Start the Express server
app.listen(PORT, () => {
    console.log(`🚀 Proxy Server running on port ${PORT}`);
});
