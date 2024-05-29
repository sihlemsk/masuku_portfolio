const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Import node-fetch for API requests
const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = 'AIzaSyD5tqBpaXFjVDK-9HMezOvh6hxd9wVjhyc';

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/job_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'job_dashboard.html'));
});

app.get('/api/jobs', async (req, res) => {
    try {
        const response = await fetch('https://gemini.api.url/endpoint', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
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
