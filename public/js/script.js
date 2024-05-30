document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('header nav ul li a');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const body = document.body;
    const loadingScreen = document.getElementById('loading-screen');
    const contactForm = document.getElementById('contact-form');
    const jobsContainer = document.getElementById('jobs-container');
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

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

    if (jobsContainer) {
        const fetchJobData = async () => {
            try {
                const response = await fetch('/api/jobs');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                displayJobs(data);
                displaySuggestions(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const displayJobs = (jobs) => {
            jobsContainer.innerHTML = jobs.map(job => `<p>${job.title} at ${job.company}</p>`).join('');
        };

        const displaySuggestions = (suggestions) => {
            const suggestionsContainer = document.getElementById('suggestions-container');
            suggestionsContainer.innerHTML = suggestions.map(suggestion => `<p>${suggestion}</p>`).join('');
        };

        fetchJobData();
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
                addMessageToChat('Masuku-BOT', data.response);
            } catch (error) {
                console.error('Error fetching response:', error);
                addMessageToChat('Masuku-BOT', 'Error: Unable to fetch response.');
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
    
        addMessageToChat('Masuku-BOT', 'Welcome, I am Masuku-BOT.');
    }
    
    // Function to generate or retrieve a session ID
    function generateSessionId() {
        // This could be a UUID or any unique identifier logic
        return 'unique-session-id-' + Math.random().toString(36).substr(2, 9);
    }
    
});
