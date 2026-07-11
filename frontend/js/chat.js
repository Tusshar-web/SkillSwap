// LearnLoop Direct Messaging Logic
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

SocketService.connectSocket(token);

let activePartnerId = null;

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

// function initializeConversations() {
//   const container = document.getElementById("convs-list-container");
//   if (!container) return;

//   const currentUser = db.getCurrentUser();
//   const requests = db.getData("ll_requests");
//   const allUsers = db.getData("ll_users");
//   const chats = db.getData("ll_chats");

//   const matchedPartners = [];
//   requests.forEach(r => {
//     if (r.status === "Accepted") {
//       const pId = r.senderId === currentUser.id ? r.receiverId : r.senderId;
//       const partnerObj = allUsers.find(u => u.id === pId);
//       if (partnerObj && !matchedPartners.some(p => p.partner_id === partnerObj.id)) {
//         matchedPartners.push(partnerObj);
//       }
//     }
//   });

//   matchedPartners.forEach(p => {
//     if (!chats.some(c => c.partnerId === p.partner_id)) {
//       const curFirstName = (currentUser && currentUser.name) ? currentUser.name.split(" ")[0] : "there";
//       chats.push({
//         id: "chat-" + p.partner_id,
//         partnerId: p.partner_id,
//         messages: [
//           { sender: p.partner_id, text: `Hi ${curFirstName}! Ready to exchange our skills? Let me know when you'd like to talk.`, time: "Yesterday", status: "read" }
//         ]
//       });
//     }
//   });
//   db.saveData("ll_chats", chats);

//   renderConversationsSidebar(matchedPartners);
// }

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
      <div class="conv-item ${isActive}" data-id="${p.partner_id}">
        <div class="conv-avatar online">${getAvatarHTML(p)}</div>
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
      const partnerId = item.getAttribute("data-id");
      selectConversation(p.request_id, p.partner_id, p.partner_name);
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

function selectConversation(partnerId) {
  activePartnerId = partnerId;

  document.querySelectorAll(".conv-item").forEach((item) => {
    if (item.getAttribute("data-id") === partnerId) {
      item.classList.add("active");
      const dot = item.querySelector(".conv-unread-dot");
      if (dot) dot.remove();
    } else {
      item.classList.remove("active");
    }
  });

  const emptyState = document.getElementById("chat-empty-state");
  const activePanel = document.getElementById("chat-active-panel");
  if (emptyState && activePanel) {
    emptyState.style.display = "none";
    activePanel.style.display = "flex";
  }

  const users = db.getData("ll_users");
  const partner = users.find((u) => u.id === partnerId);
  if (!partner) return;

  document.getElementById("active-partner-avatar").innerHTML =
    getAvatarHTML(partner);
  document.getElementById("active-partner-name").textContent = partner.name;

  const chats = db.getData("ll_chats");
  const cRecord = chats.find((c) => c.partnerId === partnerId);
  if (cRecord) {
    cRecord.messages.forEach((m) => {
      if (m.sender === partnerId) m.status = "read";
    });
    db.saveData("ll_chats", chats);
  }

  renderMessagesThread();
}

