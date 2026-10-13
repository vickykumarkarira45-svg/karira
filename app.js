/**
 * DesiHut - Customer Facing Interactive Application Logic
 * Handles dynamic menu rendering, filtering, search, cart management, and WhatsApp order dispatch
 */

document.addEventListener("DOMContentLoaded", () => {
    // State
    let cart = [];
    let currentCategory = "all";
    let searchQuery = "";

    // DOM Elements
    const featuredGrid = document.getElementById("featuredGrid");
    const menuGrid = document.getElementById("menuGrid");
    const categoryTabs = document.getElementById("categoryTabs");
    const menuSearchInput = document.getElementById("menuSearchInput");
    
    // Cart Elements
    const openCartBtn = document.getElementById("openCartBtn");
    const closeCartBtn = document.getElementById("closeCartBtn");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartItemsList = document.getElementById("cartItemsList");
    const cartCountBadge = document.getElementById("cartCountBadge");
    const cartSubtotal = document.getElementById("cartSubtotal");
    const cartDelivery = document.getElementById("cartDelivery");
    const cartTotal = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    // Modal Elements
    const orderModal = document.getElementById("orderModal");
    const closeOrderModal = document.getElementById("closeOrderModal");
    const orderForm = document.getElementById("orderForm");
    const modalTotalAmount = document.getElementById("modalTotalAmount");

    // Mobile Toggle
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const nav = document.getElementById("navbar");

    // Initialize Store Information
    function applyStoreInfo() {
        const store = DesiHutData.getStoreInfo();
        const contactPhone = document.getElementById("contactPhone");
        const contactAddress = document.getElementById("contactAddress");
        const contactTimings = document.getElementById("contactTimings");

        if (contactPhone) {
            contactPhone.textContent = store.phone;
            contactPhone.href = `tel:${store.phone}`;
        }
        if (contactAddress) contactAddress.textContent = store.address;
        if (contactTimings) contactTimings.textContent = store.timing;
        if (cartDelivery) cartDelivery.textContent = `Rs. ${store.deliveryFee}`;
    }

    // Render Food Card HTML
    function createFoodCardHTML(item) {
        const isSoldOut = item.isAvailable === false;
        const spicySparks = item.spicyLevel > 0 
            ? `<div class="card-spicy-indicator"><i class="fa-solid fa-pepper-hot"></i> ${item.spicyLevel} Spiced</div>` 
            : "";

        return `
            <div class="portfolio-card ${isSoldOut ? 'card-sold-out' : ''}" data-id="${item.id}">
                <div class="card-img-wrapper">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'">
                    ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ''}
                    ${spicySparks}
                    ${isSoldOut ? `<div class="sold-out-tag">Sold Out</div>` : ''}
                </div>
                <div class="card-body">
                    <span class="card-category">${item.category.toUpperCase()}</span>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-desc">${item.description}</p>
                    <div class="card-footer">
                        <div class="card-price">
                            <span class="currency">Price (PKR)</span>
                            <span class="amount">Rs. ${item.price.toLocaleString()}</span>
                        </div>
                        <button class="btn-add-cart" onclick="DesiHutApp.addToCart('${item.id}')" ${isSoldOut ? 'disabled' : ''}>
                            <i class="fa-solid fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Featured Items (Portfolio Showcase)
    function renderFeatured() {
        if (!featuredGrid) return;
        const items = DesiHutData.getMenuItems();
        const featured = items.filter(i => i.featured && i.isAvailable !== false);
        featuredGrid.innerHTML = featured.map(createFoodCardHTML).join("");
    }

    // Render Full Menu Grid with Search & Category Filter
    function renderMenu() {
        if (!menuGrid) return;
        const items = DesiHutData.getMenuItems();

        const filtered = items.filter(item => {
            const matchesCat = currentCategory === "all" || item.category.toLowerCase() === currentCategory.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            menuGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #64748b;">
                    <i class="fa-solid fa-utensils" style="font-size: 3rem; margin-bottom: 1rem; color: #cbd5e1;"></i>
                    <h3>No delicious dishes found</h3>
                    <p>Try searching for another dish like "Biryani", "Chaat", or "Samosay".</p>
                </div>
            `;
            return;
        }

        menuGrid.innerHTML = filtered.map(createFoodCardHTML).join("");
    }

    // Cart Management
    function addToCart(itemId) {
        const items = DesiHutData.getMenuItems();
        const found = items.find(i => i.id === itemId);
        if (!found || found.isAvailable === false) return;

        const existing = cart.find(c => c.id === itemId);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: found.id,
                name: found.name,
                price: found.price,
                image: found.image,
                qty: 1
            });
        }

        updateCartUI();
        showToast(`Added "${found.name}" to your order!`);
    }

    function updateQty(itemId, delta) {
        const item = cart.find(c => c.id === itemId);
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(c => c.id !== itemId);
        }
        updateCartUI();
    }

    function removeFromCart(itemId) {
        cart = cart.filter(c => c.id !== itemId);
        updateCartUI();
    }

    function updateCartUI() {
        const store = DesiHutData.getStoreInfo();
        const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const delivery = subtotal > 0 ? store.deliveryFee : 0;
        const grandTotal = subtotal + delivery;

        // Update Badges & Totals
        if (cartCountBadge) cartCountBadge.textContent = totalCount;
        if (cartSubtotal) cartSubtotal.textContent = `Rs. ${subtotal.toLocaleString()}`;
        if (cartDelivery) cartDelivery.textContent = `Rs. ${delivery.toLocaleString()}`;
        if (cartTotal) cartTotal.textContent = `Rs. ${grandTotal.toLocaleString()}`;
        if (modalTotalAmount) modalTotalAmount.textContent = `Rs. ${grandTotal.toLocaleString()}`;

        // Render Cart Items
        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-cart-state">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <h4>Your feast tray is empty</h4>
                    <p style="font-size:0.88rem; margin-top:0.4rem;">Add hot Samosay, Dahi Bhallay, or Chicking Special to start your order!</p>
                </div>
            `;
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            if (checkoutBtn) checkoutBtn.disabled = false;
            cartItemsList.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80'">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
                    </div>
                    <div class="cart-qty-controls">
                        <button class="cart-qty-btn" onclick="DesiHutApp.updateQty('${item.id}', -1)">-</button>
                        <span class="cart-qty-val">${item.qty}</span>
                        <button class="cart-qty-btn" onclick="DesiHutApp.updateQty('${item.id}', 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="DesiHutApp.removeFromCart('${item.id}')" title="Remove">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `).join("");
        }
    }

    // Drawer Controls
    function openCart() {
        cartOverlay.classList.add("active");
        cartDrawer.classList.add("active");
    }

    function closeCart() {
        cartOverlay.classList.remove("active");
        cartDrawer.classList.remove("active");
    }

    // Modal Controls
    function openModal() {
        if (cart.length === 0) {
            showToast("Your cart is empty! Please choose dishes first.");
            return;
        }
        closeCart();
        orderModal.classList.add("active");
    }

    function closeModal() {
        orderModal.classList.remove("active");
    }

    // WhatsApp Order Generation
    function handleOrderSubmit(e) {
        e.preventDefault();
        const store = DesiHutData.getStoreInfo();
        const name = document.getElementById("orderCustomerName").value.trim();
        const phone = document.getElementById("orderCustomerPhone").value.trim();
        const type = document.getElementById("orderOrderType").value;
        const address = document.getElementById("orderAddress").value.trim();
        const notes = document.getElementById("orderSpecialNotes").value.trim();

        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const delivery = subtotal > 0 ? store.deliveryFee : 0;
        const grandTotal = subtotal + delivery;

        // Build WhatsApp message
        let msg = `🍽️ *NEW ORDER - DESIHUT HYDERABAD*\n`;
        msg += `---------------------------------\n`;
        msg += `👤 *Customer:* ${name}\n`;
        msg += `📞 *Phone:* ${phone}\n`;
        msg += `🏷️ *Order Type:* ${type}\n`;
        msg += `📍 *Delivery Address:* ${address}\n`;
        if (notes) {
            msg += `📝 *Special Notes:* ${notes}\n`;
        }
        msg += `---------------------------------\n`;
        msg += `*ITEMS ORDERED:*\n`;
        cart.forEach(item => {
            msg += `• ${item.qty}x ${item.name} = Rs. ${(item.price * item.qty).toLocaleString()}\n`;
        });
        msg += `---------------------------------\n`;
        msg += `*Subtotal:* Rs. ${subtotal.toLocaleString()}\n`;
        msg += `*Delivery Fee:* Rs. ${delivery.toLocaleString()}\n`;
        msg += `*GRAND TOTAL:* Rs. ${grandTotal.toLocaleString()} PKR\n`;
        msg += `---------------------------------\n`;
        msg += `_Order submitted via DesiHut Web Menu_`;

        // Save order locally for admin review
        DesiHutData.saveOrder({
            customerName: name,
            customerPhone: phone,
            orderType: type,
            address: address,
            notes: notes,
            items: cart,
            subtotal: subtotal,
            grandTotal: grandTotal
        });

        // Open WhatsApp
        const encoded = encodeURIComponent(msg);
        const waUrl = `https://wa.me/${store.whatsapp}?text=${encoded}`;
        window.open(waUrl, "_blank");

        // Clear and Reset
        cart = [];
        updateCartUI();
        closeModal();
        orderForm.reset();
        showToast("Your order was formatted and routed to WhatsApp! 🎉");
    }

    // Toast alert helper
    function showToast(message) {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#22c55e;"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // Event Listeners
    if (openCartBtn) openCartBtn.addEventListener("click", openCart);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener("click", openModal);
    if (closeOrderModal) closeOrderModal.addEventListener("click", closeModal);
    if (orderModal) {
        orderModal.addEventListener("click", (e) => {
            if (e.target === orderModal) closeModal();
        });
    }
    if (orderForm) orderForm.addEventListener("submit", handleOrderSubmit);

    // Filter tabs
    if (categoryTabs) {
        categoryTabs.addEventListener("click", (e) => {
            if (e.target.classList.contains("tab-btn")) {
                categoryTabs.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                currentCategory = e.target.getAttribute("data-category");
                renderMenu();
            }
        });
    }

    // Search filter
    if (menuSearchInput) {
        menuSearchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderMenu();
        });
    }

    // Mobile nav toggle
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener("click", () => {
            nav.classList.toggle("mobile-menu-active");
        });
    }

    // Initial Execution
    applyStoreInfo();
    renderFeatured();
    renderMenu();
    updateCartUI();

    // Export public functions to window for onclick handlers
    window.DesiHutApp = {
        addToCart,
        updateQty,
        removeFromCart,
        showToast
    };
});
