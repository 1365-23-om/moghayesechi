const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

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
   خواندن سبد
========================= */

function readCart() {
  try {
    const value = JSON.parse(
      localStorage.getItem(
        "moghayesechi_cart"
      ) || "[]"
    );

    return Array.isArray(value)
      ? value
      : [];

  } catch (error) {
    console.error(
      "Cart error:",
      error
    );

    return [];
  }
}


/* =========================
   نمایش سفارش
========================= */

function renderOrder() {
  cart = readCart();

  if (
    !orderItems ||
    !productsTotal ||
    !orderTotal
  ) {
    return;
  }

  if (!cart.length) {

    orderItems.innerHTML =
      "<p>🛒 سبد خرید خالی است.</p>";

    productsTotal.textContent =
      "۰ تومان";

    orderTotal.textContent =
      "۰ تومان";

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
            p =>
              Number(p.id) ===
              Number(item.id)
          )
        : null;

    if (!product) {
     
