let activePartnerId = null;
let activeRequestId = null;
let onlineUserIds = new Set();
let globalPartnersList = [];
// Learnova Direct Messaging Logic
const token = sessionStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

SocketService.connectSocket(token);
const chatSocket = SocketService.getSocket();

chatSocket.on("newMessage", (msg) => {
  const partner = globalPartnersList.find(p => p.request_id == msg.request_id);
  if (partner) {
    partner.last_message = msg.message;
    partner.last_message_time = msg.created_at || new Date().toISOString();
    
    const currentUser = db.getCurrentUser();
    let myId = null;
    if (currentUser) {
        myId = currentUser.backendId || currentUser.id;
        if (typeof myId === "string" && myId.startsWith("user-")) myId = parseInt(myId.split("-")[1]);
    }
    
    if (msg.request_id != activeRequestId && msg.receiver_id == myId) {
      partner.unread_count = (partner.unread_count || 0) + 1;
    }
    renderConversationsSidebar(globalPartnersList);
  }

  if (msg.request_id != activeRequestId) return;
  appendMessage(msg);
});

chatSocket.on("errorMessage", (msg) => {
  console.error("Chat error:", msg);
  showToast(msg, "error");
});

chatSocket.on("userStatusChange", (data) => {
  if (data.isOnline) {
    onlineUserIds.add(String(data.userId));
  } else {
    onlineUserIds.delete(String(data.userId));
  }
  renderConversationsSidebar(globalPartnersList);
  
  if (String(activePartnerId) === String(data.userId)) {
     const statusEl = document.getElementById("active-chat-status");
     if (statusEl) {
        if (data.isOnline) {
          statusEl.innerHTML = `<span class="status-indicator"></span> Online`;
          statusEl.style.opacity = "1";
        } else {
          statusEl.innerHTML = `<span class="status-indicator" style="background:#6b7280;box-shadow:none;"></span> Offline`;
          statusEl.style.opacity = "0.7";
        }
     }
  }
});

chatSocket.emit("getOnlineUsers", (users) => {
  if (users && Array.isArray(users)) {
    users.forEach(u => onlineUserIds.add(String(u)));
    renderConversationsSidebar(globalPartnersList);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  forceAuth();

  const user = db.getCurrentUser();
  if (!user) return;

  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    sidebarContainer.innerHTML = getSidebarHTML("chat");
    setupTheme();
  }

  if (typeof clearPageNotifications === "function") {
    setTimeout(() => clearPageNotifications("chat"), 200);
  }

  initializeConversations();
  setupChatInputs();
  setupEmojiDrawer();
  setupAttachment();

  const params = new URLSearchParams(window.location.search);
  const pId = params.get("partner");
  if (pId) {
    selectConversation(pId);
  }
});

async function initializeConversations() {
  try {
    const conversations = await ChatAPI.getConversations();
    globalPartnersList = conversations;
    renderConversationsSidebar(conversations);
  } catch (err) {
    console.error(err);
  }
}

