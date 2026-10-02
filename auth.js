const SUPABASE_URL = "https://evvdggckoalesyyyqhqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const authMessage = document.getElementById("authMessage");
const authBox = document.getElementById("authBox");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const signupButton = document.getElementById("signupButton");
const loginButton = document.getElementById("loginButton");

function showAuthMessage(message) {
  if (authMessage) {
    authMessage.textContent = message;
  }
}

function showLoggedIn(email) {
  if (!authBox) return;

  authBox.innerHTML = `
    <div class="auth-card">
      <h2>✅ وارد شدید</h2>

      <p>
        کاربر:
        <strong>${email}</strong>
      </p>

      <p id="authMessage">
        ورود با موفقیت انجام شد.
      </p>

      <button id="logoutButton">
        خروج
      </button>
    </div>
  `;

  document
    .getElementById("logoutButton")
    .addEventListener("click", logout);
}

async function signup() {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    showAuthMessage("ایمیل و رمز عبور را وارد کنید.");
    return;
  }

  if (password.length < 6) {
    showAuthMessage("رمز عبور باید حداقل ۶ کاراکتر باشد.");
    return;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.msg ||
        data.message ||
        "ثبت‌نام ناموفق بود."
      );
    }

    showAuthMessage(
      "✅ ثبت‌نام انجام شد. اکنون می‌توانید وارد شوید."
    );

  } catch (error) {
    showAuthMessage("❌ " + error.message);
  }
}

async function login() {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    showAuthMessage("ایمیل و رمز عبور را وارد کنید.");
    return;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error_description ||
        data.msg ||
        "ورود ناموفق بود."
      );
    }

    localStorage.setItem(
      "supabase_access_token",
      data.access_token
    );

    localStorage.setItem(
      "supabase_refresh_token",
      data.refresh_token
    );

    localStorage.setItem(
      "supabase_user_email",
      email
    );

    showLoggedIn(email);

  } catch (error) {
    showAuthMessage("❌ " + error.message);
  }
}

function logout() {
  localStorage.removeItem("supabase_access_token");
  localStorage.removeItem("supabase_refresh_token");
  localStorage.removeItem("supabase_user_email");

  location.reload();
}

function checkExistingLogin() {
  const token = localStorage.getItem(
    "supabase_access_token"
  );

  const email = localStorage.getItem(
    "supabase_user_email"
  );

  if (token && email) {
    showLoggedIn(email);
  }
}

if (signupButton) {
  signupButton.addEventListener("click", signup);
}

if (loginButton) {
  loginButton.addEventListener("click", login);
}

checkExistingLogin();
