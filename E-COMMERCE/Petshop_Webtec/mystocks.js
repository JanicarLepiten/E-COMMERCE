fetch("stocks.json")
  .then(res => res.json())
  .then(products => {
    const container = document.getElementById("products-container");
    
    products.forEach(product => {
      const card = document.createElement("div");
      card.className = `product ${product.category}`;

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h3>${product.name}</h3>
        <p class="price">₱${product.price.toFixed(2)}</p>
        <div class="product-actions">
          <div class="quantity-control">
            <button class="qty-btn minus">–</button>
            <span class="qty-value">1</span>
            <button class="qty-btn plus">+</button>
          </div>
          <button class="addcart">ADD TO CART</button>
        </div>
      `;

      // When image is clicked → go to product details page
      const img = card.querySelector(".product-image");
      img.addEventListener("click", () => {
        // Store product details in localStorage
        localStorage.setItem("selectedProduct", JSON.stringify(product));

        // Redirect to details page
        window.location.href = "prodDetails.html";
      });

      container.appendChild(card);
    });
  });
