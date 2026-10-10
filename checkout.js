
const SUPABASE_URL = "https://evvdggckoalesyyyqhqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const CHECKOUT_URL = `${SUPABASE_URL}/functions/v1/swift-action`;
const ACCESS_TOKEN_KEY = "supabase_access_token";
const REFRESH_TOKEN_KEY = "supabase_refresh_token";

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

function formatPrice(value) {
  return Number(value || 0).toLocaleString("fa-IR") + " تومان";
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
    const saved = JSON.parse(
      localStorage.getItem("moghayesechi_cart") || "[]"
    );
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function findProduct(item) {
  if (typeof products === "undefined" || !Array.isArray(products)) {
    return null;
  }

  return products.find(
    p => String(p.id) === String(item.product_id ?? item.id)
  ) || null;
}

function getPrice(item, product) {
  return Number(
    item.unit_price ??
    item.price ??
    product?.price ??
    product?.unitPrice ??
    0
  );
}

function getQuantity(item) {
  return Number(item.quantity ?? item.qty ?? 1);
}

function getValidItems() {
  return cart.map(item => {
    const product = findProduct(item);
    if (!product) return null;

    const productId = Number(item.product_id ?? item.id ?? product.id);
    const unitPrice = getPrice(item, product);
    const quantity = getQuantity(item);

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(unitPrice) ||
      unitPrice < 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      return null;
    }

    return {
      product_id: productId,
      product_name: String(product.name ?? item.product_name ?? "محصول"),
      unit_price: unitPrice,
      quantity
    };
  }).filter(Boolean);
}

function renderOrder() {
  cart = readCart();

  if (!orderItems || !productsTotal || !orderTotal) return;

  const items = getValidItems();

  if (!items.length) {
    orderItems.innerHTML = "<p>سبد خرید خالی است یا محصولات معتبر نیستند.</p>";
    productsTotal.textContent = formatPrice(0);
    orderTotal.textContent = formatPrice(0);
    if (payButton) payButton.disabled = true;
    return;
  }

  let total = 0;

  orderItems.innerHTML = items.map(item => {
    const subtotal = item.unit_price * item.quantity;
    total += subtotal;

    return `
      <div class="product">
        <strong>${escapeHTML(item.product_name)}</strong>
        <div>تعداد: ${item.quantity.toLocaleString("fa-IR")}</div>
        <div>${formatPrice(subtotal)}</div>
      </div>
    `;
  }).join("");

  productsTotal.textContent = formatPrice(total);
  orderTotal.textContent = formatPrice(total);

  if (payButton) payButton.disabled = false;
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return "";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.access_token) {
      console.error("Refresh token error:", data);
      return "";
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);

    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }

    return data.access_token;
  } catch (error) {
    console.error("Refresh request failed:", error);
    return "";
  }
}

async function getValidAccessToken() {
  let token = getAccessToken();

  if (!token) {
    token = await refreshAccessToken();
  }

  return token;
}

async function submitOrder() {
  if (!fullNameInput || !phoneInput || !addressInput) {
    showMessage("فیلدهای فرم سفارش پیدا نشدند.");
    return;
  }

  const name = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();

  if (!name || !phone || !address) {
    showMessage("نام، شماره موبایل و آدرس را کامل وارد کنید.");
    return;
  }

  if (!acceptRules?.checked) {
    showMessage("ابتدا قوانین و مقررات را بپذیرید.");
    return;
  }

  cart = readCart();
  const items = getValidItems();

  if (!items.length) {
    showMessage("سبد خرید معتبر نیست؛ به صفحه فروشگاه برگردید.");
    return;
  }

  if (!payButton) return;

  payButton.disabled = true;
  payButton.textContent = "در حال ثبت سفارش...";

  try {
    const token = await getValidAccessToken();

    if (!token) {
      throw new Error(
        "نشست ورود پیدا نشد. ابتدا وارد حساب کاربری شوید و دوباره تلاش کنید."
      );
    }

    const response = await fetch(CHECKOUT_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        phone,
        address,
        items
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("swift-action error:", response.status, data);

      if (response.status === 401) {
        throw new Error(
          "خطای 401: نشست کاربری معتبر نیست یا تابع swift-action ورود را تشخیص نمی‌دهد."
        );
      }

      throw new Error(
        data.error ||
        data.message ||
        `ثبت سفارش انجام نشد (خطای ${response.status}).`
      );
    }

    if (data.ok === false || data.success === false) {
      throw new Error(data.error || data.message || "ثبت سفارش ناموفق بود.");
    }

    localStorage.removeItem("moghayesechi_cart");

    const orderId = data.order_id ?? data.orderId ?? data.id ?? "ثبت شد";
    const total = data.total_amount ?? data.totalAmount ??
      items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    showMessage(`سفارش ثبت شد. شماره سفارش: ${orderId}`, "success");

    orderItems.innerHTML = `
      <div class="product">
        <strong>سفارش با موفقیت ثبت شد</strong>
        <div>شماره سفارش: ${escapeHTML(orderId)}</div>
        <div>مبلغ: ${formatPrice(total)}</div>
      </div>
    `;

    productsTotal.textContent = formatPrice(total);
    orderTotal.textContent = formatPrice(total);
    payButton.textContent = "سفارش ثبت شد";
  } catch (error) {
    console.error(error);
    showMessage(error.message || "ثبت سفارش انجام نشد.");
    payButton.disabled = false;
    payButton.textContent = "💳 ادامه برای پرداخت";
  }
}

if (payButton) {
  payButton.addEventListener("click", submitOrder);
}

if (backButton) {
  backButton.addEventListener("click", () => {
    const confirmed = window.confirm(
      "سفارش را لغو کنیم و تمام محصولات سبد خرید را پاک کنیم؟"
    );

    if (!confirmed) return;

    localStorage.removeItem("moghayesechi_cart");
    cart = [];
    renderOrder();
    window.location.href = "index.html";
  });
}

  });
}

renderOrder();
