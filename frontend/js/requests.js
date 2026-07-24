// Learnova Requests and Scheduling Calendar Logic
const token = sessionStorage.getItem("token") || localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

let currentYear = 2026;
let currentMonth = 6;
let selectedDateStr = "";

document.addEventListener("DOMContentLoaded", () => {
  forceAuth();

  const user = db.getCurrentUser();
  if (!user) return;

  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    sidebarContainer.innerHTML = getSidebarHTML("requests");
    setupTheme();
  }

  // Clear requests-related notifications automatically when visiting this page
  if (typeof clearPageNotifications === "function") {
    setTimeout(() => clearPageNotifications("requests"), 200);
  }

  const today = new Date();
  currentYear = 2026;
  currentMonth = today.getMonth();
  selectedDateStr = formatDateKey(today);

  renderRequests();
  drawCalendar();
  renderAgenda(selectedDateStr);
  setupTabs();
  setupCalendarNav();
  setupBookingModalEvents();
  setupReviewModalEvents();

  // Pending review trigger from call.html redirect
  const pendingReviewId = localStorage.getItem("ll_review_pending_session_id");
  if (pendingReviewId) {
    localStorage.removeItem("ll_review_pending_session_id");
    openReviewModal(pendingReviewId);
    showToast("Welcome back! Please write a review for your completed session.", "info");
  }

  db.syncExchangeRequests();
  db.syncSessions();

  window.addEventListener("ll_users_updated", () => {
    renderRequests();
    drawCalendar();
    renderAgenda(selectedDateStr);
  });
  window.addEventListener("ll_requests_updated", () => {
    renderRequests();
    drawCalendar();
    renderAgenda(selectedDateStr);
  });
  window.addEventListener("ll_sessions_updated", () => {
    drawCalendar();
    renderAgenda(selectedDateStr);
  });
});

function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const target = tab.getAttribute("data-tab");
      document.getElementById("incoming-tab").classList.remove("active");
      document.getElementById("outgoing-tab").classList.remove("active");
      document.getElementById("history-tab").classList.remove("active");
      
      if (target === "incoming") {
        document.getElementById("incoming-tab").classList.add("active");
      } else if (target === "outgoing") {
        document.getElementById("outgoing-tab").classList.add("active");
      } else {
        document.getElementById("history-tab").classList.add("active");
      }
    });
  });
}

