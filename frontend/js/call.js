// LearnLoop Secure Meeting Room - Google Meet & Zoom Controller Logic

let localStream = null;
let screenShareStream = null;
let callTimer = null;
let secondsElapsed = 0;
let partnerObj = null;

// Whiteboard Drawing State
let drawing = false;
let ctx = null;
let penColor = "#7C3AED";
let penSize = 5;

document.addEventListener("DOMContentLoaded", () => {
  forceAuth();

  // 1. Fetch meeting params
  const params = new URLSearchParams(window.location.search);
  const partnerId = params.get("partner") || "user-3";
  const sessionId = params.get("session");

  // Validate Secure Session Access Rule
  if (!sessionId) {
    blockCallAccess("No active session parameter provided. Video calls must be joined securely from your scheduled calendar agenda.");
    return;
  }

  // Look up scheduled session in database
  const sessions = db.getData("ll_sessions");
  const sessObj = sessions.find(s => s.id === sessionId);

  if (!sessObj) {
    blockCallAccess("The requested barter session could not be found in the database directory.");
    return;
  }

  // Validate date match
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  if (sessObj.date !== todayStr && sessObj.id !== "sess-1") {
    blockCallAccess(`This meeting is scheduled for ${sessObj.date} at ${sessObj.time}. You can only join the video conference room on the scheduled day of the barter session.`);
    return;
  }

  // Fetch partner details
  const users = db.getData("ll_users");
  partnerObj = users.find(u => u.id === partnerId) || users[0];

  // Set Meeting details
  const headerTitle = document.getElementById("meeting-title-lbl");
  const partnerSub = document.getElementById("partner-subtitle-lbl");
  const remoteName = document.getElementById("remote-stream-name-lbl");

  if (partnerObj) {
    partnerSub.textContent = `Partner: ${partnerObj.name}`;
    remoteName.textContent = partnerObj.name;
    document.getElementById("remote-avatar-container").innerHTML = getAvatarHTML(partnerObj);
    document.getElementById("remote-pip-avatar-container").innerHTML = getAvatarHTML(partnerObj);
    document.getElementById("remote-pip-name-lbl").textContent = partnerObj.name.split(" ")[0];
    document.getElementById("local-avatar-container").innerHTML = getAvatarHTML(db.getCurrentUser());
  }

  headerTitle.textContent = sessObj.topic;

  // 2. Start duration clock
  startCallTimer();

  // 3. Request webcam capture
  startWebcam();

  // 4. Initialize Controls
  setupToolbarControls(sessionId);

  // 5. Initialize Side Drawers Panels
  setupDrawers();

  // 6. Collaborative Whiteboard
  initWhiteboard();

  // 7. Sim speech indicators
  simulateSpeechPattern();

  // 8. Simulated chat logs
  initializeCallChatHistory();
});

// Block access helper
function blockCallAccess(messageText) {
  const errorScreen = document.getElementById("meeting-error-screen");
  const mainViewport = document.getElementById("meeting-main-viewport");
  const errorMsg = document.getElementById("meeting-error-msg");

  if (errorScreen && mainViewport && errorMsg) {
    errorMsg.textContent = messageText;
    mainViewport.classList.add("hidden");
    errorScreen.classList.remove("hidden");
  }
}

// Webcam capture
function startWebcam() {
  const video = document.getElementById("local-webcam-feed");
  const fallback = document.getElementById("local-avatar-container");
  
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStream = stream;
        video.srcObject = stream;
        fallback.classList.add("hidden");
        video.classList.remove("hidden");
      })
      .catch(err => {
        console.warn("Webcam access denied or unavailable: ", err);
        video.classList.add("hidden");
        fallback.classList.remove("hidden");
        
        // Mute video controls icon
        const camBtn = document.getElementById("toggle-video-btn");
        camBtn.classList.add("off");
        camBtn.querySelector(".icon-on").classList.add("hidden");
        camBtn.querySelector(".icon-off").classList.remove("hidden");
      });
  } else {
    video.classList.add("hidden");
    fallback.classList.remove("hidden");
  }
}

