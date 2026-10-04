const SUPABASE_URL = "https://evvdggckoalesyyyqhqm.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const TEST_CHECKOUT_URL =
  `${SUPABASE_URL}/functions/v1/test-checkout`;

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

let cart = JSON.parse(
  localStorage.getItem("moghayesechi_cart") || "[]"
);

// -------------------------
// Helpers
// -------------------------

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

// -------------------------
// Render cart
// -------------------------

function renderOrder() {
  if (!orderItems || !productsTotal || !orderTotal) return;

  if (!cart.length) {
    orderItems.innerHTML =
      "<p>🛒 سبد خرید خالی است.</p>";

    if (payButton) {
      payButton.disabled = true;
    }

    productsTotal.textContent = "۰ تومان";
    orderTotal.textContent = "۰ تومان";

    return;
  }

  let total = 0;

  orderItems.innerHTML = cart
    .map((item) => {
      const product =
        typeof products !== "undefined"
          ? products.find((p) => p.id === item.id)
          : null;

      if (!product) return "";

      const quantity = Number(item.qty || 1);
      const subtotal =
        Number(product.price || 0) * quantity;

      total += subtotal;

      return `
        <div class="product">
          <strong>${escapeHTML(product.name)}</strong>

          <div>
            تعداد:
            ${quantity.toLocaleString("fa-IR")}
          </div>

          <div>
            قیمت واحد:
            ${formatPrice(product.price)}
          </div>

          <div>
            مبلغ:
            <strong>${formatPrice(subtotal)}</strong>
          </div>
        </div>
      `;
    })
    .join("");

  productsTotal.textContent = formatPrice(total);
  orderTotal.textContent = formatPrice(total);
}

// -------------------------
// Create test order
// -------------------------

async function createOrder() {
  const fullName =
    fullNameInput?.value.trim() || "";

  const phone =
    phoneInput?.value.trim() || "";

  const address =
    addressInput?.value.trim() || "";

  // Name
  if (!fullName) {
    showMessage(
      "نام و نام خانوادگی را وارد کنید."
    );

    fullNameInput?.focus();
    return;
  }

  // Phone
  if (!/^09\d{9}$/.test(phone)) {
    showMessage(
      "شماره موبایل باید مانند 09123456789 باشد."
    );

    phoneInput?.focus();
    return;
  }

  // Address
  if (!address) {
    showMessage(
      "آدرس تحویل را وارد کنید."
    );

    addressInput?.focus();
    return;
  }

  // Cart
  if (!cart.length) {
    showMessage(
      "سبد خرید خالی است."
    );

    return;
  }

  // Rules
  if (
    acceptRules &&
    !acceptRules.checked
  ) {
    showMessage(
      "لطفاً قوانین و مقررات را بپذیرید."
    );

    return;
  }

  // Login token
  const token = localStorage.getItem(
    "supabase_access_token"
  );

  if (!token) {
    showMessage(
      "ابتدا وارد حساب کاربری شوید."
    );

    return;
  }

  // Prepare items
  const items = cart
    .map((item) => {
      const product =
        typeof products !== "undefined"
          ? products.find(
              (p) => p.id === item.id
            )
          : null;

      if (!product) return null;

      return {
        product_id: product.id,
        product_name: product.name,
        unit_price: Number(product.price || 0),
        quantity: Number(item.qty || 1)
      };
    })
    .filter(Boolean);

  if (!items.length) {
    showMessage(
      "محصول معتبر در سبد خرید پیدا نشد."
    );

    return;
  }

  // Disable button
  if (payButton) {
    payButton.disabled = true;
    payButton.textContent =
      "⏳ در حال ثبت سفارش...";
  }

  try {
    const response = await fetch(
      TEST_CHECKOUT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": SUPABASE_KEY
        },

        body: JSON.stringify({
          name: fullName,
          phone: phone,
          address: address,
          items: items
        })
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        "پاسخ نامعتبر از سرور دریافت شد."
      );
    }

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error ||
          "ثبت سفارش انجام نشد."
      );
    }

    // Clear cart after successful order creation
    localStorage.removeItem(
      "moghayesechi_cart"
    );

    /*
      Edge Function باید payment_url
      را برگرداند.
    */

    if (!result.payment_url) {
      throw new Error(
        "لینک پرداخت از سرور دریافت نشد."
      );
    }

    // Redirect to payment/test checkout
    window.location.href =
      result.payment_url;

  } catch (error) {
    console.error(
      "Checkout Error:",
      error
    );

    showMessage(
      "❌ " +
        (error.message ||
          "خطا در ثبت سفارش")
    );

    if (payButton) {
      payButton.disabled = false;
      payButton.textContent =
        "💳 پرداخت آزمایشی";
    }
  }
}

// -------------------------
// Events
// -------------------------

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

// -------------------------
// Initial render
// -------------------------

renderOrder();
