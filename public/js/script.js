document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('header nav ul li a');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const body = document.body;
    const loadingScreen = document.getElementById('loading-screen');
    const contactForm = document.getElementById('contact-form');
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const toggleChatbotBtn = document.getElementById('toggle-chatbot');
    const chatContent = document.getElementById('chat-content');

    const updateTheme = (theme) => {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(theme);
        localStorage.setItem('theme', theme);
    };

    window.addEventListener('load', () => {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    });

    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    updateTheme(savedTheme);
    themeCheckbox.checked = (savedTheme === 'dark-mode');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    themeCheckbox.addEventListener('change', () => {
        updateTheme(themeCheckbox.checked ? 'dark-mode' : 'light-mode');
    });

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Form submitted!');
        });
    }

    const addMessageToChat = (sender, message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender.toLowerCase());
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    let sessionId = generateSessionId();
    const sendMessage = async () => {
        const userMessage = userInput.value.trim();
        if (userMessage) {
            addMessageToChat('You', userMessage);
            userInput.value = '';

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sessionId, userMessage })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                addMessageToChat('MasukuBot', data.response);
            } catch (error) {
                console.error('Error fetching response:', error);
                addMessageToChat('MasukuBot', 'Error: Unable to fetch response.');
            }
        }
    };

    if (chatBox && userInput && sendBtn) {
        sendBtn.addEventListener('click', sendMessage);

        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        addMessageToChat('MasukuBot', 'Welcome, I am MasukuBot. How can I assist you today?');
    }

    function generateSessionId() {
        return 'unique-session-id-' + Math.random().toString(36).substr(2, 9);
    }

    toggleChatbotBtn.addEventListener('click', () => {
        chatbotContainer.classList.toggle('minimized');
        if (chatbotContainer.classList.contains('minimized')) {
            toggleChatbotBtn.textContent = '+';
            chatContent.style.display = 'none';
        } else {
            toggleChatbotBtn.textContent = '-';
            chatContent.style.display = 'block';
        }
    });

    // Navbar Toggle for Mobile
    const menuToggle = document.createElement('div');
    menuToggle.classList.add('menu-toggle');
    menuToggle.textContent = '☰';
    document.querySelector('header nav').appendChild(menuToggle);

    menuToggle.addEventListener('click', () => {
        document.querySelector('header nav ul').classList.toggle('show');
    });
});
