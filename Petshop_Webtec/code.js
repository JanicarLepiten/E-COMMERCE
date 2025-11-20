document.addEventListener("DOMContentLoaded", function () {
    /* ---------------- SLIDESHOW ---------------- */
    let currentSlide = 0;
    const slides = document.querySelectorAll(".slide");

    function showSlide(index) {
        if (!slides || slides.length === 0) return;
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });
    }

    window.nextSlide = function () {
        if (!slides || slides.length === 0) return;
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    };

    window.prevSlide = function () {
        if (!slides || slides.length === 0) return;
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    };
    showSlide(currentSlide);

    /* ---------------- NEW: SORTING LOGIC ---------------- */
    const sortSelect = document.getElementById('sort-select');
    const filterButton = document.querySelector('.filter-button');
    const productsContainer = document.querySelector('.products-list-container') || document.querySelector('.product-display') || document.querySelector('main');

    function getProductValue(product, sortBy) {
        const priceText = product.querySelector('.price')?.textContent || '₱0.00';
        const name = product.querySelector('h3')?.textContent || '';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

        switch (sortBy) {
            case 'price-low-high':
                return price;
            case 'price-high-low':
                return price;
            case 'newest':
                return name;
            case 'recommended':
            default:
                return 0;
        }
    }

    function applyCurrentSort() {
        if (!productsContainer) return;

        let products = Array.from(productsContainer.querySelectorAll('.product'));
        products = products.filter(p => p.style.display !== 'none');
        
        const sortBy = sortSelect.value;

        if (sortBy === 'recommended') {
            return;
        }

        products.sort((a, b) => {
            const valA = getProductValue(a, sortBy);
            const valB = getProductValue(b, sortBy);

            if (sortBy === 'price-low-high') {
                return valA - valB;
            } else if (sortBy === 'price-high-low') {
                return valB - valA;
            } else {
                return String(valA).localeCompare(String(valB));
            }
        });

        products.forEach(product => productsContainer.appendChild(product));
    }
    
    window.applyCurrentSort = applyCurrentSort;
    
    if (sortSelect) {
        sortSelect.addEventListener('change', applyCurrentSort);
    }
    
    if (filterButton) {
        filterButton.addEventListener('click', function() {
            console.log("Filter button clicked. Opening filter UI...");
            alert("Filter UI needs to be implemented here!");
        });
    }

    /* ---------------- PRODUCT CATEGORY FILTER ---------------- */
    function filterProducts(category) {
        const products = document.querySelectorAll('.product');
        products.forEach(product => {
            if (category === 'all' || product.classList.contains(category)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
        applyCurrentSort(); 
    }
    window.filterProducts = filterProducts;

    /* ---------------- CART, CHECKOUT & ORDER ---------------- */
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cartCount");
    const cartFlyout = document.getElementById("cart-flyout");
    const cartTotal = document.getElementById("cart-total");
    const checkoutFlyout = document.getElementById("checkout-flyout");
    const checkoutItems = document.getElementById("checkout-items");
    const checkoutProductsTotal = document.getElementById("checkout-products-total");
    const checkoutOverallTotal = document.getElementById("checkout-overall-total");
    let selectedCheckoutIndexes = [];
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function updateCartCount() {
        const totalItemsInCart = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (cartCount) cartCount.textContent = totalItemsInCart;
    }

    function calculateTotal() {
        let total = 0;
        document.querySelectorAll(".cart-checkbox:checked").forEach(cb => {
            total += parseFloat(cb.dataset.price || 0);
        });
        if (cartTotal) cartTotal.textContent = total.toFixed(2);
    }

    function renderCart() {
        cartItemsContainer.innerHTML = "";
        if (!cart || cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            if (cartTotal) cartTotal.textContent = "0.00";
            return;
        }

        cart.forEach((item, index) => {
            const unitPriceStr = (item.price || "₱0.00").toString().replace('₱', '');
            const unitPrice = parseFloat(unitPriceStr) || 0;
            const quantity = item.quantity || 1;
            const itemTotalPrice = unitPrice * quantity;

            const itemDiv = document.createElement("div");
            itemDiv.className = "cart-item";
            itemDiv.innerHTML = `
                <input type="checkbox" class="cart-checkbox" 
                        data-index="${index}" 
                        data-price="${itemTotalPrice.toFixed(2)}" />
                <img src="${item.image}" alt="product">
                <div style="flex:1; text-align:left;">
                    <h4>${item.name}</h4>
                    <p>${item.price} x ${quantity} = ₱${itemTotalPrice.toFixed(2)}</p>
                </div>
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        cartItemsContainer.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = Number(e.currentTarget.dataset.index);
                if (!Number.isNaN(idx)) {
                    cart.splice(idx, 1);
                    saveCart();
                    renderCart();
                    updateCartCount();
                }
            });
        });

        cartItemsContainer.querySelectorAll(".cart-checkbox").forEach(cb => {
            cb.addEventListener("change", calculateTotal);
        });
        calculateTotal();
    }

    /* ---------------- EVENT DELEGATION FOR QUANTITY AND ADD TO CART ---------------- */
    if (productsContainer) {
        productsContainer.addEventListener("click", (e) => {
            const target = e.target;

            // Quantity buttons
            if (target.classList.contains("qty-btn")) {
                const qtyValueSpan = target.closest(".quantity-control")?.querySelector(".qty-value");
                if (!qtyValueSpan) return;

                let value = parseInt(qtyValueSpan.textContent, 10);
                if (target.classList.contains("minus")) {
                    if (value > 1) {
                        qtyValueSpan.textContent = value - 1;
                    }
                } else if (target.classList.contains("plus")) {
                    qtyValueSpan.textContent = value + 1;
                }
            }

            // Add to cart button
            if (target.classList.contains("addcart")) {
                const product = target.closest(".product");
                if (!product) return;

                const name = product.querySelector("h3")?.textContent || "No name";
                const price = product.querySelector(".price")?.textContent || "0.00";
                const img = product.querySelector("img")?.src || "";
                const quantity = parseInt(product.querySelector(".qty-value")?.textContent || "1", 10);

                // Check if product already in cart
                const existingIndex = cart.findIndex(item => item.name === name);
                if (existingIndex > -1) {
                    // Update quantity
                    cart[existingIndex].quantity += quantity;
                } else {
                    cart.push({ name, price, image: img, quantity });
                }

                saveCart();
                renderCart();
                updateCartCount();
                if (cartFlyout) cartFlyout.classList.add("open");
            }
        });
    }

    // toggle cart flyout
    window.toggleCartFlyout = function () {
        if (!cartFlyout) return;
        cartFlyout.classList.toggle("open");
        renderCart();
    };

    // Checkout button
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            const checkedBoxes = Array.from(document.querySelectorAll(".cart-checkbox:checked"));
            if (checkedBoxes.length === 0) {
                alert("Please select items to checkout.");
                return;
            }
            const selected = [];
            selectedCheckoutIndexes = checkedBoxes.map(cb => Number(cb.dataset.index)).filter(i => !Number.isNaN(i));
            selectedCheckoutIndexes = Array.from(new Set(selectedCheckoutIndexes));
            selectedCheckoutIndexes.forEach(i => {
                const item = cart[i];
                if (item) selected.push({ ...item, index: i });
            });
            renderCheckout(selected);
            if (cartFlyout) cartFlyout.classList.remove("open");
            if (checkoutFlyout) checkoutFlyout.classList.add("open");
        });
    }

    function renderCheckout(selectedItems) {
        checkoutItems.innerHTML = "";
        let productsTotal = 0;
        selectedItems.forEach(item => {
            const div = document.createElement("div");
            div.className = "cart-item";
            const unitPriceStr = (item.price || "₱0.00").toString().replace('₱', '');
            const unitPrice = parseFloat(unitPriceStr) || 0;
            const quantity = item.quantity || 1;
            const itemTotalPrice = unitPrice * quantity;

            div.innerHTML = `
                <img src="${item.image}" alt="">
                <div style="flex:1; text-align:left;">
                    <h4>${item.name}</h4>
                    <p>${item.price} x ${quantity} = ₱${itemTotalPrice.toFixed(2)}</p>
                </div>
            `;
            checkoutItems.appendChild(div);
            productsTotal += itemTotalPrice;
        });
        
        const shippingFee = 70;
        if (checkoutProductsTotal) checkoutProductsTotal.textContent = productsTotal.toFixed(2);
        if (checkoutOverallTotal) checkoutOverallTotal.textContent = (productsTotal + shippingFee).toFixed(2);
    }

    // toggle for checkout flyout close button
    window.toggleCheckoutFlyout = function () {
        if (!checkoutFlyout) return;
        checkoutFlyout.classList.toggle("open");
    };

    // Order Now: removes the previously selected items
    window.orderNow = function () {
        if (!selectedCheckoutIndexes || selectedCheckoutIndexes.length === 0) {
            alert("No items selected to order.");
            return;
        }
        const descending = selectedCheckoutIndexes.slice().map(Number).sort((a,b)=>b-a);
        descending.forEach(idx => {
            if (!Number.isNaN(idx) && idx >= 0 && idx < cart.length) {
                cart.splice(idx, 1);
            }
        });
        selectedCheckoutIndexes = [];
        saveCart();
        renderCart();
        updateCartCount();
        if (checkoutFlyout) checkoutFlyout.classList.remove("open");
        showSuccessMessage("Your order is successful!");
    };

    function showSuccessMessage(text) {
        const old = document.getElementById("successMessage");
        if (old) old.remove();
        const msg = document.createElement("div");
        msg.id = "successMessage";
        msg.textContent = text || "Order successful!";
        msg.style.position = "fixed";
        msg.style.top = "50%";
        msg.style.left = "50%";
        msg.style.transform = "translate(-50%, -50%)";
        msg.style.background = "#4caf50";
        msg.style.color = "white";
        msg.style.padding = "16px 28px";
        msg.style.borderRadius = "10px";
        msg.style.zIndex = 2000;
        document.body.appendChild(msg);
        setTimeout(() => {
            msg.remove();
        }, 5000);
    }

    // initialize UI
    renderCart();
    updateCartCount();
});

/* ---------------- SEARCH (Separate Block - Modified for Sort Integration) ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  function filterProducts() {
    const query = searchInput.value.toLowerCase().trim();
    const products = document.querySelectorAll(".product"); // get products live
    products.forEach(product => {
      const name = product.querySelector("h3")?.textContent.toLowerCase() || '';
      product.style.display = name.includes(query) ? "block" : "none";
    });
    if (query === "") {
      products.forEach(product => product.style.display = "block");
    }

    if (window.applyCurrentSort) {
      window.applyCurrentSort();
    }
  }

  searchInput.addEventListener("input", filterProducts);
  searchBtn.addEventListener("click", filterProducts);
});

//PRODUCT DETAILS 
document.addEventListener("DOMContentLoaded", () => {
  const product = JSON.parse(localStorage.getItem("selectedProduct"));

  if (product) {
    const img = document.getElementById("product-image");
    const name = document.getElementById("productName");
    const price = document.getElementById("productPrice");
    const description = document.getElementById("productDescription");

    img.src = product.image;
    img.alt = product.name;
    name.textContent = product.name;
    price.textContent = `₱${product.price.toFixed(2)}`;
    description.textContent = product.description || "No description available.";
  } else {
    console.error("No product data found in localStorage");
  }
});