function renderRequests() {
  const currentUser = db.getCurrentUser();
  const requests = db.getData("ll_requests");
  const allUsers = db.getData("ll_users");

  const incomingDiv = document.getElementById("incoming-tab");
  const outgoingDiv = document.getElementById("outgoing-tab");
  const historyDiv = document.getElementById("history-tab");

  const incoming = requests.filter(r => r.receiverId === currentUser.id && r.status === "Pending");
  const outgoing = requests.filter(r => r.senderId === currentUser.id);
  const history = requests.filter(r => 
    r.status !== "Pending" && (r.senderId === currentUser.id || r.receiverId === currentUser.id)
  );

  if (incomingDiv) {
    if (incoming.length === 0) {
      incomingDiv.innerHTML = `
        <div class="empty-state">
          <svg width="32" height="32" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          <p>No incoming exchange proposals.</p>
        </div>
      `;
    } else {
      incomingDiv.innerHTML = "";
      incoming.forEach(r => {
        const sender = allUsers.find(u => u.id === r.senderId);
        if (!sender) return;

        incomingDiv.innerHTML += `
          <div class="req-item-card glass">
            <div class="req-card-top">
              <div class="req-avatar">${getAvatarHTML(sender)}</div>
              <div class="req-user-info">
                <h5>${sender.name}</h5>
                <p>Location: ${sender.location} &bull; Rating: ★${sender.rating.toFixed(1)}</p>
              </div>
              <span class="req-status-badge status-pending">Pending</span>
            </div>
            
            <div class="req-barter-visual">
              <strong>Offered:</strong> ${r.skillOffered} &nbsp;&harr;&nbsp; <strong>Wanted:</strong> ${r.skillWanted}
            </div>

            <p class="req-proposal-text">"${r.proposalMessage}"</p>

            <div class="req-actions-row">
              <button class="btn btn-secondary reject-request-btn" data-id="${r.id}">Decline</button>
              <button class="btn btn-primary btn-glow accept-request-btn" data-id="${r.id}">Accept Proposal</button>
            </div>
          </div>
        `;
      });
      
      document.querySelectorAll(".accept-request-btn").forEach(btn => {
        btn.addEventListener("click", () => acceptRequest(btn.getAttribute("data-id")));
      });
      document.querySelectorAll(".reject-request-btn").forEach(btn => {
        btn.addEventListener("click", () => rejectRequest(btn.getAttribute("data-id")));
      });
    }
  }

  if (outgoingDiv) {
    if (outgoing.length === 0) {
      outgoingDiv.innerHTML = `
        <div class="empty-state">
          <p>You haven't sent any skill exchange proposals yet.</p>
          <a href="explore.html" class="btn btn-secondary btn-sm" style="margin-top: 10px;">Find Partners</a>
        </div>
      `;
    } else {
      outgoingDiv.innerHTML = "";
      outgoing.forEach(r => {
        const receiver = allUsers.find(u => u.id === r.receiverId);
        if (!receiver) return;

        const statClass = "status-" + r.status.toLowerCase();
        
        outgoingDiv.innerHTML += `
          <div class="req-item-card glass">
            <div class="req-card-top">
              <div class="req-avatar">${getAvatarHTML(receiver)}</div>
              <div class="req-user-info">
                <h5>Proposal to: ${receiver.name}</h5>
                <p>Location: ${receiver.location}</p>
              </div>
              <span class="req-status-badge ${statClass}">${r.status}</span>
            </div>
            
            <div class="req-barter-visual">
              <strong>Teaching:</strong> ${r.skillOffered} &nbsp;&harr;&nbsp; <strong>Learning:</strong> ${r.skillWanted}
            </div>

            <p class="req-proposal-text">"${r.proposalMessage || "No message."}"</p>

            ${r.status === "Pending" ? `
              <div class="req-actions-row">
                <button class="btn btn-secondary btn-sm cancel-request-btn" data-id="${r.id}">Cancel Proposal</button>
              </div>
            ` : ''}
          </div>
        `;
      });

      document.querySelectorAll(".cancel-request-btn").forEach(btn => {
        btn.addEventListener("click", () => cancelRequest(btn.getAttribute("data-id")));
      });
    }
  }

  if (historyDiv) {
    if (history.length === 0) {
      historyDiv.innerHTML = `
        <div class="empty-state">
          <p>No historical exchange activities logged.</p>
        </div>
      `;
    } else {
      historyDiv.innerHTML = "";
      history.forEach(r => {
        const partnerId = r.senderId === currentUser.id ? r.receiverId : r.senderId;
        const partner = allUsers.find(u => u.id === partnerId);
        if (!partner) return;

        const statClass = "status-" + r.status.toLowerCase();
        const roleStr = r.senderId === currentUser.id ? "Outgoing" : "Incoming";

        let actionBtn = "";
        if (r.status.toLowerCase() === "completed") {
          actionBtn = `<div class="req-actions-row" style="margin-top: 10px;">
              <button class="btn btn-primary btn-sm review-exchange-btn" data-id="${r.id}" data-backend-id="${r.backendId || ''}">Leave Review</button>
            </div>`;
        } else if (r.status.toLowerCase() === "accepted") {
          actionBtn = `<div class="req-actions-row" style="margin-top: 10px;">
              <button class="btn btn-secondary btn-sm mark-completed-btn" data-id="${r.id}" data-backend-id="${r.backendId || ''}">Mark Completed</button>
            </div>`;
        }

        historyDiv.innerHTML += `
          <div class="req-item-card glass" style="opacity: 0.85;">
            <div class="req-card-top">
              <div class="req-avatar">${getAvatarHTML(partner)}</div>
              <div class="req-user-info">
                <h5>${partner.name}</h5>
                <p>Barter Scope: ${roleStr}</p>
              </div>
              <span class="req-status-badge ${statClass}">${r.status}</span>
            </div>
            <div class="req-barter-visual" style="margin-bottom:0;">
              <strong>Offered:</strong> ${r.skillOffered} &nbsp;&harr;&nbsp; <strong>Wanted:</strong> ${r.skillWanted}
            </div>
            ${actionBtn}
          </div>
        `;
      });

      document.querySelectorAll(".review-exchange-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          openExchangeReviewModal(btn.getAttribute("data-id"), btn.getAttribute("data-backend-id"));
        });
      });
      document.querySelectorAll(".mark-completed-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          markExchangeCompleted(btn.getAttribute("data-id"));
        });
      });
    }
  }
}

