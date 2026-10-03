const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const FUNCTION_URL =
  `${SUPABASE_URL}/functions/v1/admin-orders`;

async function loadAdminOrders() {
  const message = document.getElementById("adminMessage");
  const container = document.getElementById("adminOrders");

  const token =
    localStorage.getItem("supabase_access_token");

  if (!token) {
    message.textContent = "❌ ابتدا وارد حساب مدیر شوید.";
    return;
  }

  message.textContent = "⏳ در حال دریافت سفارش‌ها...";

  try {
    const response = await fetch(FUNCTION_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `خطای ${response.status}`
      );
    }

    if (!result.ok) {
      throw new Error(
        result.error || "دریافت سفارش‌ها ناموفق بود."
      );
    }

    renderOrders(result.orders || []);

  } catch (error) {
    console.error(error);
    message.textContent = "❌ " + error.message;
  }
}

function renderOrders(orders) {
  const message = document.getElementById("adminMessage");
  const container = document.getElementById("adminOrders");

  if (!orders.length) {
    message.textContent = "📦 سفارشی وجود ندارد.";
    container.innerHTML = "";
    return;
  }

  message.textContent =
    `✅ ${orders.length} سفارش`;

  container.innerHTML = "";

  orders.forEach(order => {
    const card = document.createElement("div");

    card.style.cssText = `
      background:#fff;
      padding:20px;
      margin:15px 0;
      border:1px solid #ddd;
      border-radius:12px;
    `;

    card.innerHTML = `
      <h3>📦 سفارش</h3>

      <p>
        <strong>شماره سفارش:</strong>
        ${order.id}
      </p>

      <p>
        <strong>مبلغ:</strong>
        ${Number(order.total_amount || 0).toLocaleString("fa-IR")}
        تومان
      </p>

      <p>
        <strong>وضعیت فعلی:</strong>
        ${order.status}
      </p>

      <select
        onchange="changeStatus('${order.id}', this.value)"
        style="padding:10px;border-radius:8px"
      >
        <option value="pending">در انتظار</option>
        <option value="confirmed">تأیید شده</option>
        <option value="shipped">ارسال شده</option>
        <option value="delivered">تحویل شده</option>
        <option value="cancelled">لغو شده</option>
      </select>
    `;

    container.appendChild(card);
  });
}

async function changeStatus(orderId, status) {
  const token =
    localStorage.getItem("supabase_access_token");

  if (!token) {
    alert("❌ ابتدا وارد حساب مدیر شوید.");
    return;
  }

  try {
    const response = await fetch(FUNCTION_URL, {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        id: orderId,
        status: status
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error || "تغییر وضعیت انجام نشد."
      );
    }

    alert("✅ وضعیت سفارش تغییر کرد.");

    loadAdminOrders();

  } catch (error) {
    alert("❌ " + error.message);
  }
}

document.addEventListener(
  "DOMContentLoaded",
  loadAdminOrders
);

console.log(
  "ADMIN JS NEW VERSION",
  localStorage.getItem("supabase_access_token")
);
