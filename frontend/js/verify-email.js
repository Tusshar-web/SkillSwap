// Learnova Email Verification Logic

document.addEventListener("DOMContentLoaded", () => {
  const emailText = document.getElementById("email-text");
  const verifyForm = document.getElementById("verify-otp-form");
  const submitBtn = document.getElementById("verify-submit-btn");
  const resendBtn = document.getElementById("resend-btn");
  const countdownEl = document.getElementById("countdown-timer");
  const otpDigits = Array.from(document.querySelectorAll(".otp-digit"));

  // 1. Get email from localStorage or URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  let email = urlParams.get("email") || localStorage.getItem("verifyEmail");

  if (email) {
    // Keep localStorage updated if got from query param
    localStorage.setItem("verifyEmail", email);
    if (emailText) emailText.textContent = email;
  } else {
    if (emailText) emailText.textContent = "No email provided";
    if (typeof showToast === "function") {
      showToast("No email found for verification. Please register or login first.", "error");
    }
    setTimeout(() => {
      window.location.href = "register.html";
    }, 2000);
    return;
  }

  // 2. OTP Grid Interactive Navigation
  otpDigits.forEach((input, index) => {
    // Focus & Input handling
    input.addEventListener("input", (e) => {
      const val = e.target.value;
      // Ensure only numeric value
      if (!/^\d*$/.test(val)) {
        e.target.value = val.replace(/\D/g, "");
      }

      if (e.target.value) {
        e.target.classList.add("filled");
        // Move to next input if available
        if (index < otpDigits.length - 1) {
          otpDigits[index + 1].focus();
        }
      } else {
        e.target.classList.remove("filled");
      }
    });

    // Keydown handling for Backspace / Left / Right arrows
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        if (!e.target.value && index > 0) {
          otpDigits[index - 1].focus();
          otpDigits[index - 1].value = "";
          otpDigits[index - 1].classList.remove("filled");
        } else {
          e.target.classList.remove("filled");
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        otpDigits[index - 1].focus();
      } else if (e.key === "ArrowRight" && index < otpDigits.length - 1) {
        e.preventDefault();
        otpDigits[index + 1].focus();
      }
    });

    // Paste handling
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData("text").trim();
      const digits = pasteData.replace(/\D/g, "").split("").slice(0, 6);

      if (digits.length > 0) {
        digits.forEach((digit, idx) => {
          if (otpDigits[idx]) {
            otpDigits[idx].value = digit;
            otpDigits[idx].classList.add("filled");
          }
        });
        // Focus the next empty box or the last box
        const nextIdx = Math.min(digits.length, otpDigits.length - 1);
        otpDigits[nextIdx].focus();
      }
    });
  });

  // 3. Countdown Timer Logic
  let countdownInterval = null;
  let remainingSeconds = 60;

  function startCountdown(seconds = 60) {
    if (countdownInterval) clearInterval(countdownInterval);
    remainingSeconds = seconds;

    if (resendBtn) resendBtn.disabled = true;
    if (countdownEl) {
      countdownEl.style.display = "inline-block";
      updateTimerDisplay();
    }

    countdownInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(countdownInterval);
        if (resendBtn) resendBtn.disabled = false;
        if (countdownEl) countdownEl.style.display = "none";
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (!countdownEl) return;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    countdownEl.textContent = `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Start 60-second countdown initially
  startCountdown(60);

  // 4. Verify OTP Form Submission
  if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const otp = otpDigits.map(d => d.value.trim()).join("");

      if (otp.length < 6) {
        if (typeof showToast === "function") {
          showToast("Please enter all 6 digits of the OTP code.", "error");
        }
        return;
      }

      // Set loading state
      const originalBtnText = submitBtn ? submitBtn.textContent : "Verify Email";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Verifying...";
      }

      try {
        const response = await fetch("http://localhost:5009/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            otp
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (typeof showToast === "function") {
            showToast(data.message || "Invalid OTP or verification failed.", "error");
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
          return;
        }

        if (typeof showToast === "function") {
          showToast("Email verified successfully! Redirecting to login...", "success");
        }

        localStorage.removeItem("verifyEmail");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);

      } catch (err) {
        console.error(err);
        if (typeof showToast === "function") {
          showToast("Unable to connect to server. Please check your connection.", "error");
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }

  // 5. Resend OTP Button Handler
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      if (resendBtn.disabled) return;

      const originalText = resendBtn.textContent;
      resendBtn.disabled = true;
      resendBtn.textContent = "Sending...";

      try {
        const response = await fetch("http://localhost:5009/api/auth/resend-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (typeof showToast === "function") {
            showToast(data.message || "Failed to resend OTP.", "error");
          }
          resendBtn.disabled = false;
          resendBtn.textContent = originalText;
          return;
        }

        if (typeof showToast === "function") {
          showToast("New OTP sent to your email!", "success");
        }

        resendBtn.textContent = originalText;
        startCountdown(60);

      } catch (err) {
        console.error(err);
        if (typeof showToast === "function") {
          showToast("Unable to connect to server. Please check your connection.", "error");
        }
        resendBtn.disabled = false;
        resendBtn.textContent = originalText;
      }
    });
  }
});
