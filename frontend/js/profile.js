// Learnova Profile & Skill Management Logic
const token = sessionStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  forceAuth();

  const user = db.getCurrentUser();
  if (!user) return;

  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    sidebarContainer.innerHTML = getSidebarHTML("profile");
    setupTheme();
  }

  // 1. Render Profile info card
  renderProfileInfo();

  // 2. Render Skills with Endorsement labels
  renderSkills();

  // 3. Render Achievements Badges
  renderProfileBadges();

  // 4. Render Recommendations Reviews
  renderProfileReviews();

  // 5. Render LinkedIn style Experience Timeline
  renderExperienceTimeline();

  // 6. Wire profile details modal
  setupProfileModalEvents();

  // 7. Wire skill modals
  setupSkillModalEvents();

  window.addEventListener("ll_skills_updated", () => {
    renderSkills();
    renderProfileBadges();
  });
  window.addEventListener("ll_users_updated", () => {
    renderSkills();
  });
});

// Render basic profile information
function renderProfileInfo() {
  const user = db.getCurrentUser();
  if (!user) return;

  const avatarDiv = document.getElementById("profile-avatar");
  if (avatarDiv) {
    avatarDiv.innerHTML = getAvatarHTML(user);
  }

  // Render Cover Banner Image
  const bannerDiv = document.querySelector(".profile-banner");
  if (bannerDiv) {
    if (user.banner) {
      bannerDiv.style.backgroundImage = `url('${user.banner}')`;
      bannerDiv.style.backgroundSize = "cover";
      bannerDiv.style.backgroundPosition = "center";
    } else {
      bannerDiv.style.backgroundImage = ""; // defaults to CSS gradient
    }
  }

  document.getElementById("profile-display-name").textContent = user.name;
  
  // Professional Headline
  const hlText = user.headline || `Skill Exchange Partner | Active Member at Learnova`;
  document.getElementById("profile-display-headline").textContent = hlText;

  document.getElementById("profile-display-location").innerHTML = `
    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    ${user.location || "Global citizen"}
  `;
  
  // Connections Count (Formula based on completions)
  const completions = user.exchangesCompleted || 0;
  const connCount = 12 + (completions * 3);
  document.getElementById("profile-display-connections").innerHTML = `
    <strong>${completions}</strong> barter exchanges &bull; <strong>${connCount}</strong> exchange connections
  `;

  document.getElementById("profile-display-bio").textContent = user.bio || "No about summary written yet. Click edit profile to tell the community about your goals!";
  document.getElementById("profile-display-availability").textContent = user.availability || "Flexible Schedule";
}