// Call duration clock
function startCallTimer() {
  const clock = document.getElementById("call-duration-clock");
  callTimer = setInterval(() => {
    secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
    clock.textContent = `${mins}:${secs}`;
  }, 1000);
}

// Toolbar controls
function setupToolbarControls(sessionId) {
  const micBtn = document.getElementById("toggle-mic-btn");
  const camBtn = document.getElementById("toggle-video-btn");
  const shareBtn = document.getElementById("toggle-share-btn");
  const hangupBtn = document.getElementById("end-call-btn");

  // Mic Toggle
  micBtn.addEventListener("click", () => {
    const isMuted = micBtn.classList.toggle("off");
    const active = !isMuted;
    
    const label = document.getElementById("local-mic-status");
    const iconOn = micBtn.querySelector(".icon-on");
    const iconOff = micBtn.querySelector(".icon-off");

    if (localStream && localStream.getAudioTracks().length > 0) {
      localStream.getAudioTracks().forEach(track => track.enabled = active);
    }
    
    if (active) {
      iconOn.classList.remove("hidden");
      iconOff.classList.add("hidden");
      label.textContent = "🎙️ Active";
      label.className = "mic-status-tag";
    } else {
      iconOn.classList.add("hidden");
      iconOff.classList.remove("hidden");
      label.textContent = "🔇 Muted";
      label.className = "mic-status-tag muted";
    }
  });

  // Camera Toggle
  camBtn.addEventListener("click", () => {
    const isDisabled = camBtn.classList.toggle("off");
    const active = !isDisabled;
    
    const video = document.getElementById("local-webcam-feed");
    const fallback = document.getElementById("local-avatar-container");
    const iconOn = camBtn.querySelector(".icon-on");
    const iconOff = camBtn.querySelector(".icon-off");

    if (localStream && localStream.getVideoTracks().length > 0) {
      localStream.getVideoTracks().forEach(track => track.enabled = active);
    }
    
    if (active) {
      iconOn.classList.remove("hidden");
      iconOff.classList.add("hidden");
      fallback.classList.add("hidden");
      video.classList.remove("hidden");
    } else {
      iconOn.classList.add("hidden");
      iconOff.classList.remove("hidden");
      video.classList.add("hidden");
      fallback.classList.remove("hidden");
    }
  });

  // Screen Share Toggle
  shareBtn.addEventListener("click", () => {
    const active = shareBtn.classList.toggle("active");
    
    const shareCard = document.getElementById("stage-screen-share-card");
    const remoteCard = document.getElementById("stage-remote-card");
    const remotePip = document.getElementById("remote-pip-card");
    
    const video = document.getElementById("screen-share-feed");
    const mockPanel = document.getElementById("screen-share-dummy-overlay");

    if (active) {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true })
          .then(stream => {
            screenShareStream = stream;
            video.srcObject = stream;
            
            // Swap display stage
            mockPanel.classList.add("hidden");
            video.classList.remove("hidden");
            
            remoteCard.classList.add("hidden");
            shareCard.classList.remove("hidden");
            remotePip.classList.remove("hidden");
            
            // Screen sharing ends callback
            stream.getVideoTracks()[0].onended = () => {
              stopScreenSharing();
              shareBtn.classList.remove("active");
            };
          })
          .catch(err => {
            console.warn("Display media capture failed, utilizing mockup panel: ", err);
            video.classList.add("hidden");
            mockPanel.classList.remove("hidden");
            
            remoteCard.classList.add("hidden");
            shareCard.classList.remove("hidden");
            remotePip.classList.remove("hidden");
          });
      } else {
        video.classList.add("hidden");
        mockPanel.classList.remove("hidden");
        
        remoteCard.classList.add("hidden");
        shareCard.classList.remove("hidden");
        remotePip.classList.remove("hidden");
      }
    } else {
      stopScreenSharing();
    }
  });

  // End Call
  hangupBtn.addEventListener("click", () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenShareStream) {
      screenShareStream.getTracks().forEach(track => track.stop());
    }
    clearInterval(callTimer);

    if (sessionId) {
      const sessions = db.getData("ll_sessions");
      const sessObj = sessions.find(s => s.id === sessionId);
      if (sessObj) {
        sessObj.status = "Completed";
        db.saveData("ll_sessions", sessions);

        localStorage.setItem("ll_review_pending_session_id", sessionId);
      }
      window.location.href = "requests.html";
    } else {
      window.location.href = "dashboard.html";
    }
  });
}