async function markExchangeCompleted(reqId) {
  const requests = db.getData("ll_requests");
  const req = requests.find(r => r.id === reqId);
  if (!req) return;

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const backendId = req.backendId || (req.id && req.id.startsWith("er-") ? req.id.replace("er-", "") : null);

  if (token && backendId) {
    try {
      const res = await fetch(`${window.CONFIG.API_URL}/exchange-requests/${backendId}/complete`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to mark as completed.", "error");
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }

  req.status = "Completed";
  db.saveData("ll_requests", requests);
  showToast("Exchange marked as completed.", "success");
  if (token && backendId) {
    await db.syncExchangeRequests();
  } else {
    renderRequests();
  }
}

async function acceptRequest(reqId) {
  const requests = db.getData("ll_requests");
  const req = requests.find(r => r.id === reqId);
  if (!req) return;

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const backendId = req.backendId || (req.id && req.id.startsWith("er-") ? req.id.replace("er-", "") : null);

  if (token && backendId) {
    try {
      const res = await fetch(`${window.CONFIG.API_URL}/exchange-requests/${backendId}/accept`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to accept request on backend.", "error");
        return;
      }
    } catch (err) {
      console.error("Error accepting request on backend:", err);
    }
  }

  req.status = "Accepted";
  db.saveData("ll_requests", requests);

  const users = db.getData("ll_users");
  const partner = users.find(u => u.id === req.senderId);
  const pName = partner ? partner.name : "Partner";

  const sessions = db.getData("ll_sessions");
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);

  if (token && backendId && partner && partner.backendId) {
    try {
      await fetch(`${window.CONFIG.API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          request_id: backendId,
          partner_id: partner.backendId,
          topic: `Learning ${req.skillOffered} / Teaching ${req.skillWanted}`,
          date: nextWeekDate.toISOString().split('T')[0],
          time: "15:00",
          timezone: "GMT+1"
        })
      });
    } catch(e) {}
  }

  const notifs = db.getData("ll_notifications");
  notifs.unshift({
    id: "notif-" + Date.now(),
    type: "session",
    text: `Upcoming session scheduled with ${pName} on ${nextWeekDate.toISOString().split('T')[0]}.`,
    time: "Just now",
    unread: true
  });
  db.saveData("ll_notifications", notifs);

  const chats = db.getData("ll_chats");
  if (!chats.some(c => c.partnerId === req.senderId)) {
    chats.push({
      id: "chat-" + req.senderId,
      partnerId: req.senderId,
      messages: [
        { sender: req.senderId, text: `Hi! Thanks for accepting my proposal to exchange ${req.skillOffered} for ${req.skillWanted}.`, time: "Just now", status: "unread" }
      ]
    });
    db.saveData("ll_chats", chats);
  }

  showToast(`Accepted proposal from ${pName}! Chat room and calendar session created.`, "success");
  if (token && backendId) {
    await db.syncExchangeRequests();
  } else {
    renderRequests();
    drawCalendar();
    renderAgenda(selectedDateStr);
  }
}

async function rejectRequest(reqId) {
  const requests = db.getData("ll_requests");
  const req = requests.find(r => r.id === reqId);
  if (!req) return;

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const backendId = req.backendId || (req.id && req.id.startsWith("er-") ? req.id.replace("er-", "") : null);

  if (token && backendId) {
    try {
      const res = await fetch(`${window.CONFIG.API_URL}/exchange-requests/${backendId}/reject`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to reject request on backend.", "error");
        return;
      }
    } catch (err) {
      console.error("Error rejecting request on backend:", err);
    }
  }

  req.status = "Rejected";
  db.saveData("ll_requests", requests);

  showToast("Declined proposal.", "info");
  if (token && backendId) {
    await db.syncExchangeRequests();
  } else {
    renderRequests();
  }
}

async function cancelRequest(reqId) {
  const requests = db.getData("ll_requests");
  const req = requests.find(r => r.id === reqId);
  const idx = requests.findIndex(r => r.id === reqId);
  if (idx !== -1) {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const backendId = req?.backendId || (req?.id && req.id.startsWith("er-") ? req.id.replace("er-", "") : null);

    if (token && backendId) {
      try {
        const res = await fetch(`${window.CONFIG.API_URL}/exchange-requests/${backendId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.message || "Failed to cancel request on backend.", "error");
          return;
        }
      } catch (err) {
        console.error("Error cancelling request on backend:", err);
      }
    }

    requests.splice(idx, 1);
    db.saveData("ll_requests", requests);
    showToast("Proposal cancelled successfully.", "info");
    if (token && backendId) {
      await db.syncExchangeRequests();
    } else {
      renderRequests();
    }
  }
}