// Edit Profile Modal events
function setupProfileModalEvents() {
  const modal = document.getElementById("edit-profile-modal");
  const editBtn = document.getElementById("edit-profile-btn");
  const closeBtn = document.getElementById("close-profile-modal");
  const cancelBtn = document.getElementById("cancel-profile-modal");
  const form = document.getElementById("edit-profile-form");
  
  if (!modal || !editBtn) return;

  // Wire avatar selector choices highlight
  const avOpts = document.querySelectorAll(".avatar-opt");
  avOpts.forEach(opt => {
    opt.addEventListener("click", () => {
      avOpts.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      opt.querySelector("input").checked = true;
    });
  });

  const openModal = () => {
    const user = db.getCurrentUser();
    document.getElementById("edit-name").value = user.name;
    document.getElementById("edit-headline").value = user.headline || "";
    document.getElementById("edit-location").value = user.location || "";
    document.getElementById("edit-bio").value = user.bio || "";
    document.getElementById("edit-availability").value = user.availability || "Flexible Schedule";

    // Populate custom avatar / banner inputs
    const isCustomAvatar = user.avatar && (user.avatar.startsWith("http") || user.avatar.includes(".") || user.avatar.startsWith("data:image"));
    document.getElementById("edit-avatar-url").value = isCustomAvatar ? user.avatar : "";
    document.getElementById("edit-banner-url").value = user.banner || "";

    // Auto-detect current avatar gradient representation (if not custom picture URL)
    let avColor = "purple";
    if (user.avatar && !isCustomAvatar) {
      if (user.avatar.includes("#EC4899")) avColor = "pink";
      else if (user.avatar.includes("#3B82F6")) avColor = "blue";
      else if (user.avatar.includes("#10B981")) avColor = "green";
      else if (user.avatar.includes("#F59E0B")) avColor = "orange";
    }
    
    const radio = document.querySelector(`input[name="edit-avatar-color"][value="${avColor}"]`);
    if (radio) {
      radio.checked = true;
      avOpts.forEach(o => o.classList.remove("active"));
      radio.closest(".avatar-opt").classList.add("active");
    }

    modal.classList.add("active");
  };

  const closeModal = () => {
    modal.classList.remove("active");
  };

  editBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = db.getCurrentUser();
    
    user.name = document.getElementById("edit-name").value.trim();
    user.headline = document.getElementById("edit-headline").value.trim();
    user.location = document.getElementById("edit-location").value.trim();
    user.bio = document.getElementById("edit-bio").value.trim();
    user.availability = document.getElementById("edit-availability").value;
    
    // Save custom banner URL
    user.banner = document.getElementById("edit-banner-url").value.trim() || "";

    // Save custom avatar picture URL or generate SVG stops
    const avatarUrl = document.getElementById("edit-avatar-url").value.trim();
    if (avatarUrl) {
      user.avatar = avatarUrl;
    } else {
      const colorVal = document.querySelector('input[name="edit-avatar-color"]:checked').value;
      let stop1 = "#4F46E5", stop2 = "#7C3AED";
      if (colorVal === "pink") { stop1 = "#EC4899"; stop2 = "#8B5CF6"; }
      else if (colorVal === "blue") { stop1 = "#3B82F6"; stop2 = "#06B6D4"; }
      else if (colorVal === "green") { stop1 = "#10B981"; stop2 = "#3B82F6"; }
      else if (colorVal === "orange") { stop1 = "#F59E0B"; stop2 = "#EF4444"; }

      const initials = user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
      user.avatar = `<svg viewBox="0 0 100 100" class="avatar-svg"><defs><linearGradient id="av-${user.id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${stop1}" /><stop offset="100%" stop-color="${stop2}" /></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av-${user.id})"/><text x="50" y="58" font-size="28" font-weight="700" fill="#FFF" text-anchor="middle">${initials}</text></svg>`;
    }

    db.setCurrentUser(user);
    
    const masterList = db.getData("ll_users");
    const idx = masterList.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      masterList[idx] = user;
      db.saveData("ll_users", masterList);
    }
    
    closeModal();
    renderProfileInfo();
    showToast("Profile details updated successfully!", "success");
    
    const sidebarContainer = document.getElementById("sidebar-container");
    if (sidebarContainer) {
      sidebarContainer.innerHTML = getSidebarHTML("profile");
      setupTheme();
    }
  });
}

// Skill Management rendering with endorsements count
function renderSkills() {
  const user = db.getCurrentUser();
  if (!user) return;

  const offeredContainer = document.getElementById("offered-chips-container");
  const wantedContainer = document.getElementById("wanted-chips-container");

  if (offeredContainer) {
    if (!user.skillsOffered || user.skillsOffered.length === 0) {
      offeredContainer.innerHTML = `<div class="empty-state" style="padding: 12px 0; color:var(--text-muted);"><p>You haven't listed any teaching skills yet.</p></div>`;
    } else {
      offeredContainer.innerHTML = "";
      user.skillsOffered.forEach((s, idx) => {
        offeredContainer.appendChild(createSkillChipHTML(s, idx, "offered"));
      });
    }
  }

  if (wantedContainer) {
    if (!user.skillsWanted || user.skillsWanted.length === 0) {
      wantedContainer.innerHTML = `<div class="empty-state" style="padding: 12px 0; color:var(--text-muted);"><p>You haven't listed any learning skills yet.</p></div>`;
    } else {
      wantedContainer.innerHTML = "";
      user.skillsWanted.forEach((s, idx) => {
        wantedContainer.appendChild(createSkillChipHTML(s, idx, "wanted"));
      });
    }
  }
}

