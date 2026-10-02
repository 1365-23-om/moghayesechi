document.addEventListener("DOMContentLoaded", loadAdminOrders);

const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const ADMIN_EMAIL = "dansbet31@gmail.com";

async function loadAdminOrders() {

  const message =
    document.getElementById("adminMessage");

  const container =
    document.getElementById("adminOrders");

  const token =
    localStorage.getItem("supabase_access_token");

  if (!token) {
    message.textContent =
      "❌ ابتدا با حساب مدیر وارد سایت شوید.";
    return;
  }

  try {

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/admin-orders`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "apikey": SUPABASE_KEY
        }
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error || "خطا در دریافت سفارش‌ها"
      );
    }

    message.textContent =
      `✅ ${result.orders.length} سفارش پیدا شد.`;

    container.innerHTML = "";

    result.orders.forEach(order => {

      const card =
        document.createElement("div");

      card.className = "order-card";

      const date =
        new Date(order.created_at)
          .toLocaleString("fa-IR");

      card.innerHTML = `
        <div style="
          padding:20px;
          margin:15px 0;
          border:1px solid #ddd;
          border-radius:12px;
          background:#fff;
        ">

          <h3>📦 سفارش</h3>

          <p>
            <strong>شماره:</strong>
            ${order.id}
          </p>

          <p>
            <strong>مشتری:</strong>
            ${order.customers?.full_name || "-"}
          </p>

          <p>
            <strong>موبایل:</strong>
            ${order.customers?.phone || "-"}
          </p>

          <p>
            <strong>تاریخ:</strong>
            ${date}
          </p>

          <p>
            <strong>مبلغ:</strong>
            ${new Intl.NumberFormat("fa-IR")
              .format(order.total_amount)} تومان
          </p>

          <p>
            <strong>وضعیت:</strong>
            ${order.status}
          </p>

          <label>تغییر وضعیت:</label>

          <select
            onchange="changeStatus('${order.id}', this.value)"
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

        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {

    console.error(error);

    message.textContent =
      "❌ " + error.message;
  }
}


async function changeStatus(orderId, status) {

  const token =
    localStorage.getItem("supabase_access_token");

  try {

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/admin-orders`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": SUPABASE_KEY
        },

        body: JSON.stringify({
          id: orderId,
          status: status
        })
      }
    );

    const result =
      await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error || "تغییر وضعیت انجام نشد"
      );
    }

    alert("✅ وضعیت سفارش تغییر کرد.");

  } catch (error) {

    alert(
      "❌ " + error.message
    );
  }
}