function drawCalendar() {
  const monthYearHdr = document.getElementById("calendar-month-year");
  const cellsContainer = document.getElementById("calendar-days-cells");
  if (!monthYearHdr || !cellsContainer) return;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  monthYearHdr.textContent = `${months[currentMonth]} ${currentYear}`;

  cellsContainer.innerHTML = "";

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    cellsContainer.innerHTML += `<div class="calendar-day-cell empty-day"></div>`;
  }

  const sessions = db.getData("ll_sessions");
  const today = new Date();

  for (let day = 1; day <= totalDays; day++) {
    const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = cellDateStr === selectedDateStr ? "selected" : "";
    const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day ? "today" : "";
    const hasSess = sessions.some(s => s.date === cellDateStr) ? "has-session" : "";

    cellsContainer.innerHTML += `
      <div class="calendar-day-cell ${isSelected} ${isToday} ${hasSess}" data-date="${cellDateStr}">
        ${day}
      </div>
    `;
  }

  document.querySelectorAll(".calendar-day-cell:not(.empty-day)").forEach(cell => {
    cell.addEventListener("click", () => {
      document.querySelectorAll(".calendar-day-cell").forEach(c => c.classList.remove("selected"));
      cell.classList.add("selected");
      
      selectedDateStr = cell.getAttribute("data-date");
      renderAgenda(selectedDateStr);
    });
  });
}

function setupCalendarNav() {
  document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    drawCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    drawCalendar();
  });
}

