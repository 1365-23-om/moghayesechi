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
    checkout();
  }
}

function checkout() {
  const name = prompt("نام و نام خانوادگی:");

  if (!name) return;

  const phone = prompt("شماره موبایل:");

  if (!phone) return;

  const address = prompt("آدرس تحویل:");

  if (!address) return;

  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + product.price * item.qty;
  }, 0);

  alert(
    "✅ سفارش شما ثبت شد.\n\n" +
    "نام: " + name + "\n" +
    "موبایل: " + phone + "\n" +
    "مبلغ سفارش: " + formatPrice(total) +
    "\n\nدرگاه پرداخت در مرحله بعد اضافه می‌شود."
  );

  cart = [];
  saveCart();
}

searchInput.addEventListener("input", function () {
  const text = this.value.trim().toLowerCase();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(text) ||
    product.category.toLowerCase().includes(text)
  );

  showProducts(filtered);
});

cartButton.addEventListener("click", openCart);

showProducts();
updateCart();
