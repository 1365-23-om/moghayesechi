
const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const ACCESS_TOKEN_KEY =
  "supabase_access_token";

const REFRESH_TOKEN_KEY =
  "supabase_refresh_token";

const USER_EMAIL_KEY =
  "supabase_user_email";

const authMessage =
  document.getElementById("authMessage");

const authBox =
  document.getElementById("authBox");

const authEmail =
  document.getElementById("authEmail");

const authPassword =
  document.getElementById("authPassword");

const signupButton =
  document.getElementById("signupButton");

const loginButton =
  document.getElementById("loginButton");


function showAuthMessage(message) {

  const element =
    document.getElementById("authMessage");

  if (element) {
    element.textContent = message;
  }

}


function saveSession(data, email) {

  if (data.access_token) {

    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      data.access_token
    );

  }

  if (data.refresh_token) {

    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      data.refresh_token
    );

  }

  if (email) {

    localStorage.setItem(
      USER_EMAIL_KEY,
      email
    );

  }

}


function clearSession() {

  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_EMAIL_KEY
  );

}


function getAccessToken() {

  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );

}


function getRefreshToken() {

  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );

}


async function signup() {

  const email =
    authEmail.value.trim();

  const password =
    authPassword.value;


  if (!email || !password) {

    showAuthMessage(
      "ایمیل و رمز عبور را وارد کنید."
    );

    return;
  }


  if (password.length < 6) {

    showAuthMessage(
      "رمز عبور باید حداقل ۶ کاراکتر باشد."
    );

    return;
  }


  try {

    const response =
      await fetch(
        `${SUPABASE_URL}/auth/v1/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "apikey":
              SUPABASE_KEY
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.msg ||
        data.message ||
        data.error_description ||
        "ثبت‌نام ناموفق بود."
      );

    }


    /*
     * بعضی پروژه‌های Supabase
     * بعد از ثبت‌نام مستقیماً Session می‌دهند.
     */

    if (data.access_token) {

      saveSession(
        data,
        email
      );

      showLoggedIn(email);

      return;

    }


    showAuthMessage(
      "✅ ثبت‌نام انجام شد. اکنون وارد شوید."
    );


  } catch (error) {

    console.error(error);

    showAuthMessage(
      "❌ " + error.message
    );

  }

}


async function login() {

  const email =
    authEmail.value.trim();

  const password =
    authPassword.value;


  if (!email || !password) {

    showAuthMessage(
      "ایمیل و رمز عبور را وارد کنید."
    );

    return;
  }


  try {

    showAuthMessage(
      "⏳ در حال ورود..."
    );


    const response =
      await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "apikey":
              SUPABASE_KEY
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error_description ||
        data.msg ||
        data.message ||
        "ورود ناموفق بود."
      );

    }


    if (!data.access_token) {

      throw new Error(
        "Access Token دریافت نشد."
      );

    }


    saveSession(
      data,
      email
    );


    showLoggedIn(email);


  } catch (error) {

    console.error(error);

    showAuthMessage(
      "❌ " + error.message
    );

  }

}


async function refreshSession() {

  const refreshToken =
    getRefreshToken();


  if (!refreshToken) {

    return false;

  }


  try {

    const response =
      await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "apikey":
              SUPABASE_KEY
          },

          body: JSON.stringify({
            refresh_token:
              refreshToken
          })
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.access_token
    ) {

      clearSession();

      return false;

    }


    const email =
      localStorage.getItem(
        USER_EMAIL_KEY
      );


    saveSession(
      data,
      email
    );


    return true;


  } catch (error) {

    console.error(
      "Refresh session error:",
      error
    );

    return false;

  }

}


async function getValidAccessToken() {

  let token =
    getAccessToken();


  if (!token) {

    const refreshed =
      await refreshSession();


    if (!refreshed) {

      return null;

    }


    token =
      getAccessToken();

  }


  return token;

}


async function apiFetch(
  url,
  options = {}
) {

  let token =
    await getValidAccessToken();


  if (!token) {

    throw new Error(
      "ابتدا وارد حساب کاربری شوید."
    );

  }


  const headers = {
    ...(options.headers || {}),
    "Authorization":
      `Bearer ${token}`,
    "apikey":
      SUPABASE_KEY
  };


  let response =
    await fetch(
      url,
      {
        ...options,
        headers
      }
    );


  /*
   * اگر Access Token منقضی شده باشد،
   * یک بار Refresh می‌کنیم و درخواست
   * را دوباره ارسال می‌کنیم.
   */

  if (response.status === 401) {

    const refreshed =
      await refreshSession();


    if (!refreshed) {

      clearSession();

      throw new Error(
        "نشست شما منقضی شده است. دوباره وارد شوید."
      );

    }


    token =
      getAccessToken();


    response =
      await fetch(
        url,
        {
          ...options,

          headers: {
            ...(options.headers || {}),
            "Authorization":
              `Bearer ${token}`,
            "apikey":
              SUPABASE_KEY
          }
        }
      );

  }


  return response;

}


function showLoggedIn(email) {

  if (!authBox) {
    return;
  }


  authBox.innerHTML = `
    <div class="auth-card">

      <h2>
        ✅ وارد شدید
      </h2>

      <p>
        کاربر:
        <strong>
          ${email}
        </strong>
      </p>

      <p id="authMessage">
        ورود با موفقیت انجام شد.
      </p>

      <button
        id="ordersButton"
        type="button"
      >
        📦 سفارش‌های من
      </button>

      <button
        id="logoutButton"
        type="button"
      >
        خروج
      </button>

    </div>
  `;


  const logoutButton =
    document.getElementById(
      "logoutButton"
    );


  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      logout
    );

  }


  const ordersButton =
    document.getElementById(
      "ordersButton"
    );


  if (ordersButton) {

    ordersButton.addEventListener(
      "click",
      function () {

        window.location.href =
          "orders.html";

      }
    );

  }

}


async function logout() {

  const token =
    getAccessToken();


  /*
   * تلاش برای خروج واقعی از Supabase.
   * حتی اگر درخواست خطا بدهد،
   * Session محلی پاک می‌شود.
   */

  if (token) {

    try {

      await fetch(
        `${SUPABASE_URL}/auth/v1/logout`,
        {
          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${token}`,

            "apikey":
              SUPABASE_KEY
          }
        }
      );

    } catch (error) {

      console.warn(
        "Supabase logout warning:",
        error
      );

    }

  }


  clearSession();

  window.location.reload();

}