function stopScreenSharing() {
  const shareCard = document.getElementById("stage-screen-share-card");
  const remoteCard = document.getElementById("stage-remote-card");
  const remotePip = document.getElementById("remote-pip-card");

  if (screenShareStream) {
    screenShareStream.getTracks().forEach(track => track.stop());
    screenShareStream = null;
  }

  shareCard.classList.add("hidden");
  remoteCard.classList.remove("hidden");
  remotePip.classList.add("hidden");
}

// Drawer view toggling
function setupDrawers() {
  const panel = document.getElementById("meeting-drawers-panel");
  const closeBtn = document.getElementById("close-drawer-btn");
  const chatBtn = document.getElementById("panel-chat-btn");
  const wbBtn = document.getElementById("panel-whiteboard-btn");

  const chatView = document.getElementById("chat-drawer-view");
  const wbView = document.getElementById("whiteboard-drawer-view");

  const togglePanel = (type) => {
    if (type === "chat") {
      wbBtn.classList.remove("panel-active");
      const active = chatBtn.classList.toggle("panel-active");
      
      if (active) {
        panel.classList.remove("collapsed");
        chatView.classList.remove("hidden");
        wbView.classList.add("hidden");
      } else {
        panel.classList.add("collapsed");
        chatView.classList.add("hidden");
      }
    } else {
      chatBtn.classList.remove("panel-active");
      const active = wbBtn.classList.toggle("panel-active");
      
      if (active) {
        panel.classList.remove("collapsed");
        wbView.classList.remove("hidden");
        chatView.classList.add("hidden");
        resizeCanvas();
      } else {
        panel.classList.add("collapsed");
        wbView.classList.add("hidden");
      }
    }
  };

  closeBtn.addEventListener("click", () => {
    panel.classList.add("collapsed");
    chatBtn.classList.remove("panel-active");
    wbBtn.classList.remove("panel-active");
    chatView.classList.add("hidden");
    wbView.classList.add("hidden");
  });

  chatBtn.addEventListener("click", () => togglePanel("chat"));
  wbBtn.addEventListener("click", () => togglePanel("wb"));
}

// Whiteboard sketches
function initWhiteboard() {
  const canvas = document.getElementById("collab-whiteboard-canvas");
  ctx = canvas.getContext("2d");

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", drawLine);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // Mobile Touch Support
  canvas.addEventListener("touchstart", (e) => {
    if (e.cancelable) e.preventDefault();
    startDrawing(e);
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    if (e.cancelable) e.preventDefault();
    drawLine(e);
  }, { passive: false });

  canvas.addEventListener("touchend", stopDrawing);

  const swatches = document.querySelectorAll(".color-swatch");
  swatches.forEach(sw => {
    sw.addEventListener("click", () => {
      swatches.forEach(s => s.classList.remove("active"));
      sw.classList.add("active");
      penColor = sw.getAttribute("data-color");
    });
  });

  const sizeSelect = document.getElementById("pen-size-select");
  sizeSelect.addEventListener("change", () => {
    penSize = parseInt(sizeSelect.value);
  });

  document.getElementById("clear-board-btn").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  setTimeout(simulatePartnerDrawing, 6000);
}

