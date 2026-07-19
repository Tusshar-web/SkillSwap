// Learnova Global State & Theme Manager

// Global Badges Directory
var BADGES_LIST = [
  {
    name: "Top Teacher",
    icon: "🏅",
    desc: "Completed 5+ teaching sessions with a rating >= 4.8",
  },
  {
    name: "Active Learner",
    icon: "🚀",
    desc: "Registered and started learning on Learnova",
  },
  {
    name: "Community Helper",
    icon: "🤝",
    desc: "Exchanged skills with 3+ different users",
  },
  {
    name: "Skill Master",
    icon: "🎓",
    desc: "Added 3+ Expert level skills to your offering list",
  },
  {
    name: "Knowledge Contributor",
    icon: "💡",
    desc: "Submitted detailed feedback review on matches",
  },
];

// Mock Users Database
const MOCK_USERS = [];

class LearnLoopDB {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem("ll_initialized")) {
      localStorage.setItem("ll_users", JSON.stringify([]));
      localStorage.setItem(
        "ll_requests",
        JSON.stringify([
          {
            id: "req-1",
            senderId: "user-1",
            receiverId: "current-user",
            skillOffered: "UI/UX Design",
            skillWanted: "Node.js",
            status: "Pending",
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: "req-2",
            senderId: "user-3",
            receiverId: "current-user",
            skillOffered: "Public Speaking",
            skillWanted: "HTML/CSS",
            status: "Accepted",
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ]),
      );
      localStorage.setItem(
        "ll_sessions",
        JSON.stringify([
          {
            id: "sess-1",
            requestId: "req-2",
            partnerId: "user-3",
            partnerName: "Sarah Jenkins",
            date: new Date().toISOString().split("T")[0],
            time: "15:00",
            timezone: "GMT+1",
            topic: "HTML/CSS Basics for Beginners",
            status: "Upcoming",
          },
          {
            id: "sess-2",
            requestId: "req-mock-old",
            partnerId: "user-2",
            partnerName: "Kai Tanaka",
            date: new Date(Date.now() - 3600000 * 72)
              .toISOString()
              .split("T")[0],
            time: "18:00",
            timezone: "GMT+9",
            topic: "Python loops and data analysis",
            status: "Completed",
            reviewed: true,
          },
        ]),
      );
      localStorage.setItem(
        "ll_chats",
        JSON.stringify([
          {
            id: "chat-user-3",
            partnerId: "user-3",
            messages: [
              {
                sender: "user-3",
                text: "Hi! I saw you are looking to learn Public Speaking.",
                time: "10:30 AM",
                status: "read",
              },
              {
                sender: "current-user",
                text: "Yes, that's correct! And I can help you with HTML/CSS.",
                time: "10:32 AM",
                status: "read",
              },
              {
                sender: "user-3",
                text: "Awesome! Let's arrange our first session on the Calendar. I sent an exchange request.",
                time: "10:35 AM",
                status: "read",
              },
            ],
          },
        ]),
      );
      localStorage.setItem(
        "ll_notifications",
        JSON.stringify([
          {
            id: "notif-1",
            type: "request",
            text: "Elena Rostova sent you a skill exchange request.",
            time: "2 hours ago",
            unread: true,
          },
          {
            id: "notif-2",
            type: "session",
            text: "Upcoming session scheduled with Sarah Jenkins.",
            time: "1 day ago",
            unread: false,
          },
        ]),
      );
      localStorage.setItem(
        "ll_reviews",
        JSON.stringify([
          {
            id: "rev-1",
            userId: "current-user",
            authorName: "Kai Tanaka",
            rating: 5,
            text: "Excellent teacher! Explained HTML & CSS concepts with real world layouts. Highly recommended.",
            date: "3 days ago",
          },
        ]),
      );

      // Initialize Community Photo Sharing posts
      localStorage.setItem(
        "ll_posts",
        JSON.stringify([
          {
            id: "post-1",
            authorName: "Sarah Jenkins",
            authorHeadline: "Keynote Speaker & Business English Coach",
            authorAvatar: `<svg viewBox="0 0 100 100" class="avatar-svg"><defs><linearGradient id="av-3-p" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10B981" /><stop offset="100%" stop-color="#3B82F6" /></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av-3-p)"/><text x="50" y="58" font-size="28" font-weight="700" fill="#FFF" text-anchor="middle">SJ</text></svg>`,
            caption:
              "Just completed an amazing public speaking swap on Learnova! Elena gave me great notes on CSS grids, and I helped her structure her keynote pitch. Truly a community of builders. 💡🎨",
            photoType: "study", // study workspace SVG
            timestamp: "2 hours ago",
            likes: 8,
            likedBy: [],
          },
          {
            id: "post-2",
            authorName: "Elena Rostova",
            authorHeadline: "Senior Product Designer & Design Systems Lead",
            authorAvatar: `<svg viewBox="0 0 100 100" class="avatar-svg"><defs><linearGradient id="av-1-p" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#EC4899" /><stop offset="100%" stop-color="#8B5CF6" /></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av-1-p)"/><text x="50" y="58" font-size="28" font-weight="700" fill="#FFF" text-anchor="middle">ER</text></svg>`,
            caption:
              "Successfully unlocked the 'Top Teacher' badge today! Over 12 skill exchanges completed. Thank you to everyone for the endorsements! 📜🏆",
            photoType: "certificate", // certificate medal SVG
            timestamp: "1 day ago",
            likes: 15,
            likedBy: [],
          },
        ]),
      );

      localStorage.setItem("ll_initialized", "true");
    }
  }

  getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("ll_current_user"));
  }

  setCurrentUser(user) {
    sessionStorage.setItem("ll_current_user", JSON.stringify(user));
  }

  logout() {
    sessionStorage.removeItem("ll_current_user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
  }

  async fetchActualUsers() {
    try {
      const res = await fetch("http://localhost:5009/api/users/all");
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        const realUsers = json.data;
        this.saveData("ll_users", realUsers);

        const current = this.getCurrentUser();
        if (current) {
          const myRealUser = realUsers.find(
            (u) => u.backendId === current.backendId || u.id === current.id
          );
          if (myRealUser) {
            const updatedProfile = { ...current, ...myRealUser };
            sessionStorage.setItem("ll_current_user", JSON.stringify(updatedProfile));
          }
        }
        window.dispatchEvent(new CustomEvent("ll_users_updated"));
      }
      await this.syncMySkills();
      await this.syncExchangeRequests();
    } catch (err) {
      console.error("Could not fetch actual users from backend:", err);
    }
  }

  async syncMySkills() {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5009/api/skills/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.success && Array.isArray(json.skills)) {
        const current = this.getCurrentUser();
        if (!current) return;
        const offered = json.skills
          .filter(s => s.skill_type === "offer" || s.skill_type === "OFFER" || s.skill_type === "Offer")
          .map((s, idx) => ({
            userSkillId: s.user_skill_id,
            name: s.skill_name,
            level: s.proficiency || "Intermediate",
            endorsements: 5 + (idx * 2),
            description: s.description || ""
          }));
        const wanted = json.skills
          .filter(s => s.skill_type === "want" || s.skill_type === "WANT" || s.skill_type === "Want")
          .map((s, idx) => ({
            userSkillId: s.user_skill_id,
            name: s.skill_name,
            level: s.proficiency || "Beginner",
            endorsements: 2,
            description: s.description || ""
          }));
        current.skillsOffered = offered;
        current.skillsWanted = wanted;
        this.setCurrentUser(current);
        window.dispatchEvent(new CustomEvent("ll_skills_updated"));
      }
    } catch (err) {
      console.error("Could not sync my skills from backend:", err);
    }
  }

  async syncExchangeRequests() {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return;
    try {
      const [inRes, outRes] = await Promise.all([
        fetch("http://localhost:5009/api/exchange-requests/incoming", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://localhost:5009/api/exchange-requests/outgoing", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (!inRes.ok || !outRes.ok) return;

      const inJson = await inRes.json();
      const outJson = await outRes.json();

      if (inJson.success && outJson.success && Array.isArray(inJson.requests) && Array.isArray(outJson.requests)) {
        const formattedIncoming = inJson.requests.map(er => ({
          id: "er-" + er.request_id,
          backendId: er.request_id,
          senderId: "user-" + er.sender_id,
          receiverId: "user-" + er.receiver_id,
          skillOffered: er.sender_skill || "Offered Skill",
          skillWanted: er.receiver_skill || "Requested Skill",
          senderSkillId: er.sender_user_skill_id,
          receiverSkillId: er.receiver_user_skill_id,
          proposalMessage: er.message || "",
          status: er.status ? (er.status.charAt(0).toUpperCase() + er.status.slice(1).toLowerCase()) : "Pending",
          timestamp: er.created_at || new Date().toISOString()
        }));

        const formattedOutgoing = outJson.requests.map(er => ({
          id: "er-" + er.request_id,
          backendId: er.request_id,
          senderId: "user-" + er.sender_id,
          receiverId: "user-" + er.receiver_id,
          skillOffered: er.sender_skill || "Offered Skill",
          skillWanted: er.receiver_skill || "Requested Skill",
          senderSkillId: er.sender_user_skill_id,
          receiverSkillId: er.receiver_user_skill_id,
          proposalMessage: er.message || "",
          status: er.status ? (er.status.charAt(0).toUpperCase() + er.status.slice(1).toLowerCase()) : "Pending",
          timestamp: er.created_at || new Date().toISOString()
        }));

        const existing = this.getData("ll_requests") || [];
        const localOnly = existing.filter(r => r && r.id && r.id.startsWith("req-"));
        const combined = [...formattedIncoming, ...formattedOutgoing, ...localOnly];

        this.saveData("ll_requests", combined);
        window.dispatchEvent(new CustomEvent("ll_requests_updated"));
      }
    } catch (err) {
      console.error("Could not sync exchange requests from backend:", err);
    }
  }
}

const db = new LearnLoopDB();

// 2. Global DOM Initializations (Custom Cursor, Scroll Progress, Theme Toggles)
document.addEventListener("DOMContentLoaded", () => {
  setupCustomCursor();
  setupScrollProgress();
  setupTheme();
  setupNavbarScroll();
  setupToastContainer();
  setupDropdowns();
  setupBackToTop();
  setupMobileToggle();
  db.fetchActualUsers();

  // Hide loader
  const loader = document.getElementById("loader-screen");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 800);
  }
});

