// LearnLoop Dashboard Logic
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  forceAuth();

  const user = db.getCurrentUser();
  if (!user) return;

  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    sidebarContainer.innerHTML = getSidebarHTML("dashboard");
    setupTheme();
  }

  const greeting = document.getElementById("user-greeting");
  if (greeting) {
    greeting.textContent = `Hello, ${user.name}!`;
  }

  document.getElementById("stat-offered").textContent = user.skillsOffered.length;
  document.getElementById("stat-wanted").textContent = user.skillsWanted.length;
  
  const requests = db.getData("ll_requests");
  const activeRequests = requests.filter(r => r.senderId === user.id || r.receiverId === user.id).length;
  document.getElementById("stat-requests").textContent = activeRequests;

  const sessions = db.getData("ll_sessions");
  const completedSessions = sessions.filter(s => s.status === "Completed" && (s.partnerId === user.id || s.requestId)).length;
  document.getElementById("stat-sessions").textContent = completedSessions + user.exchangesCompleted;

  document.getElementById("stat-rating").textContent = user.rating.toFixed(1);

  drawActivityChart();
  renderUpcomingSessions();
  renderChatsList();
  renderBadges();
  renderSystemNotifications();
});

function drawActivityChart() {
  const container = document.getElementById("activity-chart");
  if (!container) return;

  const width = 500;
  const height = 200;
  const padding = 30;

  const months = ["Feb", "Mar", "Apr", "May", "Jun"];
  const teachHours = [5, 9, 12, 8, 15];
  const learnHours = [7, 11, 8, 16, 20];

  const maxVal = 24;

  const getX = (index) => padding + (index * (width - 2 * padding) / (months.length - 1));
  const getY = (val) => height - padding - (val * (height - 2 * padding) / maxVal);

  const getCurvePath = (data) => {
    let path = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(data[i]);
      const x2 = getX(i + 1);
      const y2 = getY(data[i + 1]);
      const cpX1 = x1 + (x2 - x1) / 2;
      const cpY1 = y1;
      const cpX2 = x1 + (x2 - x1) / 2;
      const cpY2 = y2;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
    }
    return path;
  };

  const teachPath = getCurvePath(teachHours);
  const learnPath = getCurvePath(learnHours);

  const teachArea = `${teachPath} L ${getX(teachHours.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;
  const learnArea = `${learnPath} L ${getX(learnHours.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const yVal = padding + (i * (height - 2 * padding) / 4);
    const labelVal = Math.round(maxVal - (i * maxVal / 4));
    gridLines += `
      <line x1="${padding}" y1="${yVal}" x2="${width - padding}" y2="${yVal}" stroke="var(--border-color)" stroke-width="1" />
      <text x="${padding - 10}" y="${yVal + 4}" fill="var(--text-muted)" font-size="10" font-weight="600" text-anchor="end">${labelVal}h</text>
    `;
  }

  let monthLabels = "";
  months.forEach((m, idx) => {
    monthLabels += `
      <text x="${getX(idx)}" y="${height - 10}" fill="var(--text-muted)" font-size="11" font-weight="600" text-anchor="middle">${m}</text>
      <circle cx="${getX(idx)}" cy="${getY(teachHours[idx])}" r="4" fill="var(--purple)" stroke="#FFF" stroke-width="1.5" />
      <circle cx="${getX(idx)}" cy="${getY(learnHours[idx])}" r="4" fill="var(--cyan)" stroke="#FFF" stroke-width="1.5" />
    `;
  });

  const svgContent = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <defs>
        <linearGradient id="teach-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--purple)" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="var(--purple)" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="learn-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--cyan)" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="var(--cyan)" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      
      ${gridLines}
      <path d="${teachArea}" fill="url(#teach-grad)" />
      <path d="${learnArea}" fill="url(#learn-grad)" />
      <path d="${teachPath}" fill="none" stroke="var(--purple)" stroke-width="3" stroke-linecap="round" />
      <path d="${learnPath}" fill="none" stroke="var(--cyan)" stroke-width="3" stroke-linecap="round" />
      ${monthLabels}
    </svg>
  `;

  container.innerHTML = svgContent;
}

function renderUpcomingSessions() {
  const container = document.getElementById("dashboard-sessions-list");
  if (!container) return;

  const sessions = db.getData("ll_sessions");
  const upcoming = sessions.filter(s => s.status === "Upcoming");

  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <p>No upcoming sessions booked.</p>
        <a href="requests.html" class="btn btn-secondary" style="margin-top: 10px;">Book a Session</a>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  upcoming.forEach(s => {
    const monthsNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const dParts = s.date.split("-");
    const mStr = monthsNames[parseInt(dParts[1]) - 1] || "OCT";
    const dayVal = dParts[2] || "01";

    container.innerHTML += `
      <div class="session-item">
        <div class="session-date-badge">
          <span>${mStr}</span>
          <span>${dayVal}</span>
        </div>
        <div class="session-details">
          <h4>${s.topic}</h4>
          <p>Partner: <strong>${s.partnerName}</strong> &bull; Time: <strong>${s.time} (${s.timezone})</strong></p>
        </div>
        <div class="session-actions">
          <a href="chat.html?partner=${s.partnerId}" class="btn btn-secondary btn-icon" title="Chat with Partner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </a>
          <a href="requests.html" class="btn btn-primary btn-sm">Manage</a>
        </div>
      </div>
    `;
  });
}

function renderChatsList() {
  const container = document.getElementById("dashboard-chats-list");
  if (!container) return;

  const chats = db.getData("ll_chats");
  const usersList = db.getData("ll_users");

  if (chats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No active conversations. Match with users to start chatting!</p>
        <a href="explore.html" class="btn btn-secondary btn-sm" style="margin-top: 10px;">Find Partners</a>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  chats.forEach(c => {
    const partner = usersList.find(u => u.id === c.partnerId);
    if (!partner) return;

    const lastMsg = c.messages[c.messages.length - 1];
    const snippet = lastMsg ? lastMsg.text : "No messages exchange yet.";
    const time = lastMsg ? lastMsg.time : "";

    container.innerHTML += `
      <a href="chat.html?partner=${partner.id}" class="msg-item">
        <div class="msg-avatar">
          ${getAvatarHTML(partner)}
          <div class="status-dot"></div>
        </div>
        <div class="msg-info">
          <div class="msg-header">
            <span class="msg-name">${partner.name}</span>
            <span class="msg-time">${time}</span>
          </div>
          <div class="msg-snippet">${snippet}</div>
        </div>
      </a>
    `;
  });
}

function renderBadges() {
  const container = document.getElementById("dashboard-badges-shelf");
  if (!container) return;

  const user = db.getCurrentUser();
  const unlocked = user.badges || [];

  container.innerHTML = "";
  // BADGES_LIST is globally visible from theme.js
  BADGES_LIST.forEach(badge => {
    const isUnlocked = unlocked.includes(badge.name);
    
    let bgStyle = "";
    if (isUnlocked) {
      if (badge.name === "Top Teacher") bgStyle = "background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);";
      else if (badge.name === "Active Learner") bgStyle = "background: rgba(6, 182, 212, 0.15); color: var(--cyan); border: 1px solid rgba(6, 182, 212, 0.3);";
      else if (badge.name === "Community Helper") bgStyle = "background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);";
      else if (badge.name === "Skill Master") bgStyle = "background: rgba(124, 58, 237, 0.15); color: var(--purple); border: 1px solid rgba(124, 58, 237, 0.3);";
      else bgStyle = "background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.3);";
    }

    container.innerHTML += `
      <div class="badge-icon-mini ${isUnlocked ? '' : 'locked'}" data-tooltip="${badge.name}: ${badge.desc}" style="${bgStyle}">
        <span>${badge.icon}</span>
      </div>
    `;
  });
}

function renderSystemNotifications() {
  const container = document.getElementById("dashboard-notifications-list");
  if (!container) return;

  const notifications = db.getData("ll_notifications");
  if (notifications.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>No system notifications logs.</p></div>`;
    return;
  }

  container.innerHTML = "";
  notifications.slice(0, 4).forEach(n => {
    container.innerHTML += `
      <div class="db-notif-item notif-${n.type}">
        <div class="db-notif-text">${n.text}</div>
        <div class="db-notif-time">${n.time}</div>
      </div>
    `;
  });
}
