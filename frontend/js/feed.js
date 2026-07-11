// LearnLoop Dedicated Community Feed Logic
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
    sidebarContainer.innerHTML = getSidebarHTML("feed");
    setupTheme();
  }

  // Render initial community posts list
  renderActivityFeed();

  // Setup quick post trigger & modal handlers
  setupPostModalEvents();
});

function renderActivityFeed() {
  const container = document.getElementById("activity-feed-container");
  if (!container) return;

  const posts = db.getData("ll_posts");
  const currentUser = db.getCurrentUser();

  // Load avatar in quick share box
  const quickShareAvatar = document.getElementById("quick-share-avatar-placeholder");
  if (quickShareAvatar) {
    quickShareAvatar.innerHTML = getAvatarHTML(currentUser);
  }

  if (posts.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 30px 0; text-align:center;"><p>No activity posts shared yet. Share your first learning moment!</p></div>`;
    return;
  }

  container.innerHTML = "";
  posts.forEach(post => {
    // Check if current user liked this post
    const isLiked = post.likedBy && post.likedBy.includes(currentUser.id);
    const likeBtnClass = isLiked ? "btn-post-action liked" : "btn-post-action";
    
    // Draw SVG illustrations dynamically based on templates
    let photoSVG = "";
    if (post.photoType === "study") {
      photoSVG = getStudySetupSVG();
    } else if (post.photoType === "certificate") {
      photoSVG = getCertificateSVG();
    } else if (post.photoType === "whiteboard") {
      photoSVG = getWhiteboardSVG();
    } else {
      photoSVG = getWorkspaceSVG();
    }

    // Support rendering image tag if avatar is custom URL, else render SVGs
    let authorAvatarHTML = "";
    if (post.authorAvatar && (post.authorAvatar.startsWith("http") || post.authorAvatar.includes(".") || post.authorAvatar.startsWith("data:image"))) {
      authorAvatarHTML = `<img src="${post.authorAvatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" alt="${post.authorName}">`;
    } else {
      authorAvatarHTML = post.authorAvatar || getDemoAvatar(post.authorName);
    }

    container.innerHTML += `
      <div class="activity-post-card">
        <div class="post-header">
          <div class="post-author-avatar">${authorAvatarHTML}</div>
          <div class="post-author-details">
            <div class="post-author-name">${post.authorName}</div>
            <div class="post-author-headline">${post.authorHeadline || 'LearnLoop Member'}</div>
          </div>
          <span class="post-time">${post.timestamp}</span>
        </div>
        
        <p class="post-caption-text">${post.caption}</p>
        
        <!-- Attached Visual Photo block -->
        <div class="post-photo-box photo-${post.photoType}">
          ${photoSVG}
        </div>
        
        <div class="post-reactions-row">
          <div class="likes-indicator">
            <span>👍</span> <strong class="likes-cnt-lbl">${post.likes} likes</strong>
          </div>
          <div class="comments-indicator">0 comments</div>
        </div>
        
        <div class="post-actions-row">
          <button class="${likeBtnClass}" data-id="${post.id}">
            <span style="font-size:14px;">👍</span> Like
          </button>
          <button class="btn-post-action comment-post-trigger" data-id="${post.id}">
            <span style="font-size:14px;">💬</span> Comment
          </button>
        </div>
      </div>
    `;
  });

  // Attach interactive like listeners
  document.querySelectorAll(".activity-post-card .btn-post-action:not(.comment-post-trigger)").forEach(btn => {
    btn.addEventListener("click", () => {
      const postId = btn.getAttribute("data-id");
      togglePostLike(postId);
    });
  });

  // Attach comment triggers (Simple simulation)
  document.querySelectorAll(".comment-post-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      showToast("Comments section simulation! Commenting is enabled in full deployment.", "info");
    });
  });
}

function togglePostLike(postId) {
  const posts = db.getData("ll_posts");
  const currentUser = db.getCurrentUser();
  const post = posts.find(p => p.id === postId);
  
  if (!post) return;

  if (!post.likedBy) post.likedBy = [];

  const idx = post.likedBy.indexOf(currentUser.id);
  if (idx === -1) {
    post.likes = (post.likes || 0) + 1;
    post.likedBy.push(currentUser.id);
  } else {
    post.likes = Math.max((post.likes || 1) - 1, 0);
    post.likedBy.splice(idx, 1);
  }

  db.saveData("ll_posts", posts);
  renderActivityFeed();
}

