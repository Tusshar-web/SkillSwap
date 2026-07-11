// LearnLoop Authentication Logic

document.addEventListener("DOMContentLoaded", () => {
  // 1. Toggle Login and Forgot Password views in login.html
  const triggerForgot = document.getElementById("trigger-forgot");
  const triggerLogin = document.getElementById("trigger-login");
  const loginView = document.getElementById("login-view");
  const forgotView = document.getElementById("forgot-view");

  if (triggerForgot && loginView && forgotView) {
    triggerForgot.addEventListener("click", () => {
      loginView.classList.remove("active");
      setTimeout(() => {
        forgotView.classList.add("active");
      }, 200);
    });
  }

  if (triggerLogin && loginView && forgotView) {
    triggerLogin.addEventListener("click", () => {
      forgotView.classList.remove("active");
      setTimeout(() => {
        loginView.classList.add("active");
      }, 200);
    });
  }

  // 2. Password Strength Meter Logic (for register.html)
  const regPassword = document.getElementById("reg-password");
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");
  
  const hintLen = document.getElementById("hint-len");
  const hintNum = document.getElementById("hint-num");
  const hintSpec = document.getElementById("hint-spec");

  if (regPassword) {
    regPassword.addEventListener("input", () => {
      const val = regPassword.value;
      let score = 0;

      const hasLength = val.length >= 8;
      if (hasLength) {
        score++;
        hintLen.classList.add("valid");
      } else {
        hintLen.classList.remove("valid");
      }

      const hasNumber = /\d/.test(val);
      if (hasNumber) {
        score++;
        hintNum.classList.add("valid");
      } else {
        hintNum.classList.remove("valid");
      }

      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
      if (hasSpecial) {
        score++;
        hintSpec.classList.add("valid");
      } else {
        hintSpec.classList.remove("valid");
      }

      if (val === "") {
        strengthBar.style.width = "0%";
        strengthText.textContent = "Empty";
        strengthText.style.color = "var(--text-muted)";
      } else if (score === 1) {
        strengthBar.style.width = "33%";
        strengthBar.style.backgroundColor = "#ef4444";
        strengthText.textContent = "Weak";
        strengthText.style.color = "#ef4444";
      } else if (score === 2) {
        strengthBar.style.width = "66%";
        strengthBar.style.backgroundColor = "#f59e0b";
        strengthText.textContent = "Medium";
        strengthText.style.color = "#f59e0b";
      } else if (score === 3) {
        strengthBar.style.width = "100%";
        strengthBar.style.backgroundColor = "#10b981";
        strengthText.textContent = "Strong";
        strengthText.style.color = "#10b981";
      }
    });
  }

  // 3. Login Submission Logic
  // 3. Login Submission Logic
const loginForm = document.getElementById("login-form");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {

      const response = await fetch("http://localhost:5009/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Login failed", "error");
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      // Save logged in user
      localStorage.setItem("user", JSON.stringify(data.user));

      showToast("Login successful!", "success");

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "dashboard.html";

      setTimeout(() => {
        window.location.href = redirect;
      }, 1000);

    } catch (err) {

      console.error(err);
      showToast("Unable to connect to server.", "error");

    }

  });

}


// 4. Registration Submission Logic
const regForm = document.getElementById("register-form");

if (regForm) {

  regForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const full_name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;

    if (password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    try {

      const response = await fetch("http://localhost:5009/api/auth/register", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          full_name,
          email,
          password
        })

      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Registration failed", "error");
        return;
      }

      showToast("Registration successful! Please login.", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);

    } catch (err) {

      console.error(err);

      showToast("Unable to connect to server.", "error");

    }

  });

}

  // 5. Forgot Password Logic
  const forgotForm = document.getElementById("forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("forgot-email").value.trim();
      showToast(`Recovery link sent to ${email}! Check spam folders if not received.`, "success");
      forgotForm.reset();
    });
  }
});

function getRandomHexColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