function createSkillChipHTML(skill, index, type) {
  const chip = document.createElement("div");
  chip.className = "skill-chip";
  
  const lvlClass = "lvl-" + skill.level.toLowerCase();
  const endorsementPoints = skill.endorsements || (type === "offered" ? 5 + (index * 2) : 2);
  
  chip.innerHTML = `
    <span class="skill-chip-text">${skill.name}</span>
    <span class="skill-lvl-badge ${lvlClass}">${skill.level}</span>
    <span class="endorsements-lbl" title="${endorsementPoints} endorsements received">${endorsementPoints} pts</span>
    <span class="chip-actions">
      <span class="skill-delete-btn" data-type="${type}" data-idx="${index}">&times;</span>
    </span>
  `;
  
  chip.querySelector(".skill-chip-text").addEventListener("click", () => {
    openSkillModal(type, index, skill);
  });
  
  chip.querySelector(".skill-delete-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    deleteSkill(type, index);
  });

  return chip;
}

// Skill Modal Events wireframe
function setupSkillModalEvents() {
  const modal = document.getElementById("skill-modal");
  const closeBtn = document.getElementById("close-skill-modal");
  const cancelBtn = document.getElementById("cancel-skill-modal");
  const form = document.getElementById("skill-form");

  const addOfferedBtn = document.getElementById("add-offered-skill-btn");
  const addWantedBtn = document.getElementById("add-wanted-skill-btn");

  if (!modal) return;

  const closeModal = () => modal.classList.remove("active");

  if (addOfferedBtn) {
    addOfferedBtn.addEventListener("click", () => openSkillModal("offered", -1));
  }
  if (addWantedBtn) {
    addWantedBtn.addEventListener("click", () => openSkillModal("wanted", -1));
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Wire live autocomplete search for skill name input
  const skillNameInput = document.getElementById("skill-name-input");
  const datalist = document.getElementById("skills-datalist");
  if (skillNameInput && datalist) {
    let debounceTimer;
    skillNameInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      const val = e.target.value.trim();
      debounceTimer = setTimeout(async () => {
        try {
          const url = val 
            ? `http://localhost:5009/api/skills/search?q=${encodeURIComponent(val)}`
            : `http://localhost:5009/api/skills/`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && Array.isArray(data.skills)) {
              datalist.innerHTML = data.skills
                .map(s => `<option value="${s.skill_name}">`)
                .join("");
            }
          }
        } catch (err) {
          console.error("Autocomplete search error:", err);
        }
      }, 250);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = document.getElementById("skill-type").value;
    const editIdx = parseInt(document.getElementById("skill-edit-index").value);
    
    const skillName = document.getElementById("skill-name-input").value.trim();
    const skillLevel = document.getElementById("skill-level-input").value;
    
    const token = sessionStorage.getItem("token");
    const user = db.getCurrentUser() || {};
    if (!user.skillsOffered) user.skillsOffered = [];
    if (!user.skillsWanted) user.skillsWanted = [];
    if (!user.badges) user.badges = [];

    const targetArr = type === "offered" ? user.skillsOffered : user.skillsWanted;
    const existingEndorsements = (editIdx !== -1 && targetArr[editIdx]) ? targetArr[editIdx].endorsements : 3;

    if (editIdx === -1) {
      if (targetArr.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
        showToast("Skill is already listed in this category.", "error");
        return;
      }
      if (token) {
        try {
          const res = await fetch("http://localhost:5009/api/skills/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              skill_name: skillName,
              skill_type: type === "offered" ? "offer" : "want",
              proficiency: skillLevel,
              description: ""
            })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            showToast(data.message || "Skill already exists or failed to add via API", "error");
            return;
          }
          await db.syncMySkills();
          await db.fetchActualUsers();
          closeModal();
          showToast(data.message || `Added ${skillName} to your list!`, "success");
          return;
        } catch (err) {
          console.error("API error adding skill:", err);
        }
      }
      targetArr.push({ name: skillName, level: skillLevel, endorsements: existingEndorsements });
      showToast(`Added ${skillName} to your list!`, "success");
    } else {
      if (token && targetArr[editIdx] && targetArr[editIdx].userSkillId) {
        try {
          const res = await fetch(`http://localhost:5009/api/skills/${targetArr[editIdx].userSkillId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              skill_type: type === "offered" ? "offer" : "want",
              proficiency: skillLevel,
              description: targetArr[editIdx].description || ""
            })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            showToast(data.message || "Failed to update skill via API", "error");
            return;
          }
          await db.syncMySkills();
          await db.fetchActualUsers();
          closeModal();
          showToast(data.message || `Updated ${skillName}!`, "success");
          return;
        } catch (err) {
          console.error("API error updating skill:", err);
        }
      }
      targetArr[editIdx] = { ...targetArr[editIdx], name: skillName, level: skillLevel, endorsements: existingEndorsements };
      showToast(`Updated ${skillName}!`, "success");
    }

    if (type === "offered" && user.skillsOffered.filter(s => s.level === "Expert").length >= 3) {
      if (!user.badges.includes("Skill Master")) {
        user.badges.push("Skill Master");
        if (typeof triggerBadgeUnlockNotif === "function") {
          triggerBadgeUnlockNotif("Skill Master");
        }
      }
    }

    db.setCurrentUser(user);
    const masterList = db.getData("ll_users");
    const uIdx = masterList.findIndex(u => u.id === user.id);
    if (uIdx !== -1) {
      masterList[uIdx] = user;
      db.saveData("ll_users", masterList);
    }

    closeModal();
    renderSkills();
    renderProfileBadges();
  });
}

function openSkillModal(type, index, skillObj = null) {
  const modal = document.getElementById("skill-modal");
  const title = document.getElementById("skill-modal-title");
  const submitBtn = document.getElementById("skill-submit-btn");

  document.getElementById("skill-type").value = type;
  document.getElementById("skill-edit-index").value = index;

  if (index === -1) {
    title.textContent = `Add Skill to ${type === 'offered' ? 'Teach' : 'Learn'}`;
    submitBtn.textContent = "Add Skill";
    document.getElementById("skill-name-input").value = "";
    document.getElementById("skill-level-input").value = "Beginner";
  } else {
    title.textContent = `Edit listed Skill`;
    submitBtn.textContent = "Save Skill";
    document.getElementById("skill-name-input").value = skillObj.name;
    document.getElementById("skill-level-input").value = skillObj.level;
  }

  modal.classList.add("active");
}

async function deleteSkill(type, index) {
  const user = db.getCurrentUser();
  const targetArr = type === "offered" ? user.skillsOffered : user.skillsWanted;
  if (!targetArr || !targetArr[index]) return;
  const removed = targetArr[index];
  const token = sessionStorage.getItem("token");

  if (token && removed.userSkillId) {
    try {
      const res = await fetch(`http://localhost:5009/api/skills/${removed.userSkillId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Failed to delete skill via API", "error");
        return;
      }
      await db.syncMySkills();
      await db.fetchActualUsers();
      renderSkills();
      showToast(data.message || `Removed skill: ${removed.name}`, "info");
      return;
    } catch (err) {
      console.error("API error deleting skill:", err);
    }
  }

  targetArr.splice(index, 1);
  db.setCurrentUser(user);
  const masterList = db.getData("ll_users");
  const uIdx = masterList.findIndex(u => u.id === user.id);
  if (uIdx !== -1) {
    masterList[uIdx] = user;
    db.saveData("ll_users", masterList);
  }

  renderSkills();
  showToast(`Removed skill: ${removed.name}`, "info");
}