function renderAgenda(dateStr) {
  const header = document.getElementById("agenda-selected-date");
  const container = document.getElementById("agenda-sessions-list");
  if (!header || !container) return;

  const parts = dateStr.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mName = months[parseInt(parts[1]) - 1] || "July";
  const dayNum = parseInt(parts[2]) || 9;
  
  header.textContent = `Agenda for ${mName} ${dayNum}, ${parts[0]}`;

  const sessions = db.getData("ll_sessions");
  const activeSessions = sessions.filter(s => s.date === dateStr);

  if (activeSessions.length === 0) {
    const cellDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const isFuture = cellDate >= today;

    container.innerHTML = `
      <div class="empty-state" style="padding: 16px 0;">
        <p>No sessions scheduled.</p>
        ${isFuture ? `<button class="btn btn-secondary btn-sm" id="trigger-booking-btn" style="margin-top:12px;">Schedule Session</button>` : ''}
      </div>
    `;

    if (isFuture) {
      document.getElementById("trigger-booking-btn").addEventListener("click", () => {
        openBookingModal(dateStr);
      });
    }
    return;
  }

  container.innerHTML = "";
  activeSessions.forEach(s => {
    let actionBtn = "";
    if (s.status === "Upcoming") {
      actionBtn = `
        <div class="req-actions-row" style="margin-top: 10px; display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm cancel-session-btn" data-id="${s.id}">Cancel</button>
          <button class="btn btn-primary btn-sm complete-session-btn" data-id="${s.id}">Mark Complete</button>
          <a href="${s.meeting_url || '#'}" target="_blank" class="btn btn-glow btn-sm join-call-btn" style="background:#10b981; color:#fff; border-color:#10b981; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; padding: 6px 12px; border-radius: 8px;">Join Zoom/Meet</a>
        </div>
      `;
    } else if (s.status === "Waiting for Partner") {
      actionBtn = `<div style="font-size:11px; color:#f59e0b; font-weight:600; text-align:right; margin-top:8px;">⏳ Waiting for partner</div>`;
    } else {
      actionBtn = `<div style="font-size:11px; color:#10b981; font-weight:600; text-align:right; margin-top:8px;">✓ Session Completed</div>`;
    }

    container.innerHTML += `
      <div class="agenda-item">
        <div class="agenda-header">
          <h5>${s.topic}</h5>
          <span class="req-status-badge status-${s.status.toLowerCase()}">${s.status}</span>
        </div>
        <div class="agenda-partner">Partner: <strong>${s.partnerName}</strong></div>
        <div class="agenda-meta">
          <span>⏰ ${s.time} (${s.timezone})</span>
          <span>📅 ${s.date}</span>
        </div>
        ${actionBtn}
      </div>
    `;
  });

  document.querySelectorAll(".cancel-session-btn").forEach(btn => {
    btn.addEventListener("click", () => cancelSession(btn.getAttribute("data-id")));
  });

  document.querySelectorAll(".complete-session-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const sessId = btn.getAttribute("data-id");
      const sessions = db.getData("ll_sessions");
      const s = sessions.find(item => item.id == sessId);
      if (!s) return;
      
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (token && s.backendId) {
         try {
             const res = await fetch(`${window.CONFIG.API_URL}/sessions/${s.backendId}/complete`, {
                 method: "PUT",
                 headers: { "Authorization": `Bearer ${token}` }
             });
             const data = await res.json();
             if (!res.ok) {
                 showToast(data.message || "Failed to mark as complete", "error");
                 return;
             }
             if (data.session && data.session.status === 'completed') {
                 showToast("Session fully completed! Please leave a review.", "success");
                 await db.syncSessions();
                 openReviewModal(sessId);
             } else {
                 showToast(data.message || "Waiting for partner to mark complete", "info");
                 await db.syncSessions();
             }
         } catch(e) {
             console.error(e);
         }
      } else {
         openReviewModal(sessId);
      }
    });
  });
}