// Toast Manager
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type} glass`;

  let icon = "";
  if (type === "success") {
    icon = `<svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else if (type === "error") {
    icon = `<svg width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    icon = `<svg width="18" height="18" fill="none" stroke="#06B6D4" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  toast.innerHTML = `
    ${icon}
    <div class="toast-text">${message}</div>
    <div class="toast-close">&times;</div>
  `;

  container.appendChild(toast);

  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.remove();
  });

  setTimeout(() => {
    toast.style.animation =
      "slideDown 0.3s forwards, fadeIn 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Custom Cursor Implementation
function setupCustomCursor() {
  const cursor = document.createElement("div");
  cursor.id = "custom-cursor";
  const cursorRing = document.createElement("div");
  cursorRing.id = "custom-cursor-ring";

  document.body.appendChild(cursor);
  document.body.appendChild(cursorRing);

  let mouseX = 0,
    mouseY = 0;
  let ringX = 0,
    ringY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top = mouseY + "px";
  });

  function animateRing() {
    const ease = 0.15;
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;

    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverElements =
    "a, button, .clickable, .btn, .glass-card, input, select, textarea";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverElements)) {
      cursor.style.width = "12px";
      cursor.style.height = "12px";
      cursor.style.backgroundColor = "var(--purple)";
      cursorRing.style.width = "42px";
      cursorRing.style.height = "42px";
      cursorRing.style.borderColor = "rgba(124, 58, 237, 0.6)";
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverElements)) {
      cursor.style.width = "8px";
      cursor.style.height = "8px";
      cursor.style.backgroundColor = "var(--cyan)";
      cursorRing.style.width = "32px";
      cursorRing.style.height = "32px";
      cursorRing.style.borderColor = "rgba(6, 182, 212, 0.4)";
    }
  });
}

