document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const requestCards = document.querySelectorAll('.request-card');
    const schedulerForm = document.querySelector('.scheduler-form');

    // 1. INTERACTIVE TAB TOGGLING
    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Remove active style state from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active style state to clicked tab
            button.classList.add('active');

            // Pure functional visual mock logic for tab swapping
            const tabText = button.textContent.toLowerCase();
            requestCards.forEach((card) => {
                if (tabText.includes('pending')) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none'; // Clear list items for unpopulated tabs
                }
            });
        });
    });

    // 2. SCHEDULER FORM TRACKER
    if (schedulerForm) {
        schedulerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const sessionDate = document.getElementById('session-date').value;
            const sessionTime = document.getElementById('session-time').value;

            if (!sessionDate || !sessionTime) {
                alert('Please pick both a valid date and time.');
                return;
            }

            alert(`Loop locked in successfully!\nDate: ${sessionDate}\nTime: ${sessionTime}`);
            schedulerForm.reset();
        });
    }

    // 3. ACCEPT / REJECT BUTTON ACTIONS
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-primary') && e.target.closest('.request-actions')) {
            alert('Request Accepted! You can now coordinate session details in Messages.');
            e.target.closest('.request-card').remove();
        }

        if (e.target.classList.contains('btn-outline') && e.target.closest('.request-actions')) {
            alert('Request Declined.');
            e.target.closest('.request-card').remove();
        }
    });
});