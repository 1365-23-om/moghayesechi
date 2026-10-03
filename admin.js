const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const FUNCTION_URL =
  `${SUPABASE_URL}/functions/v1/admin-orders`;


/* =========================
   دریافت سفارش‌ها
========================= */

async function loadAdminOrders() {
  const message =
    document.getElementById("adminMessage");

  const container =
    document.getElementById("adminOrders");

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
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
        `خطای ${response.status}`
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
    console.error(error);

    message.textContent =
      "❌ " + error.message;
  }
}


/* =========================
   نمایش سفارش‌ها
========================= */

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
      border-radius:14px;
      box-shadow:0 3px 10px rgba(0,0,0,.06);
      direction:rtl;
      text-align:right;
    `;


    /* =========================
       اطلاعات مشتری
    ========================= */

    const customer =
      order.customers || {};

    const fullName =
      customer.full_name ||
      "ثبت نشده";

    const phone =
      customer.phone ||
      "ثبت نشده";

    const address =
      customer.address ||
      "ثبت نشده";


    /* =========================
       وضعیت
    ========================= */

    const statusLabels = {
      pending: "در انتظار",
      confirmed: "تأیید شده",
      shipped: "ارسال شده",
      delivered: "تحویل شده",
      cancelled: "لغو شده"
    };

    const statusText =
      statusLabels[order.status] ||
      order.status ||
      "نامشخص";


    /* =========================
       محصولات
    ========================= */

    const items =
      order.order_items || [];

    let itemsHTML = "";

    if (!items.length) {

      itemsHTML = `
        <p style="
          color:#777;
          margin:10px 0;
        ">
          📦 محصولی برای این سفارش ثبت نشده است.
        </p>
      `;

    } else {

      itemsHTML = `
        <div style="
          margin-top:15px;
          border-top:1px solid #eee;
          padding-top:15px;
        ">

          <h4 style="
            margin:0 0 12px;
          ">
            🛍 محصولات سفارش
          </h4>

          ${items.map(item => {

            const unitPrice =
              Number(
                item.unit_price || 0
              );

            const quantity =
              Number(
                item.quantity || 0
              );

            const subtotal =
              Number(
                item.subtotal ||
                unitPrice * quantity
              );

            return `
              <div style="
                background:#f8f8f8;
                padding:12px;
                margin:8px 0;
                border-radius:10px;
              ">

                <div style="
                  font-weight:bold;
                  margin-bottom:7px;
                ">
                  ${escapeHTML(
                    item.product_name ||
                    "محصول"
                  )}
                </div>

                <div>
                  🔢 تعداد:
                  <strong>
                    ${quantity.toLocaleString(
                      "fa-IR"
                    )}
                  </strong>
                </div>

                <div>
                  💰 قیمت واحد:
                  <strong>
                    ${unitPrice.toLocaleString(
                      "fa-IR"
                    )}
                    تومان
                  </strong>
                </div>

                <div>
                  💵 مبلغ:
                  <strong>
                    ${subtotal.toLocaleString(
                      "fa-IR"
                    )}
                    تومان
                  </strong>
                </div>

              </div>
            `;

          }).join("")}

        </div>
      `;
    }


    /* =========================
       ساخت کارت
    ========================= */

    card.innerHTML = `

      <h3 style="
        margin-top:0;
        color:#222;
      ">
        📦 سفارش
      </h3>


      <div style="
        background:#f7f7f7;
        padding:12px;
        border-radius:10px;
        margin-bottom:12px;
      ">

        <p>
          <strong>
            شماره سفارش:
          </strong>

          <br>

          <small>
            ${order.id}
          </small>
        </p>

        <p>
          <strong>
            👤 نام مشتری:
          </strong>

          ${escapeHTML(fullName)}
        </p>

        <p>
          <strong>
            📱 شماره تلفن:
          </strong>

          ${escapeHTML(phone)}
        </p>

        <p>
          <strong>
            📍 آدرس:
          </strong>

          ${escapeHTML(address)}
        </p>

        <p>
          <strong>
            💳 مبلغ کل:
          </strong>

          ${Number(
            order.total_amount || 0
          ).toLocaleString("fa-IR")}

          تومان
        </p>

        <p>
          <strong>
            📌 وضعیت فعلی:
          </strong>

          ${statusText}
        </p>

      </div>


      ${itemsHTML}


      <div style="
        margin-top:18px;
        padding-top:15px;
        border-top:1px solid #ddd;
      ">

        <label>
          <strong>
            تغییر وضعیت:
          </strong>
        </label>

        <select
          onchange="changeStatus(
            '${order.id}',
            this.value
          )"
          style="
            width:100%;
            padding:11px;
            margin-top:8px;
            border:1px solid #ccc;
            border-radius:8px;
            font-size:15px;
          "
        >

          <option
            value="pending"
            ${order.status === "pending"
              ? "selected"
              : ""}
          >
            در انتظار
          </option>

          <option
            value="confirmed"
            ${order.status === "confirmed"
              ? "selected"
              : ""}
          >
            تأیید شده
          </option>

          <option
            value="shipped"
            ${order.status === "shipped"
              ? "selected"
              : ""}
          >
            ارسال شده
          </option>

          <option
            value="delivered"
            ${order.status === "delivered"
              ? "selected"
              : ""}
          >
            تحویل شده
          </option>

          <option
            value="cancelled"
            ${order.status === "cancelled"
              ? "selected"
              : ""}
          >
            لغو شده
          </option>

        </select>

      </div>

    `;

    container.appendChild(card);
  });
}


/* =========================
   تغییر وضعیت سفارش
========================= */

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
      "❌ ابتدا وارد حساب مدیر شوید."
    );
    return;
  }

  try {

    const response =
      await fetch(
        FUNCTION_URL,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,

            apikey:
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

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.ok
    ) {
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

    console.error(error);

    alert(
      "❌ " + error.message
    );
  }
}


/* =========================
   جلوگیری از نمایش HTML
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
   شروع پنل
========================= */

document.addEventListener(
  "DOMContentLoaded",
  loadAdminOrders
);
