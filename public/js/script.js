// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('header nav ul li a');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const body = document.body;
    const loadingScreen = document.getElementById('loading-screen');

    // Hide loading screen once content is loaded
    window.addEventListener('load', () => {
        loadingScreen.style.display = 'none';
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
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            window.scrollTo({
                top: targetSection.offsetTop - 70, // Adjust for fixed header height
                behavior: 'smooth'
            });
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

    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        alert('Form submitted!');
    });
});
