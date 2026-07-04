document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.querySelector('.auth-form');

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const usernameInput = document.getElementById('username'); // Only on Register page

            // Basic Validation Check
            if (emailInput && emailInput.value.trim() === '') {
                alert('Please enter your email address.');
                return;
            }

            if (passwordInput && passwordInput.value.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            if (usernameInput && usernameInput.value.trim() === '') {
                alert('Please enter your full name.');
                return;
            }

            // If checks pass, simulate a successful login/signup and redirect
            alert('Success! Welcome to the loop.');
            window.location.href = 'dashboard.html';
        });
    }
});