const myOrdersButton = document.getElementById("myOrdersButton");
const ordersList = document.getElementById("ordersList");

const SUPABASE_URL = "https://evvdggckoalesyyyqhqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

function formatOrderPrice(price) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

async function loadMyOrders() {
  const token = localStorage.getItem("supabase_access_token");

  if (!token) {
    ordersList.innerHTML = "<p>ابتدا وارد حساب کاربری شوید.</p>";
    return;
  }

  ordersList.innerHTML = "<p>در حال دریافت سفارش‌ها...</p>";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/my-orders`,
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
      throw new Error(result.error || "خطا در دریافت سفارش‌ها");
    }

    if (!result.orders.length) {
      ordersList.innerHTML = "<p>هنوز سفارشی ثبت نکرده‌اید.</p>";
      return;
    }

    ordersList.innerHTML = "";

    result.orders.forEach(order => {
      const box = document.createElement("div");
      box.className = "order-card";

      const date = new Date(order.created_at).toLocaleString("fa-IR");

      let itemsHTML = "";

      order.order_items.forEach(item => {
        itemsHTML += `
          <div class="order-item">
            <strong>${item.product_name}</strong>
            <span>
              تعداد: ${item.quantity}
            </span>
            <span>
              ${formatOrderPrice(item.subtotal)}
            </span>
          </div>
        `;
      });

      box.innerHTML = `
        <h3>📦 سفارش ${order.id}</h3>

        <p>
          وضعیت:
          <strong>${order.status}</strong>
        </p>

        <p>
          تاریخ:
          ${date}
        </p>

        <div>
          ${itemsHTML}
        </div>

        <hr>

        <strong>
          مبلغ کل:
          ${formatOrderPrice(order.total_amount)}
        </strong>
      `;

      ordersList.appendChild(box);
    });

  } catch (error) {
    console.error(error);

    ordersList.innerHTML = `
      <p>
        ❌ دریافت سفارش‌ها انجام نشد:
        ${error.message}
      </p>
    `;
  }
}

if (myOrdersButton) {
  myOrdersButton.addEventListener("click", loadMyOrders);
}