// Scroll Progress
function setupScrollProgress() {
  const progress = document.createElement("div");
  progress.id = "scroll-progress";
  document.body.appendChild(progress);

  window.addEventListener("scroll", () => {
    const totalScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      const percentage = (window.pageYOffset / totalScroll) * 100;
      progress.style.width = percentage + "%";
    } else {
      progress.style.width = "0%";
    }
  });
}

// Light & Dark theme toggle
function setupTheme() {
  const savedTheme = localStorage.getItem("ll_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  renderThemeIcons();
  setupFavicon();

  // Restore sidebar collapsed state
  const layout = document.querySelector(".dashboard-layout");
  const sidebar = document.querySelector(".sidebar");
  if (layout && sidebar && localStorage.getItem("ll_sidebar_collapsed") === "true") {
    layout.classList.add("sidebar-collapsed");
    sidebar.classList.add("collapsed");
  }
}

// Inject SVG favicon dynamically
function setupFavicon() {
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    document.head.appendChild(favicon);
  }
  favicon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 24' fill='none'><circle cx='14' cy='12' r='8' stroke='%234F46E5' stroke-width='3.5'/><circle cx='27' cy='12' r='8' stroke='%23374151' stroke-width='3.5' stroke-opacity='0.9'/></svg>";
}

