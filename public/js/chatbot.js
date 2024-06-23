document.addEventListener('DOMContentLoaded', function() {
    const messageList = document.getElementById('message-list');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const resetButton = document.getElementById('reset-button');
    const chatWindow = document.getElementById('chat-window');
    const loadingAnimation = document.querySelector('.loading-animation');

    const sessionId = Math.random().toString(36).substr(2, 9);

    sendButton.addEventListener('click', sendMessage);
    resetButton.addEventListener('click', resetChat);
    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const userMessage = cleanTextInput(messageInput.value.trim());
        if (!userMessage) return;

        appendMessage('user', userMessage);
        messageInput.value = '';
        showLoading();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId, userMessage }),
            });

            const data = await response.json();
            if (response.ok) {
                appendMessage('assistant', data.response);
            } else {
                appendMessage('assistant', 'Error: Unable to fetch response.');
                console.error('Error:', data);
            }
        } catch (error) {
            appendMessage('assistant', 'Error: Unable to fetch response.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    }

    function appendMessage(role, text) {
        console.log(`Appending message: Role: ${role}, Text: ${text}`);
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-line', role === 'user' ? 'my-text' : 'assistant-text');
        const bubbleElement = document.createElement('div');
        bubbleElement.classList.add('message-box', role === 'user' ? 'my-text' : 'assistant-text');
        bubbleElement.innerText = text;
        messageElement.appendChild(bubbleElement);
        messageList.appendChild(messageElement);
        scrollToBottom();
    }    

    function showLoading() {
        loadingAnimation.style.display = 'flex';
    }

    function hideLoading() {
        loadingAnimation.style.display = 'none';
    }

    function resetChat() {
        messageList.innerHTML = '';
    }

    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    const cleanTextInput = (value) => {
        return value
            .trim() // remove starting and ending spaces
            .replace(/[\n\t]/g, "") // remove newlines and tabs
            .replace(/<[^>]*>/g, "") // remove HTML tags
            .replace(/[<>&;]/g, ""); // sanitize inputs
    };
});