function resizeCanvas() {
  const canvas = document.getElementById("collab-whiteboard-canvas");
  const wrapper = canvas.parentElement;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(canvas, 0, 0);

  canvas.width = wrapper.clientWidth;
  canvas.height = 280; // Correct internal height to match CSS rendering height
  ctx.drawImage(tempCanvas, 0, 0);
  
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function startDrawing(e) {
  drawing = true;
  ctx.beginPath();
  const rect = e.target.getBoundingClientRect();
  const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
  const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
  ctx.moveTo(clientX - rect.left, clientY - rect.top);
}

function drawLine(e) {
  if (!drawing) return;
  const rect = e.target.getBoundingClientRect();
  ctx.strokeStyle = penColor;
  ctx.lineWidth = penSize;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
  const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
  ctx.lineTo(clientX - rect.left, clientY - rect.top);
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
  ctx.closePath();
}

function simulatePartnerDrawing() {
  const canvas = document.getElementById("collab-whiteboard-canvas");
  if (!canvas || !ctx) return;

  let step = 0;
  const drawStep = () => {
    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (step === 0) {
      ctx.strokeRect(50, 100, 70, 40);
      ctx.fillStyle = "#06B6D4";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("TEACH", 66, 124);
      step++;
      setTimeout(drawStep, 1000);
    } else if (step === 1) {
      ctx.beginPath();
      ctx.moveTo(125, 120);
      ctx.lineTo(185, 120);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(185, 120);
      ctx.lineTo(178, 114);
      ctx.moveTo(185, 120);
      ctx.lineTo(178, 126);
      ctx.stroke();
      step++;
      setTimeout(drawStep, 1000);
    } else if (step === 2) {
      ctx.strokeStyle = "#EC4899";
      ctx.strokeRect(190, 100, 70, 40);
      ctx.fillStyle = "#EC4899";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("LEARN", 207, 124);
      step++;
    }
  };
  drawStep();
}

function simulateSpeechPattern() {
  const waves = document.getElementById("remote-audio-waves");
  if (!waves) return;

  setInterval(() => {
    const isSpeaking = Math.random() < 0.6;
    const bars = waves.querySelectorAll(".sound-wave-bar");
    bars.forEach(bar => {
      if (isSpeaking) {
        bar.style.animationPlayState = "running";
      } else {
        bar.style.animationPlayState = "paused";
        bar.style.height = "5px";
      }
    });
  }, 2200);
}

function initializeCallChatHistory() {
  const box = document.getElementById("call-chat-history-box");
  const sendBtn = document.getElementById("call-chat-send-btn");
  const input = document.getElementById("call-chat-msg-input");

  if (!box || !sendBtn) return;

  box.innerHTML = `
    <div class="call-msg-bubble partner">
      Hey! Glad we could coordinate this call. Can you see my screen share correctly?
    </div>
    <div class="call-msg-time">Just now</div>
  `;

  const sendMessage = () => {
    const val = input.value.trim();
    if (!val) return;

    box.innerHTML += `
      <div class="call-msg-bubble me">
        ${val}
      </div>
      <div class="call-msg-time">Just now</div>
    `;

    input.value = "";
    box.scrollTop = box.scrollHeight;

    setTimeout(() => {
      let reply = "Perfect! Let's continue on the Whiteboard. I sketched the barter flow diagram there.";
      const valLower = val.toLowerCase();
      if (valLower.includes("yes") || valLower.includes("can see") || valLower.includes("looks good")) {
        reply = "Awesome! Let's review the code structure on my screen first.";
      } else if (valLower.includes("hello") || valLower.includes("hi") || valLower.includes("hey")) {
        reply = "Hey! Ready to swap? I'm excited to learn from you.";
      } else if (valLower.includes("whiteboard") || valLower.includes("draw") || valLower.includes("diagram")) {
        reply = "I see. Let me adjust my drawing lines on the whiteboard.";
      }

      box.innerHTML += `
        <div class="call-msg-bubble partner">
          ${reply}
        </div>
        <div class="call-msg-time">Just now</div>
      `;
      box.scrollTop = box.scrollHeight;
    }, 2000);
  };

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}
