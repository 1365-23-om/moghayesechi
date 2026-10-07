const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const CHECKOUT_URL =
  `${SUPABASE_URL}/functions/v1/swift-action`;

const ACCESS_TOKEN_KEY =
  "supabase_access_token";

const REFRESH_TOKEN_KEY =
  "supabase_refresh_token";

const fullNameInput = document.getElementById("fullName");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const orderItems = document.getElementById("orderItems");
const productsTotal = document.getElementById("productsTotal");
const orderTotal = document.getElementById("orderTotal");
const acceptRules = document.getElementById("acceptRules");
const payButton = document.getElementById("payButton");
const backButton = document.getElementById("backButton");
const message = document.getElementById("message");

let cart = [];

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className = type;
}

function formatPrice(price) {
  return Number(price || 0).toLocaleString("fa-IR") + " تومان";
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function readCart() {
  try {
    const value = JSON.parse(
      localStorage.getItem("moghayesechi_cart") || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function renderOrder() {
  cart = readCart();

  if (!orderItems || !productsTotal || !orderTotal) {
    return;
  }

  if (!cart.length) {
    orderItems.innerHTML =
      "<p>🛒 سبد خرید خالی است.</p>";

    productsTotal.textContent = "۰ تومان";
    orderTotal.textContent = "۰ تومان";

    if (payButton) {
      payButton.disabled = true;
    }

    return;
  }

  let total = 0;
  let html = "";

  for (const item of cart) {
    const product =
      typeof products !== "undefined"
        ? products.find(
            p => Number(p.id) === Number(item.id)
          )
        : null;

    if (!product) continue;

    const quantity = Math.max(
      1,
      Number(item.qty) || 1
    );

    const subtotal =
      Number(product.price) * quantity;

    total += subtotal;

    html += `
      <div class="product">
        <strong>
          ${escapeHTML(product.icon || "🛍")}
          ${escapeHTML(product.name)}
        </strong>

        <div>
          تعداد: ${quantity}
        </div>

        <div>
          ${formatPrice(subtotal)}
        </div>
      </div>
    `;
  }

  orderItems.innerHTML =
    html || "<p>محصول معتبری در سبد نیست.</p>";

  productsTotal.textContent =
    formatPrice(total);

  orderTotal.textContent =
    formatPrice(total);

  if (payButton) {
    payButton.disabled = !html;
  }
}

function getAccessToken() {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

async function refreshSession() {
  const refreshToken =
    localStorage.getItem(
      REFRESH_TOKEN_KEY
    );

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
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
          refresh_token: refreshToken
        })
      }
    );

    const data =
      await response.json().catch(
        () => ({})
      );

    if (
      !response.ok ||
      !data.access_token
    ) {
      localStorage.removeItem(
        ACCESS_TOKEN_KEY
      );

      localStorage.removeItem(
        REFRESH_TOKEN_KEY
      );

      return null;
    }

    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      data.access_token
    );

    if (data.refresh_token) {
      localStorage.setItem(
        REFRESH_TOKEN_KEY,
        data.refresh_token
      );
    }

    return data.access_token;

  } catch (error) {
    console.error(
      "Refresh session error:",
      error
    );

    return null;
  }
}

async function getValidAccessToken() {
  let token =
    getAccessToken();

  if (token) {
    return token;
  }

  return await refreshSession();
}

function validateCustomer() {
  const name =
    fullNameInput?.value.trim() || "";

  const phone =
    phoneInput?.value.trim() || "";

  const address =
    addressInput?.value.trim() || "";

  if (!name) {
    throw new Error(
      "نام و نام خانوادگی را وارد کنید."
    );
  }

  if (!phone) {
    throw new Error(
      "شماره موبایل را وارد کنید."
    );
  }

  if (!address) {
    throw new Error(
      "آدرس تحویل را وارد کنید."
    );
  }

  if (!/^09\d{9}$/.test(phone)) {
    throw new Error(
      "شماره موبایل را به شکل 09123456789 وارد کنید."
    );
  }

  if (
    acceptRules &&
    !acceptRules.checked
  ) {
    throw new Error(
      "لطفاً قوانین و مقررات را بپذیرید."
    );
  }

  return {
    name,
    phone,
    address
  };
}

function buildItems() {
  if (
    typeof products ===
    "undefined"
  ) {
    return [];
  }

  return cart
    .map(item => {
      const product =
        products.find(
          p =>
            Number(p.id) ===
            Number(item.id)
        );

      if (!product) {
        return null;
      }

      return {
        product_id:
          Number(product.id),

        product_name:
          product.name,

        unit_price:
          Number(product.price),

        quantity:
          Math.max(
            1,
            Number(item.qty) || 1
          )
      };
    })
    .filter(Boolean);
}

async function sendCheckoutRequest(
  token,
  body
) {
  return await fetch(
    CHECKOUT_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "apikey":
          SUPABASE_KEY,

        "Authorization":
          `Bearer ${token}`
      },

      body:
        JSON.stringify(body)
    }
  );
}

async function submitOrder() {
  if (!cart.length) {
    throw new Error(
      "سبد خرید خالی است."
    );
  }

  const customer =
    validateCustomer();

  const items =
    buildItems();

  if (!items.length) {
    throw new Error(
      "محصول معتبری در سبد خرید پیدا نشد."
    );
  }

  let token =
    await getValidAccessToken();

  if (!token) {
    throw new Error(
      "ابتدا وارد حساب کاربری شوید."
    );
  }

  const body = {
    name:
      customer.name,

    phone:
      customer.phone,

    address:
      customer.address,

    items:
      items
  };

  let response =
    await sendCheckoutRequest(
      token,
      body
    );

  let result =
    await response
      .json()
      .catch(() => ({}));

  /*
   * اگر توکن منقضی شده باشد،
   * یک بار با Refresh Token
   * توکن جدید می‌گیریم.
   */
  if (response.status === 401) {
    token =
      await refreshSession();

    if (!token) {
      throw new Error(
        "نشست شما منقضی شده است. دوباره وارد شوید."
      );
    }

    response =
      await sendCheckoutRequest(
        token,
        body
      );

    result =
      await response
        .json()
        .catch(() => ({}));
  }

  if (
    !response.ok ||
    !result.ok
  ) {
    console.error(
      "Swift Action response:",
      result
    );

    throw new Error(
      result.error ||
      "ثبت سفارش انجام نشد."
    );
  }

  return result;
}

async function pay() {
  if (!payButton) {
    return;
  }

  payButton.disabled = true;

  showMessage(
    "⏳ در حال ثبت سفارش...",
    "success"
  );

  try {
    const result =
      await submitOrder();

    /*
     * سفارش با موفقیت ثبت شد.
     */
    localStorage.removeItem(
      "moghayesechi_cart"
    );

    cart = [];

    renderOrder();

    showMessage(
      `✅ سفارش با موفقیت ثبت شد. شماره سفارش: ${result.order_id}`,
      "success"
    );

    /*
     * انتقال به صفحه نتیجه
     */
    setTimeout(() => {
      window.location.href =
        `payment-result.html?order_id=${encodeURIComponent(
          result.order_id
        )}&status=paid`;
    }, 900);

  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

    showMessage(
      "❌ " + error.message,
      "error"
    );

    payButton.disabled = false;
  }
}

if (payButton) {
  payButton.addEventListener(
    "click",
    pay
  );
}

if (backButton) {
  backButton.addEventListener(
    "click",
    () => {
      window.location.href =
        "index.html";
    }
  );
}

renderOrder();
