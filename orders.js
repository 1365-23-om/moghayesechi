document.addEventListener("DOMContentLoaded", function () {

  const button = document.getElementById("myOrdersButton");
  const list = document.getElementById("ordersList");

  const SUPABASE_URL =
    "https://evvdggckoalesyyyqhqm.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

  function price(value) {
    return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
  }

  async function loadOrders() {

    const token =
      localStorage.getItem("supabase_access_token");

    if (!token) {
      list.innerHTML =
        "<p>❌ ابتدا وارد حساب کاربری شوید.</p>";
      return;
    }

    list.innerHTML =
      "<p>⏳ در حال دریافت سفارش‌ها...</p>";

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
        throw new Error(
          result.error || "خطا در دریافت سفارش‌ها"
        );
      }

      if (!result.orders || result.orders.length === 0) {

        list.innerHTML =
          "<p>📦 هنوز سفارشی ثبت نکرده‌اید.</p>";

        return;
      }

      list.innerHTML = "";

      result.orders.forEach(function (order) {

        const card =
          document.createElement("div");

        card.className = "order-card";

        const date =
          new Date(order.created_at)
            .toLocaleString("fa-IR");

        let items = "";

        (order.order_items || []).forEach(
          function (item) {

            items += `
              <div class="order-item">
                <strong>
                  ${item.product_name}
                </strong>

                <span>
                  تعداد: ${item.quantity}
                </span>

                <span>
                  ${price(item.subtotal)}
                </span>
              </div>
            `;
          }
        );

        card.innerHTML = `
          <h3>📦 سفارش</h3>

          <p>
            شماره سفارش:
            <strong>${order.id}</strong>
          </p>

          <p>
            وضعیت:
            <strong>${order.status}</strong>
          </p>

          <p>
            تاریخ:
            ${date}
          </p>

          <hr>

          ${items}

          <hr>

          <p>
            <strong>
              مبلغ کل:
              ${price(order.total_amount)}
            </strong>
          </p>
        `;

        list.appendChild(card);

      });

    } catch (error) {

      console.error(error);

      list.innerHTML = `
        <p>
          ❌ دریافت سفارش‌ها انجام نشد.
        </p>

        <p>
          ${error.message}
        </p>
      `;
    }
  }

  if (button) {
    button.addEventListener(
      "click",
      loadOrders
    );
  }

});
