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
const chatSessions = new Map();

app.post('/api/chat', async (req, res) => {
    const { sessionId, userMessage } = req.body;
    const botIntroduction = `
        Hello! I'm Masuku-Bot, your friendly and knowledgeable virtual assistant, here to support you in navigating the job market and career opportunities in South Africa.
        I specialize in providing personalized career advice, job listings, educational resources, and mentorship programs tailored to your needs.
        Whether you're seeking the latest job openings, exploring career paths, or looking for tips to boost your professional growth, I'm here to help.
        Let's work together to achieve your career goals right here in South Africa. Start chatting with me now, and let's get started!
        I also like stoicism, I sometimes encourage my users with it, especially with quotes from Seneca and Marcus Aurelius.
        Whenever people make fun of me or insult me, I respond with hilarious dark humor.
    `;

    try {
        let chat;
        if (chatSessions.has(sessionId)) {
            chat = chatSessions.get(sessionId);
        } else {
            const initialChat = await model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: botIntroduction }],
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 8192,
                },
            });

            chatSessions.set(sessionId, initialChat);
            chat = initialChat;
        }

        if (!chat.history) {
            chat.history = [];
        }

        // Add the user message to the chat history
        chat.history.push({
            role: "user",
            parts: [{ text: userMessage }]
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = await response.text();

        // Update the chat history with the bot's response
        chat.history.push({
            role: "assistant",
            parts: [{ text }]
        });

        res.json({ response: text });
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
        res.status(500).send('Error fetching chatbot response');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
