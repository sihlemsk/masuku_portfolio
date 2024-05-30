const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authRoutes = require('./routes/auth');
const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/job_dashboard';
const API_KEY = process.env.API_KEY || 'AIzaSyD5tqBpaXFjVDK-9HMezOvh6hxd9wVjhyc';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/job_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'job_dashboard.html'));
});

app.get('/chatbot.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    const { userMessage } = req.body;
    try {
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: userMessage }],
                }
            ],
            generationConfig: {
                maxOutputTokens: 8192,
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();
        res.json({ response: text });
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
        res.status(500).send('Error fetching chatbot response');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