function renderThemeIcons() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "dark";
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.innerHTML = currentTheme === "dark" ? getSunIcon() : getMoonIcon();
  });
}

// Global Event Delegation for Theme Toggles
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".theme-toggle");
  if (btn) {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("ll_theme", newTheme);
    renderThemeIcons();
    showToast(
      `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode activated!`,
      "info",
    );
  }
});

function getSunIcon() {
  return `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-linecap="round"/></svg>`;
}

function getMoonIcon() {
  return `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-linecap="round"/></svg>`;
}

// Navbar scroll styles
function setupNavbarScroll() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  });
}

// Toast container creation
function setupToastContainer() {
  if (!document.getElementById("toast-container")) {
    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
}

// Notification & Avatar dropdown triggers
function setupDropdowns() {
  const notifTrigger = document.querySelector(".notification-bell");
  const notifDropdown = document.querySelector(".notification-dropdown");
  const avatarTrigger = document.querySelector(".avatar-trigger");
  const userDropdown = document.querySelector(".user-dropdown");

  if (notifTrigger && notifDropdown) {
    notifTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("active");
      if (userDropdown) userDropdown.classList.remove("active");

      const badge = notifTrigger.querySelector(".bell-badge");
      if (badge) badge.style.display = "none";

      const notifs = db.getData("ll_notifications");
      notifs.forEach((n) => (n.unread = false));
      db.saveData("ll_notifications", notifs);
    });
  }

  if (avatarTrigger && userDropdown) {
    avatarTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
      if (notifDropdown) notifDropdown.classList.remove("active");
    });
  }

  window.addEventListener("click", () => {
    if (notifDropdown) notifDropdown.classList.remove("active");
    if (userDropdown) userDropdown.classList.remove("active");
  });

  renderNotifications();
}