async function cancelSession(sessId) {
  const sessions = db.getData("ll_sessions");
  const idx = sessions.findIndex(s => s.id == sessId);
  if (idx !== -1) {
    const sessionToCancel = sessions[idx];
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token && sessionToCancel.backendId) {
      try {
        const res = await fetch(`${window.CONFIG.API_URL}/sessions/${sessionToCancel.backendId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.message || "Failed to cancel session.", "error");
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const removed = sessions.splice(idx, 1)[0];
    db.saveData("ll_sessions", sessions);
    showToast(`Cancelled session: ${removed.topic}`, "info");
    
    if (token && sessionToCancel.backendId) {
      await db.syncSessions();
    } else {
      drawCalendar();
      renderAgenda(selectedDateStr);
    }
  }
}

function setupBookingModalEvents() {
  const modal = document.getElementById("booking-modal");
  const closeBtn = document.getElementById("close-booking-modal");
  const cancelBtn = document.getElementById("cancel-booking-modal");
  const form = document.getElementById("booking-form");

  if (!modal) return;

  const closeModal = () => modal.classList.remove("active");

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const partnerId = document.getElementById("book-partner-select").value;
    const topic = document.getElementById("book-topic").value.trim();
    const date = document.getElementById("book-date").value;
    const time = document.getElementById("book-time").value;
    const timezone = document.getElementById("book-timezone").value;

    const allUsers = db.getData("ll_users");
    const partner = allUsers.find(u => u.id === partnerId);
    const pName = partner ? partner.name : "Partner";

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token && partner && partner.backendId) {
      try {
        await fetch(`${window.CONFIG.API_URL}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            request_id: null,
            partner_id: partner.backendId,
            topic: topic,
            date: date,
            time: time,
            timezone: timezone
          })
        });
        await db.syncSessions();
      } catch(e) {}
    }

    const notifs = db.getData("ll_notifications");
    notifs.unshift({
      id: "notif-" + Date.now(),
      type: "session",
      text: `Session scheduled with ${pName} for ${topic}.`,
      time: "Just now",
      unread: false
    });
    db.saveData("ll_notifications", notifs);

    closeModal();
    drawCalendar();
    renderAgenda(selectedDateStr);
    showToast(`Session successfully scheduled with ${pName}!`, "success");
  });
}

function openBookingModal(defaultDateStr) {
  const modal = document.getElementById("booking-modal");
  const select = document.getElementById("book-partner-select");
  
  if (!modal || !select) return;

  const requests = db.getData("ll_requests");
  const users = db.getData("ll_users");
  const currentUser = db.getCurrentUser();

  const acceptedPartners = [];
  requests.forEach(r => {
    if (r.status === "Accepted") {
      const pId = r.senderId === currentUser.id ? r.receiverId : r.senderId;
      const partner = users.find(u => u.id === pId);
      if (partner && partner.id !== currentUser.id && partner.backendId !== currentUser.backendId && !acceptedPartners.some(p => p.id === partner.id)) {
        acceptedPartners.push(partner);
      }
    }
  });

  if (acceptedPartners.length === 0) {
    showToast("You need at least one Accepted exchange proposal to schedule sessions! Try matching in the Explore panel.", "error");
    return;
  }

  select.innerHTML = "";
  acceptedPartners.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });

  document.getElementById("book-date").value = defaultDateStr;
  document.getElementById("book-topic").value = "";
  document.getElementById("book-time").value = "10:00";
  
  modal.classList.add("active");
}

