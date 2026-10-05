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

const fullNameInput =
  document.getElementById("fullName");

const phoneInput =
  document.getElementById("phone");

const addressInput =
  document.getElementById("address");

const orderItems =
  document.getElementById("orderItems");

const productsTotal =
  document.getElementById("productsTotal");

const orderTotal =
  document.getElementById("orderTotal");

const acceptRules =
  document.getElementById("acceptRules");

const payButton =
  document.getElementById("payButton");

const backButton =
  document.getElementById("backButton");

const message =
  document.getElementById("message");

let cart = [];


/* =========================
   پیام
========================= */

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className = type;
}


/* =========================
   قیمت
========================= */

function formatPrice(price) {
  return (
    Number(price || 0).toLocaleString("fa-IR") +
    " تومان"
  );
}


/* =========================
   امنیت HTML
========================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================
   سبد خرید
========================= */

function readCart() {
  try {
    const value = JSON.parse(
      localStorage.getItem("moghayesechi_cart") || "[]"
    );

    return Array.isArray(value) ? value : [];

  } catch (error) {
    console.error("Cart error:", error);
    return [];
  }
}


/* =========================
   نمایش سفارش
========================= */

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

    const quantity =
      Math.max(1, Number(item.qty || 1));

    const price =
      Number(product.price || 0);

    const subtotal =
      price * quantity;

    total += subtotal;

    html += `
      <div class="product">

        <strong>
          ${escapeHTML(product.name)}
        </strong>

        <div>
          تعداد:
          ${quantity.toLocaleString("fa-IR")}
        </div>

        <div>
          قیمت واحد:
          ${formatPrice(price)}
        </div>

        <div>
          مبلغ:
          <strong>
            ${formatPrice(subtotal)}
          </strong>
        </div>

      </div>
    `;
  }

  if (!html) {
    orderItems.innerHTML =
      "<p>محصول معتبر در سبد خرید پیدا نشد.</p>";

    productsTotal.textContent = "۰ تومان";
    orderTotal.textContent = "۰ تومان";

    if (payButton) {
      payButton.disabled = true;
    }

    return;
  }

  orderItems.innerHTML = html;

  productsTotal.textContent =
    formatPrice(total);

  orderTotal.textContent =
    formatPrice(total);

  if (payButton) {
    payButton.disabled = false;
  }
}


/* =========================
   توکن
========================= */

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


/* =========================
   Refresh Session
========================= */

async function refreshAccessToken() {
  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {
    return null;
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
      "Refresh error:",
      error
    );

    return null;
  }
}


/* =========================
   توکن معتبر
========================= */

async function getValidAccessToken() {
  let token =
    getAccessToken();

  if (!token) {
    token =
      await refreshAccessToken();
  }

  return token;
}


/* =========================
   ساخت آیتم‌های سفارش
========================= */

function buildOrderItems() {
  cart = readCart();

  return cart
    .map(item => {

      const product =
        typeof products !== "undefined"
          ? products.find(
              p =>
                Number(p.id) ===
                Number(item.id)
            )
          : null;

      if (!product) {
        return null;
      }

      const productId =
        Number(product.id);

      const quantity =
        Number(item.qty || 1);

      const unitPrice =
        Number(product.price || 0);

      if (
        !Number.isSafeInteger(productId) ||
        productId <= 0
      ) {
        return null;
      }

      if (
        !Number.isSafeInteger(unitPrice) ||
        unitPrice < 0
      ) {
        return null;
      }

      if (
        !Number.isSafeInteger(quantity) ||
        quantity <= 0 ||
        quantity > 100
      ) {
        return null;
      }

      return {
        product_id: productId,

        product_name:
          String(
            product.name || ""
          ).trim(),

        unit_price: unitPrice,

        quantity: quantity
      };

    })
    .filter(Boolean);
}


/* =========================
   ثبت سفارش
========================= */

