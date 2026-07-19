let activePartnerId = null;
let activeRequestId = null;
// Learnova Direct Messaging Logic
const token = sessionStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

SocketService.connectSocket(token);
const chatSocket = SocketService.getSocket();

chatSocket.on("newMessage", (msg) => {
  if (msg.request_id != activeRequestId) return;
  appendMessage(msg);
});

chatSocket.on("errorMessage", (msg) => {
  console.error("Chat error:", msg);
  showToast(msg, "error");
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
  list.forEach((p) => {
    const cRecord = chats.find((c) => c.partnerId === p.partner_id);
    const lastMsgObj = cRecord
      ? cRecord.messages[cRecord.messages.length - 1]
      : null;
    const snippet = lastMsgObj ? lastMsgObj.text : "Click to start chatting";
    const time = lastMsgObj ? lastMsgObj.time : "";

    const unreadCount = cRecord
      ? cRecord.messages.filter(
          (m) => m.sender === p.partner_id && m.status === "unread",
        ).length
      : 0;
    const isActive = p.partner_id === activePartnerId ? "active" : "";

    container.innerHTML += `
      <div
class="conv-item ${isActive}"
data-request-id="${p.request_id}"
data-partner-id="${p.partner_id}"
data-partner-name="${p.partner_name}">        
<div class="conv-avatar online">${getAvatarHTML({ name: p.partner_name })}</div>
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

  document.getElementById("active-partner-name").textContent = partnerName;
  document.getElementById("active-partner-avatar").innerHTML = getAvatarHTML({
    name: partnerName,
  });
  document.getElementById("chat-empty-state").style.display = "none";
  document.getElementById("chat-active-panel").style.display = "flex";

  const socket = SocketService.getSocket();

  socket.emit("joinRoom", requestId);

  await loadMessages(requestId);
}

async function loadMessages(requestId) {
  const token = sessionStorage.getItem("token");

  const response = await fetch(`http://localhost:5009/api/chat/${requestId}`, {
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
