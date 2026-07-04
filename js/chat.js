document.addEventListener('DOMContentLoaded', () => {
    const chatUsers = document.querySelectorAll('.chat-user-item');
    const activeUserName = document.querySelector('.window-header h4');
    const activeUserAvatar = document.querySelector('.window-header .chat-user-avatar');
    const messageForm = document.querySelector('.message-input-area');
    const messageInput = messageForm ? messageForm.querySelector('input') : null;
    const messageThread = document.querySelector('.message-thread');
    const reviewForm = document.querySelector('.review-form');

    // 1. SWAP ACTIVE CONVERSATION THREADS
    chatUsers.forEach((user) => {
        user.addEventListener('click', () => {
            chatUsers.forEach(item => item.classList.remove('active'));
            user.classList.add('active');

            // Extract selected partner metadata
            const name = user.querySelector('h4').textContent;
            const avatarInitials = user.querySelector('.chat-user-avatar').textContent;

            // Update Header Display Window natively
            if (activeUserName) activeUserName.textContent = name;
            if (activeUserAvatar) activeUserAvatar.textContent = avatarInitials;

            // Clear conversation text layout to simulate swapping threads
            if (messageThread) {
                messageThread.innerHTML = `
                    <div class="message message-received">
                        <p>Hi! This is a fresh conversation layout block starting with ${name}.</p>
                    </div>
                `;
            }
        });
    });

    // 2. LIVE REAL-TIME MESSAGE INJECTION
    if (messageForm && messageInput && messageThread) {
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const textValue = messageInput.value.trim();
            if (textValue === '') return;

            // Create sent message block element layout
            const outMessage = document.createElement('div');
            outMessage.className = 'message message-sent';
            outMessage.innerHTML = `<p>${textValue}</p>`;

            // Inject into live window thread layout view
            messageThread.appendChild(outMessage);
            messageInput.value = '';

            // Auto-Scroll container to absolute bottom layout position
            messageThread.scrollTop = messageThread.scrollHeight;
        });
    }

    // 3. REVIEW FORM ACTION TRACKER
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const rating = document.getElementById('rating-select').value;
            const feedback = document.getElementById('feedback-text').value.trim();

            alert(`Thank you for completing the exchange loop!\nFeedback Saved: ${rating} Stars.\nMessage: "${feedback}"`);
            reviewForm.reset();
        });
    }
});