async function createOrder() {

  const fullName =
    fullNameInput?.value.trim() || "";

  const phone =
    phoneInput?.value.trim() || "";

  const address =
    addressInput?.value.trim() || "";


  if (!fullName) {
    showMessage(
      "نام و نام خانوادگی را وارد کنید."
    );

    fullNameInput?.focus();
    return;
  }


  if (!/^09\d{9}$/.test(phone)) {
    showMessage(
      "شماره موبایل باید مانند 09123456789 باشد."
    );

    phoneInput?.focus();
    return;
  }


  if (!address) {
    showMessage(
      "آدرس تحویل را وارد کنید."
    );

    addressInput?.focus();
    return;
  }


  if (
    acceptRules &&
    !acceptRules.checked
  ) {
    showMessage(
      "لطفاً قوانین و مقررات را بپذیرید."
    );

    return;
  }


  const items =
    buildOrderItems();

  if (!items.length) {
    showMessage(
      "سبد خرید خالی است یا اطلاعات کالاها نامعتبر است."
    );

    return;
  }


  let token =
    await getValidAccessToken();

  if (!token) {
    showMessage(
      "ابتدا وارد حساب کاربری شوید."
    );

    return;
  }


  const payload = {
    name: fullName,
    phone: phone,
    address: address,
    items: items
  };


  const originalText =
    payButton?.textContent ||
    "💳 ادامه برای پرداخت";


  try {

    if (payButton) {
      payButton.disabled = true;
      payButton.textContent =
        "⏳ در حال ثبت سفارش...";
    }

    showMessage(
      "در حال ثبت سفارش...",
      "loading"
    );


    /* درخواست اول */

    let response =
      await fetch(
        CHECKOUT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${token}`,

            "apikey":
              SUPABASE_KEY
          },

          body:
            JSON.stringify(payload)
        }
      );


    /* اگر 401 بود، Refresh */

    if (response.status === 401) {

      token =
        await refreshAccessToken();

      if (!token) {
        throw new Error(
          "نشست شما منقضی شده است. دوباره وارد شوید."
        );
      }


      /* درخواست دوم */

      response =
        await fetch(
          CHECKOUT_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Authorization":
                `Bearer ${token}`,

              "apikey":
                SUPABASE_KEY
            },

            body:
              JSON.stringify(payload)
          }
        );
    }


    let result;

    try {
      result =
        await response.json();

    } catch {
      throw new Error(
        `پاسخ نامعتبر از سرور دریافت شد (${response.status}).`
      );
    }


    console.log(
      "swift-action:",
      result
    );


    if (
      !response.ok ||
      !result.ok
    ) {
      throw new Error(
        result.error ||
        "ثبت سفارش انجام نشد."
      );
    }


    /* ذخیره نتیجه */

    sessionStorage.setItem(
      "moghayesechi_last_order",
      JSON.stringify(result)
    );


    /* پاک کردن سبد */

    localStorage.removeItem(
      "moghayesechi_cart"
    );


    showMessage(
      "✅ سفارش با موفقیت ثبت شد.",
      "success"
    );


    /* پرداخت واقعی */

    if (result.payment_url) {
      window.location.href =
        result.payment_url;

      return;
    }


    /* پرداخت تستی */

    window.location.href =
      `payment-result.html` +
      `?order_id=${encodeURIComponent(
        result.order_id || ""
      )}` +
      `&authority=${encodeURIComponent(
        result.payment_authority ||
        result.authority ||
        ""
      )}` +
      `&test=1`;

  } catch (error) {

    console.error(
      "Checkout Error:",
      error
    );

    showMessage(
      "❌ " +
      (
        error.message ||
        "خطا در ثبت سفارش"
      )
    );


    if (payButton) {
      payButton.disabled = false;

      payButton.textContent =
        originalText;
    }
  }
}


/* =========================
   دکمه‌ها
========================= */

if (payButton) {
  payButton.addEventListener(
    "click",
    createOrder
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


/* =========================
   شروع
========================= */

renderOrder();
