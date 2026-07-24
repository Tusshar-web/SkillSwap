// Learnova Explore & Matching Logic
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
    sidebarContainer.innerHTML = getSidebarHTML("explore");
    setupTheme();
  }

  renderMatches();
  setupFilters();
  setupRequestModalEvents();
  db.syncExchangeRequests();

  window.addEventListener("ll_users_updated", () => {
    renderMatches();
  });
  window.addEventListener("ll_requests_updated", () => {
    renderMatches();
  });
});

function renderMatches() {
  const grid = document.getElementById("explore-matches-grid");
  if (!grid) return;

  const currentUser = db.getCurrentUser();
  const allUsers = db.getData("ll_users");
  const requests = db.getData("ll_requests");

  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

  const query = document.getElementById("search-query").value.toLowerCase();
  const levelFilter = document.getElementById("filter-level").value;
  const availFilter = document.getElementById("filter-availability").value;
  const ratingFilter = document.getElementById("filter-rating").value;

  const matches = otherUsers.map(partner => {
    const score = calculateCompatibility(currentUser, partner);
    return { ...partner, compatibilityScore: score };
  }).filter(partner => {
    const matchesName = partner.name.toLowerCase().includes(query);
    const matchesBio = partner.bio.toLowerCase().includes(query);
    const matchesOffer = partner.skillsOffered.some(s => s.name.toLowerCase().includes(query));
    const matchesWant = partner.skillsWanted.some(s => s.name.toLowerCase().includes(query));
    
    if (query && !matchesName && !matchesBio && !matchesOffer && !matchesWant) {
      return false;
    }

    if (levelFilter !== "all" && !partner.skillsOffered.some(s => s.level === levelFilter)) {
      return false;
    }

    if (availFilter !== "all" && !partner.availability.toLowerCase().includes(availFilter.toLowerCase())) {
      return false;
    }

    if (ratingFilter !== "all" && partner.rating < parseFloat(ratingFilter)) {
      return false;
    }

    return true;
  });

  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  if (matches.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 80px 0;">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
        <p>No matching learning partners found. Try expanding your search queries or clearing filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = "";
  matches.forEach(partner => {
    const req = requests.find(r => 
      (r.senderId === currentUser.id && r.receiverId === partner.id) ||
      (r.senderId === partner.id && r.receiverId === currentUser.id)
    );

    let btnHTML = "";
    if (req) {
      if (req.status === "Pending") {
        if (req.senderId === currentUser.id) {
          btnHTML = `<button class="btn btn-secondary" style="cursor:default;" disabled>Pending Proposal</button>`;
        } else {
          btnHTML = `<a href="requests.html" class="btn btn-secondary">Review Proposal</a>`;
        }
      } else if (req.status === "Accepted") {
        btnHTML = `<a href="chat.html?partner=${partner.id}" class="btn btn-secondary btn-glow" style="border-color:var(--cyan); color:var(--cyan);">Active Exchange</a>`;
      } else {
        btnHTML = `<button class="btn btn-primary btn-glow send-proposal-btn" data-id="${partner.id}">Resend Proposal</button>`;
      }
    } else {
      btnHTML = `<button class="btn btn-primary btn-glow send-proposal-btn" data-id="${partner.id}">Send Proposal</button>`;
    }

    const strokeDash = 100.5;
    const strokeOffset = strokeDash - (strokeDash * partner.compatibilityScore) / 100;

    grid.innerHTML += `
      <div class="match-card glass-card">
        
        <div class="match-card-top">
          <div class="match-user-details">
            <div class="match-avatar">${getAvatarHTML(partner)}</div>
            <div class="match-name-location">
              <h4>${partner.name}</h4>
              <p>${partner.location}</p>
            </div>
          </div>
          
          <div class="compatibility-ring-wrapper" title="Mutual Skill Match Compatibility Score: ${partner.compatibilityScore}%">
            <svg class="compatibility-ring-svg" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#06B6D4"/>
                  <stop offset="100%" stop-color="#7C3AED"/>
                </linearGradient>
              </defs>
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="ring-fg" stroke-dasharray="${strokeDash}, ${strokeDash}" stroke-dashoffset="${strokeOffset}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span class="compatibility-text">${partner.compatibilityScore}%</span>
          </div>
        </div>

        <p class="match-bio-text">${partner.bio}</p>

        <div class="match-skills-block">
          <h5>Can Teach</h5>
          <div class="skills-tags-wrap">
            ${partner.skillsOffered.map(s => `<span class="skill-tag tag-offer">${s.name} <span style="font-size:8px; opacity:0.8;">(${s.level})</span></span>`).join("") || '<span style="font-size:12px; color:var(--text-muted);">None listed</span>'}
          </div>
        </div>

        <div class="match-skills-block">
          <h5>Wants to Learn</h5>
          <div class="skills-tags-wrap">
            ${partner.skillsWanted.map(s => `<span class="skill-tag tag-want">${s.name}</span>`).join("") || '<span style="font-size:12px; color:var(--text-muted);">None listed</span>'}
          </div>
        </div>

        <div class="match-card-footer">
          <span class="match-rating-stats">★ <strong>${partner.rating.toFixed(1)}</strong> (${partner.reviewsCount} reviews)</span>
          ${btnHTML}
        </div>

      </div>
    `;
  });

  document.querySelectorAll(".send-proposal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const partnerId = btn.getAttribute("data-id");
      const currentUser = db.getCurrentUser();
      const allUsers = db.getData("ll_users");
      const partner = allUsers.find(u => u.id === partnerId);
      
      if (!currentUser.skillsOffered || currentUser.skillsOffered.length === 0) {
        showToast("Please add skills you teach in your profile first!", "error");
        return;
      }
      
      if (!partner || !partner.skillsOffered || partner.skillsOffered.length === 0) {
        showToast("This partner has not listed any skills to teach yet!", "error");
        return;
      }
      
      openExchangeModal(partnerId);
    });
  });
}