function setupPostModalEvents() {
  const modal = document.getElementById("share-post-modal");
  const closeBtn = document.getElementById("close-post-modal");
  const cancelBtn = document.getElementById("cancel-post-modal");
  const form = document.getElementById("share-post-form");

  const quickShareBox = document.getElementById("quick-share-trigger-box");

  if (!modal) return;

  const openModal = () => {
    document.getElementById("post-caption").value = "";
    modal.classList.add("active");
  };

  const closeModal = () => modal.classList.remove("active");

  if (quickShareBox) quickShareBox.addEventListener("click", openModal);

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Wire photo template select highlights
  const options = document.querySelectorAll(".photo-option");
  options.forEach(opt => {
    opt.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      opt.querySelector("input").checked = true;
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const caption = document.getElementById("post-caption").value.trim();
    const photoType = document.querySelector('input[name="photo-template-select"]:checked').value;

    const currentUser = db.getCurrentUser();
    const posts = db.getData("ll_posts");

    const newPost = {
      id: "post-" + Date.now(),
      authorName: currentUser.name,
      authorHeadline: currentUser.headline || "LearnLoop Barter Member",
      authorAvatar: currentUser.avatar,
      caption: caption,
      photoType: photoType,
      timestamp: "Just now",
      likes: 0,
      likedBy: []
    };

    posts.unshift(newPost);
    db.saveData("ll_posts", posts);

    closeModal();
    renderActivityFeed();
    showToast("Post shared to community feed successfully!", "success");
  });
}

// ----------------------------------------------------
// VECTOR SVG TEMPLATES FOR PHOTO SHARING POSTS
// ----------------------------------------------------

function getStudySetupSVG() {
  return `
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="100" r="80" fill="#a78bfa" fill-opacity="0.15" filter="blur(20px)" />
      <rect x="130" y="80" width="36" height="50" rx="8" fill="#ec4899" fill-opacity="0.8" />
      <path d="M166 90 C176 90 176 112 166 112" stroke="#ec4899" stroke-width="4" stroke-linecap="round" />
      <path d="M142 66 C144 60 148 60 146 52" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" />
      <path d="M148 66 C150 62 154 62 152 56" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" />
      <rect x="180" y="110" width="100" height="24" rx="4" fill="#374151" stroke="#4b5563" stroke-width="2" />
      <rect x="188" y="116" width="12" height="12" rx="2" fill="#6b7280" />
      <rect x="204" y="116" width="12" height="12" rx="2" fill="#6b7280" />
      <rect x="220" y="116" width="32" height="12" rx="2" fill="#6b7280" />
      <rect x="256" y="116" width="12" height="12" rx="2" fill="#6b7280" />
      <path d="M210 60 L270 50 L270 90 L210 100 Z" fill="#4f46e5" />
      <path d="M210 60 L210 100" stroke="#818cf8" stroke-width="3" />
      <line x1="220" y1="68" x2="260" y2="58" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5" />
      <line x1="220" y1="78" x2="260" y2="68" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5" />
      <text x="200" y="170" fill="#a78bfa" font-family="Outfit" font-size="14" font-weight="700" text-anchor="middle">☕ STUDY SETUP MOMENT</text>
    </svg>
  `;
}

