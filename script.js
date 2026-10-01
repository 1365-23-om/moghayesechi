const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const cartButton = document.getElementById("cartButton");

let cart = [];

function formatPrice(price) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

function showProducts(list = products) {
  productGrid.innerHTML = "";

  list.forEach(product => {
    const card = document.createElement("div");

    card.className = "product";

    card.innerHTML = `
      <div class="product-image">
        ${product.icon}
      </div>

      <div class="product-content">
        <h3>${product.name}</h3>

        <small>
          دسته: ${product.category}
        </small>

        <span class="price">
          ${formatPrice(product.price)}
        </span>

        <button
          class="add-button"
          onclick="addToCart(${product.id})">
          افزودن به سبد
        </button>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);

  if (!product) return;

  cart.push(product);

  updateCart();

  alert("محصول به سبد خرید اضافه شد ✅");
}

function updateCart() {
  cartButton.textContent =
    `🛒 سبد خرید (${cart.length})`;
}

searchInput.addEventListener("input", function () {
  const searchText = this.value.toLowerCase().trim();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText) ||
    product.category.toLowerCase().includes(searchText)
  );

  showProducts(filteredProducts);
});

cartButton.addEventListener("click", function () {
  if (cart.length === 0) {
    alert("سبد خرید خالی است.");
    return;
  }

  const total = cart.reduce(
    (sum, product) => sum + product.price,
    0
  );

  alert(
    `تعداد کالا: ${cart.length}\n` +
    `مبلغ کل: ${formatPrice(total)}`
  );
});

showProducts();
updateCart();