function calculateCompatibility(user, partner) {
  if (user.skillsOffered.length === 0 && user.skillsWanted.length === 0) {
    return 60;
  }

  let matchesOfferedCount = 0;
  let matchesWantedCount = 0;

  user.skillsWanted.forEach(sw => {
    if (partner.skillsOffered.some(po => po.name.toLowerCase() === sw.name.toLowerCase())) {
      matchesOfferedCount++;
    }
  });

  user.skillsOffered.forEach(so => {
    if (partner.skillsWanted.some(pw => pw.name.toLowerCase() === so.name.toLowerCase())) {
      matchesWantedCount++;
    }
  });

  const matchWeight = (matchesOfferedCount + matchesWantedCount) * 20;
  return Math.min(50 + matchWeight, 98);
}

function setupFilters() {
  const queryInput = document.getElementById("search-query");
  const levelSelect = document.getElementById("filter-level");
  const availSelect = document.getElementById("filter-availability");
  const ratingSelect = document.getElementById("filter-rating");
  const clearBtn = document.getElementById("clear-filters-btn");

  if (!queryInput) return;

  const triggerRender = () => renderMatches();

  queryInput.addEventListener("input", triggerRender);
  levelSelect.addEventListener("change", triggerRender);
  availSelect.addEventListener("change", triggerRender);
  ratingSelect.addEventListener("change", triggerRender);

  clearBtn.addEventListener("click", () => {
    queryInput.value = "";
    levelSelect.value = "all";
    availSelect.value = "all";
    ratingSelect.value = "all";
    renderMatches();
    showToast("Filters cleared!", "info");
  });
}