function renderConversationsSidebar(partnersList) {
  const container = document.getElementById("convs-list-container");
  if (!container) return;

  const chats = db.getData("ll_chats");
  const searchQuery = document
    .getElementById("chat-search")
    .value.toLowerCase();

  const list = partnersList.filter((p) =>
    p.partner_name.toLowerCase().includes(searchQuery),
  );

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size:13px;">
        No active matches found. Match on the Explore page!
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  const allUsers = db.getData("ll_users") || [];
  list.forEach((p) => {
    const partnerUser = allUsers.find(u => u.backendId == p.partner_id || u.id == p.partner_id || u.id === `user-${p.partner_id}`) || { name: p.partner_name };
    
    const snippet = p.last_message ? p.last_message : "Click to start chatting";
    let time = "";
    if (p.last_message_time) {
       const d = new Date(p.last_message_time);
       time = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    const unreadCount = p.unread_count || 0;
    const isActive = p.partner_id === activePartnerId ? "active" : "";

    const isOnline = onlineUserIds.has(String(p.partner_id));
    const onlineClass = isOnline ? "online" : "";
    
    container.innerHTML += `
      <div
class="conv-item ${isActive}"
data-request-id="${p.request_id}"
data-partner-id="${p.partner_id}"
data-partner-name="${p.partner_name}">        
<div class="conv-avatar ${onlineClass}">${getAvatarHTML(partnerUser)}</div>
        <div class="conv-details">
          <div class="conv-name-row">
            <span class="conv-name">${p.partner_name}</span>
            <span class="conv-time">${time}</span>
          </div>
          <div class="conv-msg-row">
            <span class="conv-snippet">${snippet}</span>
            ${unreadCount > 0 ? `<span class="conv-unread-dot"></span>` : ""}
          </div>
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".conv-item").forEach((item) => {
    item.addEventListener("click", () => {
      const requestId = item.dataset.requestId;
      const partnerId = item.dataset.partnerId;
      const partnerName = item.dataset.partnerName;
      selectConversation(requestId, partnerId, partnerName);
    });
  });

  const searchInput = document.getElementById("chat-search");
  if (searchInput && !searchInput.dataset.wired) {
    searchInput.dataset.wired = "true";
    searchInput.addEventListener("input", () => {
      renderConversationsSidebar(partnersList);
    });
  }
}

async function selectConversation(requestId, partnerId, partnerName) {
  activePartnerId = partnerId;
  activeRequestId = requestId;

  const allUsers = db.getData("ll_users") || [];
  const partnerUser = allUsers.find(u => u.backendId == partnerId || u.id == partnerId || u.id === `user-${partnerId}`) || { name: partnerName };

  document.getElementById("active-partner-name").textContent = partnerName;
  document.getElementById("active-partner-avatar").innerHTML = getAvatarHTML(partnerUser);
  document.getElementById("chat-empty-state").style.display = "none";
  document.getElementById("chat-active-panel").style.display = "flex";

  const statusEl = document.getElementById("active-chat-status");
  if (statusEl) {
    if (onlineUserIds.has(String(partnerId))) {
      statusEl.innerHTML = `<span class="status-indicator"></span> Online`;
      statusEl.style.opacity = "1";
    } else {
      statusEl.innerHTML = `<span class="status-indicator" style="background:#6b7280;box-shadow:none;"></span> Offline`;
      statusEl.style.opacity = "0.7";
    }
  }

  const socket = SocketService.getSocket();

  socket.emit("joinRoom", requestId);

  await loadMessages(requestId);
  
  const partner = globalPartnersList.find(p => p.request_id == requestId);
  if (partner && partner.unread_count > 0) {
      partner.unread_count = 0;
      renderConversationsSidebar(globalPartnersList);
  }
}

async function loadMessages(requestId) {
  const token = sessionStorage.getItem("token");

  const response = await fetch(`${window.CONFIG.API_URL}/chat/${requestId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data.message);
    return;
  }

  renderMessages(data.messages);
}

function renderMessages(messages) {
  const box = document.getElementById("chat-messages-box");

  box.innerHTML = "";

const currentUser = db.getCurrentUser();

  messages.forEach((msg) => {
    const mine = msg.sender_id === currentUser.backendId;

    box.innerHTML += `
            <div class="message-group ${mine ? "me" : "partner"}">

                <div class="message-bubble">
                    ${msg.message}
                </div>

            </div>
        `;
  });

  box.scrollTop = box.scrollHeight;
}

function setupChatInputs() {
  const input = document.getElementById("chat-message-input");
  const sendBtn = document.getElementById("send-msg-btn");

  if (!input || !sendBtn) return;

  const sendMessage = () => {
    try {
      if (!activeRequestId) return;

      const message = input.value.trim();

      if (!message) return;

      chatSocket.emit("sendMessage", {
        requestId: activeRequestId,
        message,
      });

      input.value = "";
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

// Emoji Drawer functions
function setupEmojiDrawer() {
  const btn = document.getElementById("emoji-btn");
  const drawer = document.getElementById("emoji-drawer");
  const input = document.getElementById("chat-message-input");

  if (!btn || !drawer) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    drawer.classList.toggle("active");
  });

  window.addEventListener("click", () => {
    drawer.classList.remove("active");
  });

  drawer.querySelectorAll("span").forEach((em) => {
    em.addEventListener("click", () => {
      input.value += em.textContent;
      input.focus();
      drawer.classList.remove("active");
    });
  });
}

function appendMessage(msg) {
  const box = document.getElementById("chat-messages-box");

 const currentUser = db.getCurrentUser();
  const mine = msg.sender_id === currentUser.backendId;

  box.innerHTML += `
        <div class="message-group ${mine ? "me" : "partner"}">

            <div class="message-bubble">
                ${msg.message}
            </div>

        </div>
    `;

  box.scrollTop = box.scrollHeight;
}

function setupAttachment() {
  const attachBtn = document.getElementById("attach-file-btn");
  if (!attachBtn) return;

  attachBtn.addEventListener("click", () => {
    if (!activeRequestId) return;

    const fakeFileNames = ["notes.pdf", "diagram.png", "summary.docx", "resource.zip"];
    const randFile = fakeFileNames[Math.floor(Math.random() * fakeFileNames.length)];

    chatSocket.emit("sendMessage", {
      requestId: activeRequestId,
      message: "[FILE]" + randFile,
    });
  });
}