async function checkExistingLogin() {

  const token =
    getAccessToken();

  const refreshToken =
    getRefreshToken();

  const email =
    localStorage.getItem(
      USER_EMAIL_KEY
    );


  if (!token && !refreshToken) {

    return;

  }


  /*
   * اگر Access Token وجود نداشته
   * باشد، با Refresh Token بازسازی می‌شود.
   */

  if (!token && refreshToken) {

    const refreshed =
      await refreshSession();


    if (!refreshed) {

      return;

    }

  }


  /*
   * اگر Email ذخیره شده باشد،
   * کاربر را وارد شده نمایش می‌دهیم.
   */

  if (email) {

    showLoggedIn(email);

  }

}


/*
 * اتصال دکمه‌ها
 */

if (signupButton) {

  signupButton.addEventListener(
    "click",
    signup
  );

}


if (loginButton) {

  loginButton.addEventListener(
    "click",
    login
  );

}


/*
 * بررسی Session هنگام باز شدن صفحه
 */

checkExistingLogin();


/*
 * برای استفاده سایر فایل‌ها:
 *
 * apiFetch(url)
 *
 * به صورت خودکار Token معتبر
 * را اضافه می‌کند و در صورت 401
 * Refresh انجام می‌دهد.
 */

window.MoghayesechiAuth = {

  getAccessToken,

  getRefreshToken,

  refreshSession,

  getValidAccessToken,

  apiFetch,

  logout

};
