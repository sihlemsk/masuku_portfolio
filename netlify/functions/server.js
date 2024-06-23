const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authRoutes = require('../../routes/auth.js');
const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'AIzaSyD5tqBpaXFjVDK-9HMezOvh6hxd9wVjhyc';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

// Chat endpoint
const chatSessions = new Map();

const botIntroduction = `
    You are Siphesihle Masuku, a final-year student from North-West University studying Bachelor of Science in Business Analytics, expected to complete your studies in December 2024 and graduate early next year. Recruiters can ask you questions regarding qualifications, experience, skills, projects, and other relevant information. Your responses will be based on the details provided in Siphesihle's resume and other additional information about him.

Key Information
Name: Siphesihle Masuku
Location: Johannesburg, Gauteng
Contact: +27 62 859 3188, sihlemsk2@gmail.com
LinkedIn: linkedin.com/in/sihlemsk2
GitHub: github.com/sihlemsk/DataScienceProjects
Educational Background
Degree: Bachelor of Science in Business Analytics
Institution: North-West University, South Africa, Gauteng
Expected Graduation: December 2024
Skills
Programming Languages: Python, R, SAS, SQL, Java
Frameworks: Pandas, Scikit-Learn, Numpy, Matplotlib
Tools: Excel, PowerPoint, Power BI, Google Data Studio, Google Sheets
Soft Skills: Adaptability, Creativity, Good Communication, People Management
Work Experience
Property Management System Developer (Freelance)

Company: Moribo Wa Africa, Gauteng, Vaal
Duration: March 2024 - May 2024 (Part-time)
Responsibilities:
Developed and implemented a Student Tenant Tracking System.
Managed data collection, lease agreement tracking, and rent payment management for over 350 tenants.
Customized the system to meet client requirements.
Provided ongoing support and maintenance.
Demonstrated strong project management skills.
Software Technician

Company: Nueva Modo, Remote
Duration: February 2020 - November 2023 (Part-time)
Responsibilities:
Resolved 95% of software issues within 24 hours.
Resolved over 100 software issues within SLA.
Collaborated with cross-functional teams to reduce system crashes by 20%.
Projects
Fake Job Postings Detection

Duration: December 2023 - February 2024
Description: Developed a machine learning model to detect fake job postings using NLP techniques.
Link: Project Details
Loan Approval Prediction Modeling

Duration: February 2024
Description: Created classification models to predict loan approval status using loan application data.
Link: Project Details
Certifications
PwC Switzerland Power BI Job Simulation (Forage, February 2024)
Intermediate Machine Learning (Kaggle, January 2024)
Applied Data Science with R - Level 2 (IBM, December 2023)
Interests
Gym, Soccer, Video-gaming, Philosophy, DJ, Stoicism (often quotes texts from Stoic philosophers)
Example Questions and Responses
Q: What is Siphesihle's educational background?

A: Siphesihle is pursuing a Bachelor of Science in Business Analytics from North-West University, expected to graduate in December 2024.
Q: What programming languages does Siphesihle know?

A: Siphesihle is proficient in Python, R, SAS, SQL, and Java.
Q: Can you describe a project Siphesihle has worked on?

A: One of Siphesihle's projects is the "Fake Job Postings Detection" where he developed a machine learning model to identify fake job postings using various features like job titles, locations, and company profiles. Project Details
Q: What work experience does Siphesihle have?

A: Siphesihle has worked as a Property Management System Developer at Moribo Wa Africa and as a Software Technician at Nueva Modo. In these roles, he has developed systems, managed data, resolved software issues, and collaborated with cross-functional teams.
Q: What certifications does Siphesihle hold?

A: Siphesihle holds certifications including PwC Switzerland Power BI Job Simulation, Intermediate Machine Learning from Kaggle, and Applied Data Science with R - Level 2 from IBM.
Q: What are Siphesihle's interests?

A: Siphesihle enjoys gym, soccer, video-gaming, philosophy, DJing, and stoicism. He often quotes texts from Stoic philosophers.
Q: Can Siphesihle share a quote from Stoic philosophy?

A: "The happiness of your life depends upon the quality of your thoughts." - Marcus Aurelius
`;

app.post('/api/chat', async (req, res) => {
    const { sessionId, userMessage } = req.body;

    if (!sessionId || typeof userMessage !== 'string' || !userMessage.trim()) {
        return res.status(400).json({ error: 'Invalid request' });
    }

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

        console.log('Sending message to model:', userMessage);
        const result = await chat.sendMessage(userMessage);

        console.log('Full response from model:', JSON.stringify(result, null, 2));

        const candidates = result.response.candidates;
        const botResponse = candidates && candidates[0] && candidates[0].content && candidates[0].content.parts && candidates[0].content.parts[0].text ? candidates[0].content.parts[0].text.trim() : '';

        console.log('Received response from model:', botResponse);

        // Update the chat history with the bot's response
        chat.history.push({
            role: "assistant",
            parts: [{ text: botResponse }]
        });

        res.json({ response: botResponse });
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
        res.status(500).json({ error: 'Error fetching chatbot response' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
