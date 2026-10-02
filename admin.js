
const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const FUNCTION_URL =
  `${SUPABASE_URL}/functions/v1/admin-orders`;

const message =
  document.getElementById("adminMessage");

const container =
  document.getElementById("adminOrders");


document.addEventListener(
  "DOMContentLoaded",
  loadAdminOrders
);


async function loadAdminOrders() {

  if (!message || !container) {
    return;
  }

  const token =
    localStorage.getItem(
      "supabase_access_token"
    );

  if (!token) {

    message.textContent =
      "❌ ابتدا وارد حساب مدیر شوید.";

    return;
  }

  message.textContent =
    "⏳ در حال دریافت سفارش‌ها...";

  try {

    const response = await fetch(
      FUNCTION_URL,
      {
        method: "GET",

        headers: {
          "Authorization":
            `Bearer ${token}`,

          "apikey":
            SUPABASE_KEY,

          "Content-Type":
            "application/json"
        }
      }
    );

    const text =
      await response.text();

    let result = {};

    try {
      result = JSON.parse(text);
    } catch {
      result = {
        error: text
      };
    }

    if (!response.ok) {

      throw new Error(
        result.error ||
        `خطای سرور: ${response.status}`
      );
    }

    if (!result.ok) {

      throw new Error(
        result.error ||
        "دریافت سفارش‌ها ناموفق بود."
      );
    }

    renderOrders(
      result.orders || []
    );

  } catch (error) {

    console.error(
      "admin-orders:",
      error
    );

    message.textContent =
      "❌ " + error.message;
  }
}


function renderOrders(orders) {

  if (orders.length === 0) {

    message.textContent =
      "📦 هنوز سفارشی وجود ندارد.";

    container.innerHTML = "";

    return;
  }

  message.textContent =
    `✅ ${orders.length} سفارش`;

  container.innerHTML = "";

  orders.forEach(order => {

    const card =
      document.createElement("div");

    card.style.cssText = `
      background:#fff;
      padding:20px;
      margin:15px 0;
      border:1px solid #ddd;
      border-radius:12px;
    `;

    const amount =
      new Intl.NumberFormat("fa-IR")
        .format(
          Number(order.total_amount || 0)
        );

    const date =
      order.created_at
        ? new Date(
            order.created_at
          ).toLocaleString("fa-IR")
        : "-";

    card.innerHTML = `
      <h3>📦 سفارش</h3>

      <p>
        <strong>شماره سفارش:</strong>
        ${escapeHtml(order.id)}
      </p>

      <p>
        <strong>مشتری:</strong>
        ${escapeHtml(order.customer_id || "-")}
      </p>

      <p>
        <strong>مبلغ:</strong>
        ${amount} تومان
      </p>

      <p>
        <strong>تاریخ:</strong>
        ${date}
      </p>

      <p>
        <strong>وضعیت:</strong>
        <span id="status-${order.id}">
          ${escapeHtml(order.status || "pending")}
        </span>
      </p>

      <select
        onchange="changeStatus('${order.id}', this.value)"
        style="
          padding:10px;
          border-radius:8px;
          margin-top:10px;
        "
      >

        <option value="pending"
          ${order.status === "pending" ? "selected" : ""}>
          در انتظار
        </option>

        <option value="confirmed"
          ${order.status === "confirmed" ? "selected" : ""}>
          تأیید شده
        </option>

        <option value="shipped"
          ${order.status === "shipped" ? "selected" : ""}>
          ارسال شده
        </option>

        <option value="delivered"
          ${order.status === "delivered" ? "selected" : ""}>
          تحویل شده
        </option>

        <option value="cancelled"
          ${order.status === "cancelled" ? "selected" : ""}>
          لغو شده
        </option>

      </select>
    `;

    container.appendChild(card);
  });
}


async function changeStatus(
  orderId,
  status
) {

  const token =
    localStorage.getItem(
      "supabase_access_token"
    );

  if (!token) {

    alert(
      "❌ نشست ورود شما منقضی شده است. دوباره وارد شوید."
    );

    return;
  }

  try {

    const response = await fetch(
      FUNCTION_URL,
      {
        method: "PATCH",

        headers: {
          "Authorization":
            `Bearer ${token}`,

          "apikey":
            SUPABASE_KEY,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          id: orderId,
          status: status
        })
      }
    );

    const text =
      await response.text();

    let result = {};

    try {
      result = JSON.parse(text);
    } catch {
      result = {
        error: text
      };
    }

    if (!response.ok) {

      throw new Error(
        result.error ||
        `خطای سرور: ${response.status}`
      );
    }

    if (!result.ok) {

      throw new Error(
        result.error ||
        "تغییر وضعیت انجام نشد."
      );
    }

    alert(
      "✅ وضعیت سفارش تغییر کرد."
    );

    await loadAdminOrders();

  } catch (error) {

    console.error(
      "changeStatus:",
      error
    );

    alert(
      "❌ " + error.message
    );
  }
}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