function renderNotifications() {
  const list = document.getElementById("notifications-list");
  if (!list) return;

  const notifications = db.getData("ll_notifications");
  if (notifications.length === 0) {
    list.innerHTML = `<div class="dropdown-header" style="text-align:center; padding: 24px 0; color:var(--text-muted);">No new notifications</div>`;
    return;
  }

  list.innerHTML = "";
  notifications.forEach((n) => {
    let iconStr = "";
    if (n.type === "chat") {
      iconStr = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`;
    } else if (n.type === "request") {
      iconStr = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;
    } else {
      iconStr = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    }

    list.innerHTML += `
      <div class="notif-item ${n.unread ? "unread" : ""}">
        <div class="notif-icon">${iconStr}</div>
        <div class="notif-content">
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `;
  });
}

// Back to top floating button
function setupBackToTop() {
  const btn = document.createElement("button");
  btn.id = "back-to-top";
  btn.className = "btn btn-icon btn-primary glass-card";
  btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>`;

  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Hamburger Navigation Toggle (Mobile)
function setupMobileToggle() {
  document.addEventListener("click", (e) => {
    // 1. Landing Page / Nav Toggle (using Event Delegation)
    const landingToggle = e.target.closest(".mobile-nav-toggle");
    if (landingToggle) {
      const navLinks = document.querySelector(".nav-links");
      const sidebar = document.querySelector(".sidebar");
      if (navLinks) {
        navLinks.classList.toggle("active");
      }
      if (sidebar) {
        sidebar.classList.toggle("active");
      }
    }

    // 2. Logged-In Pages Sidebar Toggle (using Event Delegation)
    const sidebarToggle = e.target.closest("#mobile-sidebar-toggle");
    const sidebarOverlay = e.target.closest("#sidebar-overlay");
    const sidebar = document.querySelector(".sidebar");

    if (sidebarToggle && sidebar) {
      sidebar.classList.toggle("active");
      const overlay = document.getElementById("sidebar-overlay");
      if (overlay) overlay.classList.toggle("active");
    }

    if (sidebarOverlay && sidebar) {
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
    }
  });
}

function getAvatarHTML(user, className = "avatar-img") {
  if (!user) return "";
  if (
    user.avatar &&
    (user.avatar.startsWith("http") ||
      user.avatar.includes(".") ||
      user.avatar.startsWith("data:image"))
  ) {
    return `<img src="${user.avatar}" class="${className}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" alt="${user.name}">`;
  }
  if (user.avatar && user.avatar.startsWith("<svg")) {
    return user.avatar;
  }
  return getDemoAvatar(user.name);
}

// Common HTML utilities (Navbar / Sidebar headers generator)
function getGlobalNavbarHTML(activePage) {
  const user = db.getCurrentUser();
  const notifs = db.getData("ll_notifications");
  const hasUnread = notifs.some((n) => n.unread);

  let rightSide = "";
  if (user) {
    rightSide = `
      <div class="user-menu-wrapper">
        <div class="notification-bell btn-icon clickable">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          ${hasUnread ? '<div class="bell-badge"></div>' : ""}
        </div>
        <div class="avatar-trigger clickable">${getAvatarHTML(user)}</div>
        <div class="dropdown-menu user-dropdown glass">
          <div class="dropdown-header">Logged in as</div>
          <div class="dropdown-item" style="font-weight:600; color:var(--text-primary); cursor:default; hover:none;">${user.name}</div>
          <div class="dropdown-divider"></div>
          <a href="dashboard.html" class="dropdown-item">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            Dashboard
          </a>
          <a href="profile.html" class="dropdown-item">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            My Profile
          </a>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item text-danger logout-btn" style="color:#ef4444;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </div>
        </div>
        <div class="dropdown-menu notification-dropdown glass" id="notifications-list"></div>
      </div>
    `;
  } else {
    rightSide = `
      <a href="login.html" class="btn btn-secondary">Login</a>
      <a href="register.html" class="btn btn-primary btn-glow">Get Started</a>
    `;
  }

  return `
    <nav class="navbar glass">
      <a href="index.html" class="logo">
        <svg viewBox="0 0 44 24" width="44" height="28" fill="none" style="flex-shrink:0;">
          <circle cx="14" cy="12" r="8" stroke="var(--logo-purple)" stroke-width="3.5" />
          <circle cx="27" cy="12" r="8" stroke="var(--logo-grey)" stroke-width="3.5" stroke-opacity="0.9" />
        </svg>
        <span>Learnova</span>
      </a>
      <ul class="nav-links">
        <li><a href="index.html" class="nav-link ${activePage === "landing" ? "active" : ""}">Home</a></li>
        <li><a href="explore.html" class="nav-link ${activePage === "explore" ? "active" : ""}">Explore Skills</a></li>
        ${user ? `<li><a href="dashboard.html" class="nav-link ${activePage === "dashboard" ? "active" : ""}">Dashboard</a></li>` : ""}
      </ul>
      <div class="nav-actions">
        <button class="btn btn-icon theme-toggle clickable" aria-label="Toggle Theme">${getMoonIcon()}</button>
        ${rightSide}
        <button class="mobile-nav-toggle clickable" aria-label="Open Menu">&#9776;</button>
      </div>
    </nav>
  `;
}

function getSidebarHTML(activePage) {
  const user = db.getCurrentUser();
  if (!user) return "";
  const isCollapsed = localStorage.getItem("ll_sidebar_collapsed") === "true";
  return `
    <!-- Mobile Header Bar -->
    <div class="mobile-header-bar">
      <button class="mobile-sidebar-toggle" id="mobile-sidebar-toggle" aria-label="Toggle Sidebar">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <div class="mobile-logo-text">Learnova</div>
      <div class="mobile-avatar-wrap">${getAvatarHTML(user)}</div>
    </div>
    
    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}">
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-logo">
          <svg viewBox="0 0 44 24" width="44" height="28" fill="none" style="flex-shrink:0;">
            <circle cx="14" cy="12" r="8" stroke="var(--logo-purple)" stroke-width="3.5" />
            <circle cx="27" cy="12" r="8" stroke="var(--logo-grey)" stroke-width="3.5" stroke-opacity="0.9" />
          </svg>
          <span class="logo-name">Learnova</span>
        </a>
        <button class="sidebar-collapse-btn" id="desktop-sidebar-collapse-btn" aria-label="Collapse Sidebar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
      </div>
      <ul class="sidebar-menu">
        <li class="sidebar-item ${activePage === "dashboard" ? "active" : ""}">
          <a href="dashboard.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            <span>Dashboard</span>
          </a>
        </li>
        <li class="sidebar-item ${activePage === "feed" ? "active" : ""}">
          <a href="feed.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Community Feed</span>
          </a>
        </li>
        <li class="sidebar-item ${activePage === "explore" ? "active" : ""}">
          <a href="explore.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Find Partners</span>
          </a>
        </li>
        <li class="sidebar-item ${activePage === "requests" ? "active" : ""}">
          <a href="requests.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>Requests & Calendar</span>
          </a>
        </li>
        <li class="sidebar-item ${activePage === "chat" ? "active" : ""}">
          <a href="chat.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span>Messaging</span>
          </a>
        </li>
        <li class="sidebar-item ${activePage === "profile" ? "active" : ""}">
          <a href="profile.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span>My Profile</span>
          </a>
        </li>
      </ul>
      <div class="sidebar-footer" style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:8px;">
        <a href="profile.html" class="sidebar-user" style="display:flex; align-items:center; gap:12px; text-decoration:none; flex-grow:1; min-width:0;">
          <div class="sidebar-user-avatar" style="flex-shrink:0;">${getAvatarHTML(user)}</div>
          <div class="sidebar-user-info user-details" style="display:flex; flex-direction:column; overflow:hidden;">
            <span class="sidebar-user-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:600; color:var(--text-primary); font-size:13.5px;">${user.name}</span>
            <span class="sidebar-user-role" style="font-size:11.5px; color:var(--text-muted);">View Profile</span>
          </div>
        </a>
        <button class="btn btn-icon theme-toggle clickable" aria-label="Toggle Theme" style="flex-shrink:0;">${getSunIcon()}</button>
      </div>
    </aside>
  `;
}

function getDemoAvatar(name) {
  const init = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4F46E5"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g)"/><text x="50" y="58" font-size="28" font-weight="700" fill="#FFF" text-anchor="middle">${init}</text></svg>`;
}

// Redirect if unauthenticated
function forceAuth() {
  const user = db.getCurrentUser();
  if (!user) {
    window.location.href =
      "login.html?redirect=" + encodeURIComponent(window.location.pathname);
  } else {
    db.fetchActualUsers();
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".logout-btn")) {
    db.logout();
  }

  // Collapse sidebar toggle click
  const collapseBtn = e.target.closest("#desktop-sidebar-collapse-btn");
  if (collapseBtn) {
    const layout = document.querySelector(".dashboard-layout");
    const sidebar = document.querySelector(".sidebar");
    if (layout && sidebar) {
      const isCollapsed = layout.classList.toggle("sidebar-collapsed");
      sidebar.classList.toggle("collapsed");
      localStorage.setItem("ll_sidebar_collapsed", isCollapsed ? "true" : "false");
    }
  }

  // Mobile sidebar toggle click
  const mobileToggleBtn = e.target.closest("#mobile-sidebar-toggle");
  if (mobileToggleBtn) {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector("#sidebar-overlay");
    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
  }

  // Close sidebar when clicking overlay
  if (e.target.closest("#sidebar-overlay")) {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector("#sidebar-overlay");
    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
  }
});