function getCertificateSVG() {
  return `
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="100" r="70" fill="#14b8a6" fill-opacity="0.15" filter="blur(20px)" />
      <rect x="120" y="40" width="160" height="110" rx="8" fill="#1f2937" stroke="#10b981" stroke-width="2" />
      <rect x="130" y="50" width="140" height="90" fill="none" stroke="#374151" stroke-dasharray="4,4" />
      <line x1="150" y1="70" x2="250" y2="70" stroke="#374151" stroke-width="3" stroke-linecap="round" />
      <line x1="160" y1="85" x2="240" y2="85" stroke="#10b981" stroke-width="2" stroke-linecap="round" />
      <line x1="148" y1="100" x2="252" y2="100" stroke="#374151" stroke-width="2" stroke-linecap="round" />
      <line x1="170" y1="112" x2="230" y2="112" stroke="#374151" stroke-width="2" stroke-linecap="round" />
      <circle cx="200" cy="128" r="14" fill="#fbbf24" />
      <polygon points="196,134 192,152 200,146 208,152 204,134" fill="#f59e0b" />
      <text x="200" y="180" fill="#14b8a6" font-family="Outfit" font-size="14" font-weight="700" text-anchor="middle">🏆 EXCHANGER BADGE EARNED</text>
    </svg>
  `;
}

function getWhiteboardSVG() {
  return `
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="100" r="70" fill="#06b6d4" fill-opacity="0.15" filter="blur(20px)" />
      <rect x="110" y="40" width="180" height="110" rx="6" fill="#1e293b" stroke="#475569" stroke-width="3" />
      <rect x="130" y="60" width="40" height="24" rx="4" fill="none" stroke="#06b6d4" stroke-width="2" />
      <text x="150" y="76" font-family="Outfit" font-size="9" fill="#06b6d4" font-weight="700" text-anchor="middle">TEACH</text>
      <rect x="230" y="60" width="40" height="24" rx="4" fill="none" stroke="#ec4899" stroke-width="2" />
      <text x="250" y="76" font-family="Outfit" font-size="9" fill="#ec4899" font-weight="700" text-anchor="middle">LEARN</text>
      <path d="M180 72 L220 72" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-dasharray="3,3" />
      <polygon points="220,72 214,68 214,76" fill="#94a3b8" />
      <rect x="180" y="106" width="40" height="24" rx="4" fill="var(--grad-primary)" />
      <text x="200" y="122" font-family="Outfit" font-size="9" fill="#FFF" font-weight="700" text-anchor="middle">GROW</text>
      <path d="M150 90 L150 118 L172 118" stroke="#94a3b8" stroke-width="2" fill="none" />
      <path d="M250 90 L250 118 L228 118" stroke="#94a3b8" stroke-width="2" fill="none" />
      <text x="200" y="180" fill="#06b6d4" font-family="Outfit" font-size="14" font-weight="700" text-anchor="middle">📊 WHITEBOARD BARTER FLOW</text>
    </svg>
  `;
}

function getWorkspaceSVG() {
  return `
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="100" r="70" fill="#8b5cf6" fill-opacity="0.15" filter="blur(20px)" />
      <line x1="80" y1="135" x2="320" y2="135" stroke="#4b5563" stroke-width="4" stroke-linecap="round" />
      <rect x="150" y="60" width="100" height="60" rx="6" fill="#1f2937" stroke="#6b7280" stroke-width="2.5" />
      <rect x="156" y="66" width="88" height="48" fill="#111827" />
      <line x1="166" y1="76" x2="196" y2="76" stroke="#10b981" stroke-width="2" stroke-linecap="round" />
      <line x1="166" y1="84" x2="216" y2="84" stroke="#818cf8" stroke-width="2" stroke-linecap="round" />
      <line x1="176" y1="92" x2="206" y2="92" stroke="#f472b6" stroke-width="2" stroke-linecap="round" />
      <path d="M190 120 L210 120 L206 135 L194 135 Z" fill="#4b5563" />
      <rect x="180" y="132" width="40" height="4" rx="2" fill="#374151" />
      <rect x="270" y="112" width="16" height="23" rx="2" fill="#d97706" />
      <path d="M266 112 C262 102 274 95 274 95 C274 95 286 102 282 112 Z" fill="#059669" />
      <path d="M120 135 L120 100 L135 100" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M128 102 L142 90 L148 98 L134 110 Z" fill="#f59e0b" />
      <polygon points="138,102 180,135 145,135" fill="#fef08a" fill-opacity="0.15" />
      <text x="200" y="175" fill="#8b5cf6" font-family="Outfit" font-size="14" font-weight="700" text-anchor="middle">💻 WORKSTATION FLOW</text>
    </svg>
  `;
}
