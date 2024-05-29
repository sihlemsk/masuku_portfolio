document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('header nav ul li a');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const body = document.body;
    const loadingScreen = document.getElementById('loading-screen');

    // Hide loading screen once content is loaded
    window.addEventListener('load', () => {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    });

    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    body.classList.add(savedTheme);
    if (savedTheme === 'light-mode') {
        themeCheckbox.checked = false;
    } else {
        themeCheckbox.checked = true;
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                window.scrollTo({
                    top: targetSection.offsetTop - 70, // Adjust for fixed header height
                    behavior: 'smooth'
                });
            }
        });
    });

    themeCheckbox.addEventListener('change', () => {
        if (themeCheckbox.checked) {
            body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Form submitted!');
        });
    }

    if (document.getElementById('jobs-container')) {
        const fetchJobData = async () => {
            try {
                const response = await fetch('/api/jobs');
                const data = await response.json();
                displayJobs(data.jobs);
                displaySuggestions(data.suggestions);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const displayJobs = (jobs) => {
            const jobsContainer = document.getElementById('jobs-container');
            jobsContainer.innerHTML = jobs.map(job => `<p>${job.title} at ${job.company}</p>`).join('');
        };

        const displaySuggestions = (suggestions) => {
            const suggestionsContainer = document.getElementById('suggestions-container');
            suggestionsContainer.innerHTML = suggestions.map(suggestion => `<p>${suggestion}</p>`).join('');
        };

        fetchJobData();
    }
});