// Render LinkedIn style Experience exchanges
function renderExperienceTimeline() {
  const container = document.getElementById("profile-experience-list");
  if (!container) return;

  const sessions = db.getData("ll_sessions");
  const completed = sessions.filter(s => s.status === "Completed");

  if (completed.length === 0) {
    container.innerHTML = `
      <div class="experience-item">
        <div class="exp-logo">LN</div>
        <div class="exp-details">
          <h4>Founder Member & Exchange Starter</h4>
          <h5>Learnova Barter Network</h5>
          <p>July 2026 - Present</p>
          <p class="exp-desc">Ready to launch my first skill swap! Connect with me on the explore page to barter programming, language practice, or creative topics.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  completed.forEach(s => {
    container.innerHTML += `
      <div class="experience-item">
        <div class="exp-logo">LN</div>
        <div class="exp-details">
          <h4>Skill Barter Exchange Partner</h4>
          <h5>Learnova Barter Network &bull; Complete Swap</h5>
          <p>Date: ${s.date} &bull; ${s.time}</p>
          <p class="exp-desc">Exchanged knowledge with <strong>${s.partnerName}</strong>. Covered topic session: <em>"${s.topic}"</em>. Earned recommendation rating points.</p>
        </div>
      </div>
    `;
  });
}

// Render badges showcase grid
function renderProfileBadges() {
  const container = document.getElementById("profile-badges-container");
  if (!container) return;

  const user = db.getCurrentUser();
  const unlocked = user.badges || [];

  container.innerHTML = "";
  BADGES_LIST.forEach(b => {
    const isUnlocked = unlocked.includes(b.name);
    container.innerHTML += `
      <div class="badge-card-full ${isUnlocked ? '' : 'locked'}">
        <span class="badge-icon-lg">${b.icon}</span>
        <h5>${b.name}</h5>
        <p>${b.desc}</p>
      </div>
    `;
  });
}

// Render Recommendations & Reviews
async function renderProfileReviews() {
  const listDiv = document.getElementById("profile-reviews-list");
  if (!listDiv) return;

  const user = db.getCurrentUser();
  if (!user) return;
  const backendId = user.backendId || (user.id && user.id.startsWith("user-") ? user.id.replace("user-", "") : user.id);

  let reviews = [];
  try {
    const res = await fetch(`http://localhost:5009/api/reviews/user/${backendId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.reviews) {
        reviews = data.reviews.map(r => ({
          id: r.review_id,
          rating: parseInt(r.rating),
          text: r.comment,
          authorName: r.reviewer_name,
          date: new Date(r.created_at).toLocaleDateString()
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching reviews from backend:", err);
  }
  
  if (reviews.length === 0) {
    listDiv.innerHTML = `<div class="empty-state" style="padding:12px 0; color:var(--text-muted);"><p>No recommendation feedback logged yet.</p></div>`;
    document.getElementById("avg-rating-value").textContent = "0.0 / 5.0";
    document.getElementById("avg-stars-container").textContent = "☆☆☆☆☆";
    document.getElementById("rating-review-count").textContent = "0";
    return;
  }

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = total / reviews.length;
  
  document.getElementById("avg-rating-value").textContent = `${avg.toFixed(1)} / 5.0`;
  document.getElementById("rating-review-count").textContent = reviews.length;
  
  let starStr = "";
  for (let i = 1; i <= 5; i++) {
    starStr += i <= Math.round(avg) ? "★" : "☆";
  }
  document.getElementById("avg-stars-container").textContent = starStr;

  listDiv.innerHTML = "";
  reviews.forEach(r => {
    let rStars = "";
    for (let i = 1; i <= 5; i++) {
      rStars += i <= r.rating ? "★" : "☆";
    }

    listDiv.innerHTML += `
      <div class="review-item-card">
        <div class="review-header">
          <span class="review-author">From: <strong>${r.authorName}</strong></span>
          <span class="review-stars">${rStars}</span>
        </div>
        <p class="review-comment">"${r.text}"</p>
        <div class="review-date">${r.date}</div>
      </div>
    `;
  });
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