function setupReviewModalEvents() {
  const modal = document.getElementById("review-modal");
  const closeBtn = document.getElementById("close-review-modal");
  const cancelBtn = document.getElementById("cancel-review-modal");
  const form = document.getElementById("review-form");

  if (!modal) return;

  const closeModal = () => modal.classList.remove("active");

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  const stars = document.querySelectorAll(".star-interactive");
  const ratingInput = document.getElementById("review-rating-score");

  stars.forEach(star => {
    star.addEventListener("mouseover", () => {
      const val = parseInt(star.getAttribute("data-val"));
      stars.forEach(s => {
        if (parseInt(s.getAttribute("data-val")) <= val) {
          s.classList.add("hovered");
        } else {
          s.classList.remove("hovered");
        }
      });
    });

    star.addEventListener("mouseout", () => {
      stars.forEach(s => s.classList.remove("hovered"));
    });

    star.addEventListener("click", () => {
      const val = parseInt(star.getAttribute("data-val"));
      ratingInput.value = val;
      stars.forEach(s => {
        if (parseInt(s.getAttribute("data-val")) <= val) {
          s.classList.add("selected");
        } else {
          s.classList.remove("selected");
        }
      });
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sessId = document.getElementById("review-session-id").value;
    const exchangeId = document.getElementById("review-exchange-id") ? document.getElementById("review-exchange-id").value : "";
    const backendId = document.getElementById("review-backend-id") ? document.getElementById("review-backend-id").value : "";
    const rating = parseInt(ratingInput.value);
    const feedback = document.getElementById("review-feedback-msg").value.trim();

    if (exchangeId) {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const bId = backendId || (exchangeId.startsWith("er-") ? exchangeId.replace("er-", "") : null);
      if (token && bId) {
        try {
          const res = await fetch(`${window.CONFIG.API_URL}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ request_id: bId, rating: rating, comment: feedback })
          });
          const data = await res.json();
          if (!res.ok) {
            showToast(data.message || "Failed to submit review", "error");
            return;
          }
        } catch (err) {
          console.error("Error submitting review:", err);
          showToast("Failed to submit review", "error");
          return;
        }
      }
      closeModal();
      showToast("Feedback submitted successfully!", "success");
      return;
    }

    const sessions = db.getData("ll_sessions");
    const s = sessions.find(item => item.id === sessId);
    if (!s) return;

    s.status = "Completed";
    s.reviewed = true;
    db.saveData("ll_sessions", sessions);

    const reviews = db.getData("ll_reviews");
    reviews.unshift({
      id: "rev-" + Date.now(),
      userId: s.partnerId,
      authorName: db.getCurrentUser().name,
      rating: rating,
      text: feedback,
      date: "Just now"
    });
    db.saveData("ll_reviews", reviews);

    const user = db.getCurrentUser();
    user.exchangesCompleted = (user.exchangesCompleted || 0) + 1;
    
    const distinctPartners = new Set(sessions.filter(sess => sess.status === "Completed").map(sess => sess.partnerId));
    if (distinctPartners.size >= 3 && !user.badges.includes("Community Helper")) {
      user.badges.push("Community Helper");
      triggerBadgeUnlockNotif("Community Helper");
    }

    if (user.exchangesCompleted >= 5 && user.rating >= 4.8 && !user.badges.includes("Top Teacher")) {
      user.badges.push("Top Teacher");
      triggerBadgeUnlockNotif("Top Teacher");
    }

    db.setCurrentUser(user);
    const masterList = db.getData("ll_users");
    const uIdx = masterList.findIndex(u => u.id === user.id);
    if (uIdx !== -1) {
      masterList[uIdx] = user;
      db.saveData("ll_users", masterList);
    }

    if (!user.badges.includes("Knowledge Contributor")) {
      user.badges.push("Knowledge Contributor");
      triggerBadgeUnlockNotif("Knowledge Contributor");
    }

    closeModal();
    drawCalendar();
    renderAgenda(selectedDateStr);
    showToast("Feedback submitted successfully! Review completed.", "success");
  });
}

function openExchangeReviewModal(exchangeId, backendId) {
  const modal = document.getElementById("review-modal");
  if (!modal) return;

  document.getElementById("review-session-id").value = "";
  if (document.getElementById("review-exchange-id")) {
    document.getElementById("review-exchange-id").value = exchangeId;
  }
  if (document.getElementById("review-backend-id")) {
    document.getElementById("review-backend-id").value = backendId || "";
  }
  document.getElementById("review-feedback-msg").value = "";
  
  document.getElementById("review-rating-score").value = "5";
  document.querySelectorAll(".star-interactive").forEach(s => {
    s.classList.add("selected");
  });

  modal.classList.add("active");
}

function openReviewModal(sessId) {
  const modal = document.getElementById("review-modal");
  if (!modal) return;

  document.getElementById("review-session-id").value = sessId;
  if (document.getElementById("review-exchange-id")) {
    document.getElementById("review-exchange-id").value = "";
  }
  document.getElementById("review-feedback-msg").value = "";
  
  document.getElementById("review-rating-score").value = "5";
  document.querySelectorAll(".star-interactive").forEach(s => {
    s.classList.add("selected");
  });

  modal.classList.add("active");
}

function triggerBadgeUnlockNotif(badgeName) {
  const notifs = db.getData("ll_notifications");
  notifs.unshift({
    id: "notif-" + Date.now(),
    type: "system",
    text: `🏆 Achievements Earned: ${badgeName}! Nice going.`,
    time: "Just now",
    unread: true
  });
  db.saveData("ll_notifications", notifs);
  showToast(`🏆 Badge Unlocked: ${badgeName}!`, "success");
}
