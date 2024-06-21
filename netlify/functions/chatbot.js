const { GoogleGenerativeAI } = require('@google/generative-ai');
const API_KEY = 'AIzaSyD5tqBpaXFjVDK-9HMezOvh6hxd9wVjhyc'; // Replace with your actual API key

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const chatSessions = new Map();

exports.handler = async (event, context) => {
  const { sessionId, userMessage } = JSON.parse(event.body);

  try {
    let chat;
    if (chatSessions.has(sessionId)) {
      chat = chatSessions.get(sessionId);
    } else {
      const initialChat = await model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 8192 },
      });
      chatSessions.set(sessionId, initialChat);
      chat = initialChat;
    }

    chat.history.push({ role: "user", parts: [{ text: userMessage }] });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = await response.text();

    chat.history.push({ role: "assistant", parts: [{ text }] });

    return {
      statusCode: 200,
      body: JSON.stringify({ response: text }),
    };
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching chatbot response' }),
    };
  }
};
