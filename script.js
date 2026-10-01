const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const cartButton = document.getElementById("cartButton");

let cart = JSON.parse(localStorage.getItem("moghayesechi_cart") || "[]");

function formatPrice(price) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

function saveCart() {
  localStorage.setItem("moghayesechi_cart", JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  cartButton.textContent = `🛒 سبد خرید (${cart.reduce((sum, item) => sum + item.qty, 0)})`;
}

function showProducts(list = products) {
  productGrid.innerHTML = "";

  list.forEach(product => {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <div class="product-image">${product.icon}</div>

      <div class="product-content">
        <h3>${product.name}</h3>
        <small>دسته: ${product.category}</small>

        <span class="price">
          ${formatPrice(product.price)}
        </span>

        <button class="add-button" onclick="addToCart(${product.id})">
          افزودن به سبد 🛒
        </button>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

function addToCart(id) {
  const item = cart.find(item => item.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({ id: id, qty: 1 });
  }

  saveCart();
  alert("محصول به سبد خرید اضافه شد ✅");
}

function openCart() {
  if (cart.length === 0) {
    alert("سبد خرید خالی است.");
    return;
  }

  let total = 0;
  let message = "🛒 سبد خرید شما\n\n";

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const subtotal = product.price * item.qty;

    total += subtotal;

    message +=
      `${product.name}\n` +
      `تعداد: ${item.qty}\n` +
      `مبلغ: ${formatPrice(subtotal)}\n\n`;
  });

  message += `----------------\nمبلغ کل: ${formatPrice(total)}`;

  const choice = confirm(
    message +
    "\n\nبرای ادامه ثبت سفارش، OK را بزنید."
  );

  if (choice) {
    async function checkout() {
  const name = prompt("نام و نام خانوادگی:");
  if (!name) return;

  const phone = prompt("شماره موبایل:");
  if (!phone) return;

  const address = prompt("آدرس تحویل:");
  if (!address) return;

  if (!cart.length) {
    alert("سبد خرید خالی است.");
    return;
  }

  const SUPABASE_URL = "https://evvdggckoalesyyyqhqm.supabase.co";
  const SUPABASE_KEY = "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

  const items = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    return {
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: item.qty
    };
  });

  try {
    alert("برای ثبت سفارش ابتدا باید وارد حساب کاربری شوید.");

    const token = localStorage.getItem("supabase_access_token");

    if (!token) {
      alert("ورود کاربر هنوز در سایت فعال نشده است.");
      return;
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({
          full_name: name,
          phone: phone,
          address: address,
          items: items
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "خطا در ثبت سفارش");
    }

    alert(
      "✅ سفارش با موفقیت ثبت شد.\n\n" +
      "شماره سفارش:\n" +
      result.order.id
    );

    cart = [];
    saveCart();

  } catch (error) {
    console.error(error);
    alert("❌ ثبت سفارش انجام نشد:\n" + error.message);
  }
}
