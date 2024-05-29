const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb://localhost:27017/job_dashboard'; // Update with your MongoDB connection string

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

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

app.get('/api/jobs', async (req, res) => {
    const apiKey = 'AIzaSyD5tqBpaXFjVDK-9HMezOvh6hxd9wVjhyc'; // Replace with your actual API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: "Explain how AI works in detail"
                    }
                ]
            }
        ]
    };

    try {
        // Dynamic import of node-fetch
        const fetch = await import('node-fetch').then(mod => mod.default);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
