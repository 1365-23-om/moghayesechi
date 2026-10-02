const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const FUNCTION_URL =
  `${SUPABASE_URL}/functions/v1/admin-orders`;

async function getFreshAccessToken() {
  let accessToken =
    localStorage.getItem("supabase_access_token");

  const refreshToken =
    localStorage.getItem("supabase_refresh_token");

  if (!refreshToken) {
    return accessToken;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      }
    );

    const data = await response.json();

    if (response.ok && data.access_token) {
      localStorage.setItem(
        "supabase_access_token",
        data.access_token
      );

      if (data.refresh_token) {
        localStorage.setItem(
          "supabase_refresh_token",
          data.refresh_token
        );
      }

      accessToken = data.access_token;
    }
  } catch (error) {
    console.error("Token refresh error:", error);
  }

  return accessToken;
}

document.addEventListener(
  "DOMContentLoaded",
  loadAdminOrders
);

async function loadAdminOrders() {
  const message =
    document.getElementById("adminMessage");

  const container =
    document.getElementById("adminOrders");

  message.textContent =
    "⏳ در حال بررسی ورود...";

  const token =
    await getFreshAccessToken();

  if (!token) {
    message.textContent =
      "❌ ابتدا وارد حساب مدیر شوید.";
    return;
  }

  try {
    const response = await fetch(
      FUNCTION_URL,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "apikey": SUPABASE_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        `خطای ${response.status}`
      );
    }

    if (!data.ok) {
      throw new Error(
        data.error ||
        "دریافت سفارش‌ها ناموفق بود."
      );
    }

    renderOrders(
      data.orders || []
    );

  } catch (error) {
    console.error(error);

    message.textContent =
      "❌ " + error.message;
  }
}

function renderOrders(orders) {
  const message =
    document.getElementById("adminMessage");

  const container =
    document.getElementById("adminOrders");

  if (!orders.length) {
    message.textContent =
      "📦 سفارشی وجود ندارد.";
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

    card.innerHTML = `
      <h3>📦 سفارش</h3>

      <p>
        <strong>شماره سفارش:</strong>
        ${order.id}
      </p>

      <p>
        <strong>مبلغ:</strong>
        ${Number(order.total_amount || 0)
          .toLocaleString("fa-IR")} تومان
      </p>

      <p>
        <strong>وضعیت:</strong>
        ${order.status}
      </p>

    <select
  onchange="changeStatus('${order.id}', this.value)"
  style="padding:10px;border-radius:8px"
>
  <option value="pending">
    در انتظار
  </option>

  <option value="confirmed">
    تأیید شده
  </option>

  <option value="shipped">
    ارسال شده
  </option>

  <option value="delivered">
    تحویل شده
  </option>

  <option value="cancelled">
    لغو شده
  </option>
</select>
    `;

    container.appendChild(card);
  });
}

async function changeStatus(orderId, status) {
  const token =
    await getFreshAccessToken();

  if (!token) {
    alert("❌ نشست ورود منقضی شده است.");
    return;
  }

  try {
    const response = await fetch(
      FUNCTION_URL,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "apikey": SUPABASE_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: orderId,
          status: status
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error ||
        "تغییر وضعیت انجام نشد."
      );
    }

    alert("✅ وضعیت سفارش تغییر کرد.");

    loadAdminOrders();

  } catch (error) {
    alert("❌ " + error.message);
  }
}
