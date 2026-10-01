const SUPABASE_URL = "https://evvdggckoalesyyyqhqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const authMessage = document.getElementById("authMessage");

function showAuthMessage(message) {
  if (authMessage) {
    authMessage.textContent = message;
  }
}

async function signup() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

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
          email: email,
          password: password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || data.message || "ثبت‌نام ناموفق بود.");
    }

    showAuthMessage(
      "ثبت‌نام انجام شد. اگر تأیید ایمیل فعال باشد، ایمیل خود را بررسی کنید."
    );

  } catch (error) {
    showAuthMessage("❌ " + error.message);
  }
}

async function login() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

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
          email: email,
          password: password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.msg || "ورود ناموفق بود.");
    }

    localStorage.setItem(
      "supabase_access_token",
      data.access_token
    );

    localStorage.setItem(
      "supabase_refresh_token",
      data.refresh_token
    );

    showAuthMessage("✅ ورود با موفقیت انجام شد.");

  } catch (error) {
    showAuthMessage("❌ " + error.message);
  }
}

document
  .getElementById("signupButton")
  .addEventListener("click", signup);

document
  .getElementById("loginButton")
  .addEventListener("click", login);
