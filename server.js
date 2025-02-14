const express = require('express');
const cors = require('cors'); // Allow CORS if needed

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());  // Enable CORS
app.use(express.json());  // Enable JSON parsing

// Webhook endpoint to handle POST requests
app.post('/', (req, res) => {
    console.log('Received Webhook:', req.body);
    res.status(200).json({ message: 'Webhook received successfully' });
});

// Catch-all for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
