document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.querySelector('.auth-form');

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const usernameInput = document.getElementById('username'); // Only on Register page
            const submitButton = authForm.querySelector('button[type="submit"]');

            const flagError = (input) => {
                if (!input) return;
                input.classList.remove('input-error');
                // restart the shake animation even if already flagged once
                void input.offsetWidth;
                input.classList.add('input-error');
                input.focus();
            };

            // Basic validation check
            if (emailInput && emailInput.value.trim() === '') {
                flagError(emailInput);
                alert('Please enter your email address.');
                return;
            }

            if (passwordInput && passwordInput.value.length < 6) {
                flagError(passwordInput);
                alert('Password must be at least 6 characters long.');
                return;
            }

            if (usernameInput && usernameInput.value.trim() === '') {
                flagError(usernameInput);
                alert('Please enter your full name.');
                return;
            }

            // If checks pass, show a brief loading state, then simulate
            // a successful login/signup and redirect
            if (submitButton) {
                submitButton.classList.add('is-loading');
            }

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 600);
        });

        // clear the error state as soon as the person starts fixing it
        authForm.querySelectorAll('input').forEach((input) => {
            input.addEventListener('input', () => input.classList.remove('input-error'));
        });
    }

    /* ---------- password strength meter (register page only) ---------- */
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar span');
    const strengthLabel = document.querySelector('.strength-label');

    if (passwordInput && strengthBar && strengthLabel) {
        const evaluate = (value) => {
            let score = 0;
            if (value.length >= 8) score += 1;
            if (value.length >= 12) score += 1;
            if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
            if (/[0-9]/.test(value)) score += 1;
            if (/[^A-Za-z0-9]/.test(value)) score += 1;

            const levels = [
                { width: '0%', color: 'rgba(0,0,0,0.08)', label: '\u00A0' },
                { width: '20%', color: '#e5484d', label: 'Weak' },
                { width: '45%', color: '#e5484d', label: 'Weak' },
                { width: '65%', color: '#ff9f1c', label: 'Fair' },
                { width: '85%', color: '#00a896', label: 'Good' },
                { width: '100%', color: '#00a896', label: 'Strong' }
            ];

            const level = value.length === 0 ? levels[0] : levels[Math.min(score, levels.length - 1)];
            strengthBar.style.width = level.width;
            strengthBar.style.backgroundColor = level.color;
            strengthLabel.textContent = level.label;
        };

        passwordInput.addEventListener('input', (e) => evaluate(e.target.value));
        evaluate(passwordInput.value);
    }
});