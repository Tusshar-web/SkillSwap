document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------------------------
       STATE
       Each request moves between pending / accepted / rejected.
       Accepted requests can carry their own Google Meet link.
    ------------------------------------------------------------------- */
    const state = {
        activeTab: 'pending',
        requests: [
            {
                id: 'req-1',
                initials: 'SK',
                name: 'Sarah Kapoor',
                learn: 'UI/UX Design',
                teach: 'Python',
                status: 'pending',
                meetLink: ''
            }
        ],
        confirmedSessions: []
    };

    const requestsList = document.getElementById('requests-list');
    const emptyState = document.getElementById('empty-state');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const schedulerForm = document.getElementById('scheduler-form');
    const meetLinkInput = document.getElementById('meet-link');
    const meetLinkHint = document.getElementById('meet-link-hint');
    const generateMeetBtn = document.getElementById('generate-meet-link');
    const confirmedSessionsEl = document.getElementById('confirmed-sessions');

    /* ------------------------------------------------------------------
       HELPERS
    ------------------------------------------------------------------- */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function randomSegment(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let out = '';
        for (let i = 0; i < length; i++) {
            out += chars[Math.floor(Math.random() * chars.length)];
        }
        return out;
    }

    function generateMeetLink() {
        return `https://meet.google.com/${randomSegment(3)}-${randomSegment(4)}-${randomSegment(3)}`;
    }

    function isValidMeetLink(value) {
        if (!value) return false;
        try {
            const url = new URL(value);
            return url.hostname === 'meet.google.com' && url.pathname.length > 1;
        } catch {
            return false;
        }
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback for environments without clipboard permissions
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            let copied = false;
            try {
                copied = document.execCommand('copy');
            } catch {
                copied = false;
            }
            document.body.removeChild(textarea);
            return copied;
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(`${dateStr}T00:00:00`);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const d = new Date();
        d.setHours(Number(h), Number(m));
        return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }

    /* ------------------------------------------------------------------
       TABS
    ------------------------------------------------------------------- */
    function setActiveTab(tab) {
        state.activeTab = tab;
        tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
        renderRequests();
    }

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => setActiveTab(button.dataset.tab));
    });

    function updateTabCounts() {
        ['pending', 'accepted', 'rejected'].forEach((status) => {
            const count = state.requests.filter(r => r.status === status).length;
            const el = document.getElementById(`count-${status}`);
            if (el) el.textContent = count;
        });
    }

    /* ------------------------------------------------------------------
       RENDER REQUEST CARDS
    ------------------------------------------------------------------- */
    function renderRequests() {
        updateTabCounts();

        const visible = state.requests.filter(r => r.status === state.activeTab);
        requestsList.innerHTML = '';

        if (visible.length === 0) {
            emptyState.hidden = false;
            emptyState.textContent = state.activeTab === 'pending'
                ? 'No pending requests right now.'
                : `No ${state.activeTab} requests yet.`;
            return;
        }

        emptyState.hidden = true;

        visible.forEach((req) => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.dataset.id = req.id;

            let statusTag = '';
            if (req.status === 'accepted') {
                statusTag = '<span class="request-status-tag accepted">Accepted</span>';
            } else if (req.status === 'rejected') {
                statusTag = '<span class="request-status-tag rejected">Declined</span>';
            }

            let actionsHtml = '';
            if (req.status === 'pending') {
                actionsHtml = `
                    <div class="request-actions">
                        <button class="btn btn-primary" data-action="accept">Accept</button>
                        <button class="btn btn-outline" data-action="reject">Reject</button>
                    </div>`;
            }

            let meetHtml = '';
            if (req.status === 'accepted') {
                meetHtml = req.meetLink
                    ? `
                    <div class="request-meet">
                        <span class="request-meet-label">Google Meet</span>
                        <div class="request-meet-link">
                            <a href="${escapeHtml(req.meetLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(req.meetLink)}</a>
                            <div class="meet-link-actions">
                                <button type="button" data-action="copy-meet">Copy</button>
                                <button type="button" data-action="edit-meet">Edit</button>
                            </div>
                        </div>
                    </div>`
                    : `
                    <div class="request-meet">
                        <span class="request-meet-label">Add a Google Meet link</span>
                        <div class="request-meet-row">
                            <input type="url" placeholder="https://meet.google.com/abc-defg-hij" data-role="meet-input" value="">
                            <button type="button" class="btn btn-outline" data-action="generate-card-meet">Generate</button>
                            <button type="button" class="btn btn-primary" data-action="save-meet">Save</button>
                        </div>
                    </div>`;
            }

            card.innerHTML = `
                ${statusTag}
                <div class="request-user-info">
                    <div class="request-avatar">${escapeHtml(req.initials)}</div>
                    <div>
                        <h3>${escapeHtml(req.name)}</h3>
                        <p>wants to learn <strong>${escapeHtml(req.learn)}</strong> from you in exchange for <strong>${escapeHtml(req.teach)}</strong></p>
                    </div>
                </div>
                ${actionsHtml}
                ${meetHtml}
            `;

            requestsList.appendChild(card);
        });
    }

    /* ------------------------------------------------------------------
       REQUEST CARD ACTIONS (accept / reject / meet link management)
    ------------------------------------------------------------------- */
    requestsList.addEventListener('click', (e) => {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;

        const card = e.target.closest('.request-card');
        const req = state.requests.find(r => r.id === card.dataset.id);
        if (!req) return;

        const action = actionEl.dataset.action;

        if (action === 'accept') {
            req.status = 'accepted';
            renderRequests();
        }

        if (action === 'reject') {
            req.status = 'rejected';
            renderRequests();
        }

        if (action === 'generate-card-meet') {
            const input = card.querySelector('[data-role="meet-input"]');
            if (input) input.value = generateMeetLink();
        }

        if (action === 'save-meet') {
            const input = card.querySelector('[data-role="meet-input"]');
            const value = input ? input.value.trim() : '';
            if (!isValidMeetLink(value)) {
                input.style.borderColor = 'var(--teach)';
                input.placeholder = 'Enter a valid meet.google.com link';
                return;
            }
            req.meetLink = value;
            renderRequests();
        }

        if (action === 'edit-meet') {
            req.meetLink = '';
            renderRequests();
        }

        if (action === 'copy-meet') {
            copyToClipboard(req.meetLink).then((ok) => {
                const original = actionEl.textContent;
                actionEl.textContent = ok ? 'Copied!' : 'Failed';
                setTimeout(() => { actionEl.textContent = original; }, 1500);
            });
        }
    });

    /* ------------------------------------------------------------------
       SCHEDULER FORM — date, time, Google Meet link
    ------------------------------------------------------------------- */
    if (generateMeetBtn) {
        generateMeetBtn.addEventListener('click', () => {
            meetLinkInput.value = generateMeetLink();
            meetLinkHint.textContent = 'Placeholder link generated — replace it with a real one before sending.';
            meetLinkHint.classList.remove('error');
        });
    }

    if (meetLinkInput) {
        meetLinkInput.addEventListener('input', () => {
            meetLinkHint.classList.remove('error');
            meetLinkHint.textContent = 'Paste an existing link or generate a placeholder one.';
        });
    }

    function renderConfirmedSessions() {
        confirmedSessionsEl.innerHTML = '';
        state.confirmedSessions.forEach((session, index) => {
            const card = document.createElement('div');
            card.className = 'confirmed-session-card';
            card.innerHTML = `
                <div class="session-when">${formatDate(session.date)} · ${formatTime(session.time)}</div>
                <div class="session-link-row">
                    <a href="${escapeHtml(session.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(session.link)}</a>
                    <button type="button" data-copy-index="${index}">Copy link</button>
                </div>
            `;
            confirmedSessionsEl.appendChild(card);
        });
    }

    confirmedSessionsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-copy-index]');
        if (!btn) return;
        const session = state.confirmedSessions[Number(btn.dataset.copyIndex)];
        if (!session) return;
        copyToClipboard(session.link).then((ok) => {
            const original = btn.textContent;
            btn.textContent = ok ? 'Copied!' : 'Failed';
            setTimeout(() => { btn.textContent = original; }, 1500);
        });
    });

    if (schedulerForm) {
        schedulerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const sessionDate = document.getElementById('session-date').value;
            const sessionTime = document.getElementById('session-time').value;
            const meetLink = meetLinkInput.value.trim();

            if (!sessionDate || !sessionTime) {
                alert('Please pick both a valid date and time.');
                return;
            }

            if (meetLink && !isValidMeetLink(meetLink)) {
                meetLinkHint.textContent = 'That doesn\'t look like a valid meet.google.com link.';
                meetLinkHint.classList.add('error');
                meetLinkInput.focus();
                return;
            }

            const finalLink = meetLink || generateMeetLink();

            state.confirmedSessions.unshift({
                date: sessionDate,
                time: sessionTime,
                link: finalLink
            });

            renderConfirmedSessions();
            schedulerForm.reset();
            meetLinkHint.textContent = 'Paste an existing link or generate a placeholder one.';
            meetLinkHint.classList.remove('error');
        });
    }

    /* ------------------------------------------------------------------
       INITIAL RENDER
    ------------------------------------------------------------------- */
    renderRequests();
    renderConfirmedSessions();
});