function setupRequestModalEvents() {
  const modal = document.getElementById("exchange-modal");
  const closeBtn = document.getElementById("close-exchange-modal");
  const cancelBtn = document.getElementById("cancel-exchange-modal");
  const form = document.getElementById("exchange-request-form");

  if (!modal) return;

  const closeModal = () => modal.classList.remove("active");

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const partnerId = document.getElementById("target-partner-id").value;
    const offerSelect = document.getElementById("barter-offer-select");
    const receiveSelect = document.getElementById("barter-receive-select");
    const offerSkill = offerSelect.value;
    const receiveSkill = receiveSelect.value;
    const offerSkillId = offerSelect.selectedOptions[0]?.getAttribute("data-skill-id");
    const receiveSkillId = receiveSelect.selectedOptions[0]?.getAttribute("data-skill-id");
    const proposalMsg = document.getElementById("exchange-proposal-msg").value.trim();

    const currentUser = db.getCurrentUser();
    const allUsers = db.getData("ll_users");
    const partner = allUsers.find(u => u.id === partnerId);
    if (!partner) return;

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const targetBackendId = partner.backendId || (partnerId && partnerId.startsWith("user-") ? partnerId.replace("user-", "") : null);
    let apiSuccess = false;

    if (token && offerSkillId && receiveSkillId && targetBackendId && !isNaN(Number(targetBackendId))) {
      try {
        const response = await fetch(`${window.CONFIG.API_URL}/exchange-requests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            receiver_id: Number(targetBackendId),
            sender_user_skill_id: Number(offerSkillId),
            receiver_user_skill_id: Number(receiveSkillId),
            message: proposalMsg
          })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          apiSuccess = true;
          await db.syncExchangeRequests();
        } else {
          console.warn("Backend exchange request creation warning:", data.message);
          if (response.status === 400 || response.status === 403 || response.status === 409) {
            showToast(data.message || "Failed to send proposal.", "error");
            return;
          }
        }
      } catch (err) {
        console.error("Error creating exchange request via API:", err);
      }
    }

    if (!apiSuccess) {
      const requests = db.getData("ll_requests");
      const newRequest = {
        id: "req-" + Date.now(),
        senderId: currentUser.id,
        receiverId: partner.id,
        skillOffered: offerSkill,
        skillWanted: receiveSkill,
        senderSkillId: offerSkillId || null,
        receiverSkillId: receiveSkillId || null,
        proposalMessage: proposalMsg,
        status: "Pending",
        timestamp: new Date().toISOString()
      };

      requests.push(newRequest);
      db.saveData("ll_requests", requests);
      triggerSimulatedAcceptance(newRequest.id, partner.name);
    }

    const notifs = db.getData("ll_notifications");
    notifs.unshift({
      id: "notif-" + Date.now(),
      type: "request",
      text: `Proposal sent successfully to ${partner.name}.`,
      time: "Just now",
      unread: false
    });
    db.saveData("ll_notifications", notifs);

    closeModal();
    renderMatches();
    showToast(`Proposal sent to ${partner.name}!`, "success");
  });
}

function openExchangeModal(partnerId) {
  const modal = document.getElementById("exchange-modal");
  const currentUser = db.getCurrentUser();
  const allUsers = db.getData("ll_users");
  const partner = allUsers.find(u => u.id === partnerId);
  
  if (!modal || !partner) return;

  document.getElementById("target-partner-id").value = partnerId;
  document.getElementById("partner-offer-label").textContent = `${partner.name} offers`;

  const offerSelect = document.getElementById("barter-offer-select");
  const receiveSelect = document.getElementById("barter-receive-select");

  offerSelect.innerHTML = "";
  if (currentUser.skillsOffered.length === 0) {
    offerSelect.innerHTML = `<option value="">Fill profile offered skills first</option>`;
  } else {
    currentUser.skillsOffered.forEach(s => {
      offerSelect.innerHTML += `<option value="${s.name}" data-skill-id="${s.userSkillId || ''}">${s.name} (${s.level})</option>`;
    });
  }

  receiveSelect.innerHTML = "";
  if (partner.skillsOffered.length === 0) {
    receiveSelect.innerHTML = `<option value="">No skills listed</option>`;
  } else {
    partner.skillsOffered.forEach(s => {
      receiveSelect.innerHTML += `<option value="${s.name}" data-skill-id="${s.userSkillId || ''}">${s.name} (${s.level})</option>`;
    });
  }

  const userOfferText = currentUser.skillsOffered[0] ? currentUser.skillsOffered[0].name : "my skills";
  const partnerOfferText = partner.skillsOffered[0] ? partner.skillsOffered[0].name : "your skills";
  document.getElementById("exchange-proposal-msg").value = `Hi ${partner.name.split(" ")[0]}! I'd love to help you with ${userOfferText} in exchange for learning ${partnerOfferText}. Let's coordinate!`;

  modal.classList.add("active");
}

function triggerSimulatedAcceptance(requestId, partnerName) {
  setTimeout(() => {
    const requests = db.getData("ll_requests");
    const req = requests.find(r => r.id === requestId);
    if (!req || req.status !== "Pending") return;

    const approved = Math.random() < 0.8;
    req.status = approved ? "Accepted" : "Rejected";
    db.saveData("ll_requests", requests);

    const notifs = db.getData("ll_notifications");
    
    if (approved) {
      notifs.unshift({
        id: "notif-sim-" + Date.now(),
        type: "request",
        text: `👍 ${partnerName} accepted your skill exchange proposal!`,
        time: "Just now",
        unread: true
      });

      const sessions = db.getData("ll_sessions");
      const nextWeekDate = new Date();
      nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      
      const newSession = {
        id: "sess-" + Date.now(),
        requestId: requestId,
        partnerId: req.receiverId,
        partnerName: partnerName,
        date: nextWeekDate.toISOString().split('T')[0],
        time: "17:00",
        timezone: "Local Time",
        topic: `${req.skillWanted} session & exchange`,
        status: "Upcoming"
      };
      sessions.push(newSession);
      db.saveData("ll_sessions", sessions);
    } else {
      notifs.unshift({
        id: "notif-sim-" + Date.now(),
        type: "request",
        text: `❌ ${partnerName} declined your exchange proposal.`,
        time: "Just now",
        unread: true
      });
    }
    db.saveData("ll_notifications", notifs);

    if (window.location.pathname.includes("explore.html")) {
      renderMatches();
    }
  }, 6000);
}