function renderMessagesThread() {
  const box = document.getElementById("chat-messages-box");
  if (!box || !activePartnerId) return;

  const chats = db.getData("ll_chats");
  const cRecord = chats.find((c) => c.partnerId === activePartnerId);

  if (!cRecord) return;

  box.innerHTML = "";
  cRecord.messages.forEach((m) => {
    const isMe = m.sender === "current-user";

    let receipt = "";
    if (isMe) {
      receipt =
        m.status === "read"
          ? `<svg width="12" height="12" fill="none" class="receipt-icon" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7M5 5l7 7-7 7"/></svg>`
          : `<svg width="12" height="12" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    }

    let textHTML = m.text;
    if (m.text.startsWith("[FILE]")) {
      const fileName = m.text.replace("[FILE]", "");
      textHTML = `
        <div style="display:flex; align-items:center; gap:10px; background:rgba(0,0,0,0.1); padding:10px; border-radius:8px; border:1px solid var(--border-color);">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--cyan);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style="font-weight:600; font-size:13px;">${fileName}</span>
        </div>
      `;
    }

    box.innerHTML += `
      <div class="message-group ${isMe ? "me" : "partner"}">
        <div class="message-bubble">${textHTML}</div>
        <div class="message-meta">
          <span>${m.time}</span>
          ${receipt}
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
      const val = input.value.trim();
      if (!val || !activePartnerId) return;

      const chats = db.getData("ll_chats");
      let cRecord = chats.find((c) => c.partnerId === activePartnerId);

      // Defensive check: create record if it does not exist
      if (!cRecord) {
        cRecord = {
          id: "chat-" + activePartnerId,
          partnerId: activePartnerId,
          messages: [],
        };
        chats.push(cRecord);
      }

      const msgTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newMsg = {
        sender: "current-user",
        text: val,
        time: msgTime,
        status: "sent",
      };

      cRecord.messages.push(newMsg);
      db.saveData("ll_chats", chats);

      input.value = "";
      renderMessagesThread();

      const users = db.getData("ll_users");
      const matchedPartners = [];
      const currentUser = db.getCurrentUser();
      const currentUserId = currentUser ? currentUser.id : "";
      db.getData("ll_requests").forEach((r) => {
        if (r.status === "Accepted") {
          const pId = r.senderId === currentUserId ? r.receiverId : r.senderId;
          const partnerObj = users.find((u) => u.id === pId);
          if (
            partnerObj &&
            !matchedPartners.some((p) => p.partner_id === partnerObj.id)
          ) {
            matchedPartners.push(partnerObj);
          }
        }
      });
      renderConversationsSidebar(matchedPartners);

      triggerBotReply(activePartnerId, val);
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

function triggerBotReply(partnerId, userMessageText) {
  const delayStart = 1500;
  const typingDuration = 2500;

  const users = db.getData("ll_users");
  const partner = users.find((u) => u.id === partnerId);
  const pName = partner && partner.name ? partner.name.split(" ")[0] : "Elena";

  setTimeout(() => {
    const typingBox = document.getElementById("typing-indicator");
    const typingUser = document.getElementById("typing-username");

    if (typingBox && activePartnerId === partnerId) {
      typingUser.textContent = pName;
      typingBox.style.display = "flex";

      const threadBox = document.getElementById("chat-messages-box");
      if (threadBox) threadBox.scrollTop = threadBox.scrollHeight;
    }

    setTimeout(() => {
      if (typingBox) typingBox.style.display = "none";

      const chats = db.getData("ll_chats");
      const cRecord = chats.find((c) => c.partnerId === partnerId);
      if (!cRecord) return;

      let replyText = `That sounds really interesting! Let's arrange a time in the calendar to detail this out.`;

      const textLower = userMessageText.toLowerCase();
      if (
        textLower.includes("hello") ||
        textLower.includes("hi") ||
        textLower.includes("hey")
      ) {
        replyText = `Hey there! How's your week going? Ready for our skill exchange session?`;
      } else if (
        textLower.includes("time") ||
        textLower.includes("schedule") ||
        textLower.includes("calendar")
      ) {
        replyText = `Sure! Select an empty slot on the Calendar tab tomorrow and I'll confirm it right away.`;
      } else if (
        textLower.includes("teach") ||
        textLower.includes("learn") ||
        textLower.includes("skill")
      ) {
        replyText = `I can definitely walk you through my workflow. Can't wait to learn from your side too!`;
      } else if (
        textLower.includes("file") ||
        textLower.includes("attachment") ||
        textLower.includes("pdf")
      ) {
        replyText = `Thanks for sending the resource. I'll read through it before we catch up!`;
      }

      const msgTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      cRecord.messages.push({
        sender: partnerId,
        text: replyText,
        time: msgTime,
        status: activePartnerId === partnerId ? "read" : "unread",
      });
      db.saveData("ll_chats", chats);

      if (activePartnerId === partnerId) {
        cRecord.messages.forEach((m) => {
          if (m.sender === "current-user") m.status = "read";
        });
        db.saveData("ll_chats", chats);
        renderMessagesThread();
      } else {
        const partnerNameStr = partner ? partner.name : "Partner";
        showToast(
          `New message from ${partnerNameStr}: "${replyText.substring(0, 30)}..."`,
          "info",
        );
      }

      const matchedPartners = [];
      const currentUser = db.getCurrentUser();
      const currentUserId = currentUser ? currentUser.id : "";
      db.getData("ll_requests").forEach((r) => {
        if (r.status === "Accepted") {
          const pId = r.senderId === currentUserId ? r.receiverId : r.senderId;
          const partnerObj = users.find((u) => u.id === pId);
          if (
            partnerObj &&
            !matchedPartners.some((p) => p.partner_id === partnerObj.id)
          ) {
            matchedPartners.push(partnerObj);
          }
        }
      });
      renderConversationsSidebar(matchedPartners);
    }, typingDuration);
  }, delayStart);
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

function setupAttachment() {
  const btn = document.getElementById("attach-file-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!activePartnerId) return;

    const chats = db.getData("ll_chats");
    const cRecord = chats.find((c) => c.partnerId === activePartnerId);
    if (!cRecord) return;

    const fileNames = [
      "Figma_Design_System_Wireframes.pdf",
      "Python_Basics_StudyGuide.zip",
      "SkillBarter_Notes_LearnLoop.docx",
    ];
    const randFile = fileNames[Math.floor(Math.random() * fileNames.length)];

    const msgTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    cRecord.messages.push({
      sender: "current-user",
      text: "[FILE]" + randFile,
      time: msgTime,
      status: "sent",
    });
    db.saveData("ll_chats", chats);

    renderMessagesThread();
    showToast(
      `Simulated Upload: "${randFile}" shared successfully!`,
      "success",
    );

    triggerBotReply(activePartnerId, "file shared");
  });
}
