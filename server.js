const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes'); // Import routes

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'your_mongodb_connection_string';

// Middleware
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(express.json()); // Built-in middleware for JSON parsing

// Routes
app.use('/api/auth', userRoutes); // Mount the auth routes

// Database Connection
mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server after a successful DB connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the authentication API');
});
