document.addEventListener('DOMContentLoaded', () => {

    const conversations = {
        sarah: {
            name: 'Sarah Kapoor',
            avatar: 'SK',
            online: true,
            messages: [
                { sender: 'received', text: "Hey there! I saw you accepted my request to trade Python basics for UI design." },
                { sender: 'sent', text: 'Yes, absolutely! I am super excited to get started on Python.' },
                { sender: 'received', text: "Awesome! Let's schedule our python loop!" }
            ],
            replies: [
                'Sounds great, does Thursday evening work for you?',
                "Perfect — I'll send over a calendar invite.",
                "Let's do a quick 30-minute intro session first.",
                'Looking forward to it! 🎉'
            ]
        },
        alex: {
            name: 'Alex Miller',
            avatar: 'AM',
            online: false,
            messages: [
                { sender: 'received', text: 'Thanks for the session today!' }
            ],
            replies: [
                'No problem, happy to help anytime!',
                'That data science example really clicked for me.',
                "Let's plan the next one soon."
            ]
        }
    };

    let currentKey = 'sarah';

    const thread = document.querySelector('.message-thread');
    const chatItems = document.querySelectorAll('.chat-user-item');
    const headerAvatar = document.querySelector('.window-header .chat-user-avatar');
    const headerName = document.querySelector('.header-user-info h4');
    const headerStatus = document.querySelector('.user-status');
    const messageForm = document.querySelector('.message-input-area');
    const messageInput = messageForm.querySelector('input');
    const sendButton = messageForm.querySelector('button');

    const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const scrollToBottom = () => {
        thread.scrollTop = thread.scrollHeight;
    };

    const appendMessage = (sender, text, animate = true) => {
        const bubble = document.createElement('div');
        bubble.className = `message message-${sender}`;
        bubble.innerHTML = `<p>${text}</p><span class="message-time">${formatTime()}</span>`;
        if (!animate) bubble.style.animation = 'none';
        thread.appendChild(bubble);
        scrollToBottom();
        return bubble;
    };

    const renderThread = (key) => {
        const convo = conversations[key];
        thread.innerHTML = '';
        convo.messages.forEach((m) => appendMessage(m.sender, m.text));

        headerAvatar.textContent = convo.avatar;
        headerName.textContent = convo.name;
        headerStatus.textContent = convo.online ? 'Online' : 'Offline';
        headerStatus.classList.toggle('is-offline', !convo.online);
    };

    const updateSidebarPreview = (key) => {
        const convo = conversations[key];
        const item = document.querySelector(`.chat-user-item[data-user="${key}"]`);
        if (!item) return;
        const last = convo.messages[convo.messages.length - 1];
        item.querySelector('.chat-user-meta p').textContent = last.text;
    };

    const markUnread = (key) => {
        if (key === currentKey) return;
        const item = document.querySelector(`.chat-user-item[data-user="${key}"]`);
        if (!item || item.querySelector('.unread-dot')) return;
        const dot = document.createElement('span');
        dot.className = 'unread-dot';
        item.appendChild(dot);
    };

    const clearUnread = (key) => {
        const item = document.querySelector(`.chat-user-item[data-user="${key}"]`);
        const dot = item?.querySelector('.unread-dot');
        if (dot) dot.remove();
    };

    /* ---------- switching conversations ---------- */
    chatItems.forEach((item) => {
        item.addEventListener('click', () => {
            const key = item.dataset.user;
            if (!key || key === currentKey) return;

            chatItems.forEach((i) => i.classList.remove('active'));
            item.classList.add('active');
            currentKey = key;
            clearUnread(key);
            renderThread(key);
        });
    });

    /* ---------- sending a message ---------- */
    const toggleSendButton = () => {
        sendButton.disabled = messageInput.value.trim() === '';
    };
    messageInput.addEventListener('input', toggleSendButton);
    toggleSendButton();

    let replyPointer = { sarah: 0, alex: 0 };

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text) return;

        const convo = conversations[currentKey];
        convo.messages.push({ sender: 'sent', text });
        appendMessage('sent', text);
        updateSidebarPreview(currentKey);

        messageInput.value = '';
        toggleSendButton();

        const activeKeyAtSend = currentKey;

        // simulate the partner seeing it and typing back
        setTimeout(() => {
            if (currentKey !== activeKeyAtSend) return; // user switched away
            const typing = document.createElement('div');
            typing.className = 'typing-indicator';
            typing.innerHTML = '<span></span><span></span><span></span>';
            thread.appendChild(typing);
            scrollToBottom();

            setTimeout(() => {
                typing.remove();
                const replies = convo.replies;
                const reply = replies[replyPointer[activeKeyAtSend] % replies.length];
                replyPointer[activeKeyAtSend] += 1;

                convo.messages.push({ sender: 'received', text: reply });
                if (currentKey === activeKeyAtSend) {
                    appendMessage('received', reply);
                } else {
                    markUnread(activeKeyAtSend);
                }
                updateSidebarPreview(activeKeyAtSend);
            }, 1300);
        }, 600);
    });

    /* ---------- occasional message from the OTHER conversation ---------- */
    setInterval(() => {
        const otherKey = currentKey === 'sarah' ? 'alex' : 'sarah';
        const convo = conversations[otherKey];
        const replies = convo.replies;
        const msg = replies[replyPointer[otherKey] % replies.length];
        replyPointer[otherKey] += 1;

        convo.messages.push({ sender: 'received', text: msg });
        updateSidebarPreview(otherKey);
        markUnread(otherKey);
    }, 20000);

    /* ---------- review form ---------- */
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const button = reviewForm.querySelector('button[type="submit"]');
            const original = button.textContent;

            button.classList.add('is-saved');
            button.textContent = 'Feedback Submitted ✓';

            setTimeout(() => {
                button.classList.remove('is-saved');
                button.textContent = original;
                reviewForm.reset();
            }, 1800);
        });
    }

    scrollToBottom();
});