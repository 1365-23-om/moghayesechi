const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const CREATE_ORDER_URL =
  `${SUPABASE_URL}/functions/v1/create-order`;

const ZARINPAL_CREATE_URL =
  `${SUPABASE_URL}/functions/v1/zarinpal-create`;

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

let cart = JSON.parse(
  localStorage.getItem("moghayesechi_cart") || "[]"
);

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = type;
}

function formatPrice(price) {
  return Number(price || 0)
    .toLocaleString("fa-IR") + " تومان";
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderOrder() {
  if (!cart.length) {
    orderItems.innerHTML =
      "<p>🛒 سبد خرید خالی است.</p>";

    payButton.disabled = true;

    productsTotal.textContent =
      "۰ تومان";

    orderTotal.textContent =
      "۰ تومان";

    return;
  }

  let total = 0;

  orderItems.innerHTML = cart.map(item => {
    const product =
      products.find(p => p.id === item.id);

    if (!product) return "";

    const quantity =
      Number(item.qty || 1);

    const subtotal =
      Number(product.price) * quantity;

    total += subtotal;

    return `
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
          ${formatPrice(product.price)}
        </div>

        <div>
          مبلغ:
          <strong>
            ${formatPrice(subtotal)}
          </strong>
        </div>
      </div>
    `;
  }).join("");

  productsTotal.textContent =
    formatPrice(total);

  orderTotal.textContent =
    formatPrice(total);
}

async function createOrder() {

  const fullName =
    fullNameInput.value.trim();

  const phone =
    phoneInput.value.trim();

  const address =
    addressInput.value.trim();

  if (!fullName) {
    showMessage(
      "نام و نام خانوادگی را وارد کنید."
    );
    fullNameInput.focus();
    return;
  }

  if (!phone) {
    showMessage(
      "شماره موبایل را وارد کنید."
    );
    phoneInput.focus();
    return;
  }

  if (!/^09\d{9}$/.test(phone)) {
    showMessage(
      "شماره موبایل باید مانند 09123456789 باشد."
    );
    phoneInput.focus();
    return;
  }

  if (!address) {
    showMessage(
      "آدرس تحویل را وارد کنید."
    );
    addressInput.focus();
    return;
  }

  if (!cart.length) {
    showMessage(
      "سبد خرید خالی است."
    );
    return;
  }

  if (!acceptRules.checked) {
    showMessage(
      "لطفاً قوانین و مقررات را بپذیرید."
    );
    return;
  }

  const token =
    localStorage.getItem(
      "supabase_access_token"
    );

  if (!token) {
    showMessage(
      "ابتدا وارد حساب کاربری شوید."
    );
    return;
  }

  const items = cart.map(item => {

    const product =
      products.find(
        p => p.id === item.id
      );

    if (!product) return null;

    return {
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: Number(item.qty || 1)
    };

  }).filter(Boolean);

  if (!items.length) {
    showMessage(
      "محصول معتبر در سبد خرید پیدا نشد."
    );
    return;
  }

  payButton.disabled = true;

  payButton.textContent =
    "⏳ در حال ثبت سفارش...";

  try {

    const response =
      await fetch(
        CREATE_ORDER_URL,
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

          body: JSON.stringify({
            full_name: fullName,
            phone: phone,
            address: address,
            items: items
          })
        }
      );

    const result =
      await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error ||
        "ثبت سفارش انجام نشد."
      );
    }

    payButton.textContent =
      "⏳ انتقال به زرین‌پال...";

    const paymentResponse =
      await fetch(
        ZARINPAL_CREATE_URL,
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

          body: JSON.stringify({
            order_id:
              result.order.id
          })
        }
      );

    const payment =
      await paymentResponse.json();

    if (
      !paymentResponse.ok ||
      !payment.ok ||
      !payment.payment_url
    ) {
      throw new Error(
        payment.error ||
        "ایجاد درگاه پرداخت انجام نشد."
      );
    }

    showMessage(
      "در حال انتقال به درگاه زرین‌پال...",
      "success"
    );

    localStorage.removeItem(
      "moghayesechi_cart"
    );

    window.location.href =
      payment.payment_url;

  } catch (error) {

    console.error(error);

    showMessage(
      "❌ " + error.message
    );

    payButton.disabled = false;

    payButton.textContent =
      "💳 پرداخت با زرین‌پال";
  }
}

payButton.addEventListener(
  "click",
  createOrder
);

backButton.addEventListener(
  "click",
  () => {
    location.href = "index.html";
  }
);

renderOrder();
