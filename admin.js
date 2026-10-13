/**
 * DesiHut - Admin Dashboard Logic
 * Handles Authentication, Menu CRUD, Availability Toggling, Orders Log, and Settings
 */

document.addEventListener("DOMContentLoaded", () => {
    // Auth elements
    const authScreen = document.getElementById("authScreen");
    const dashboardScreen = document.getElementById("dashboardScreen");
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("usernameInput");
    const passwordInput = document.getElementById("passwordInput");
    const loginErrorMsg = document.getElementById("loginErrorMsg");
    const fillDemoCredentialsBtn = document.getElementById("fillDemoCredentialsBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Navigation & Tabs
    const navTabBtns = document.querySelectorAll(".nav-tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const tabTitleText = document.getElementById("tabTitleText");

    // Modal elements
    const dishModal = document.getElementById("dishModal");
    const modalDishTitle = document.getElementById("modalDishTitle");
    const closeDishModalBtn = document.getElementById("closeDishModalBtn");
    const cancelDishModalBtn = document.getElementById("cancelDishModalBtn");
    const dishForm = document.getElementById("dishForm");
    const dishFormImage = document.getElementById("dishFormImage");
    const dishImagePreview = document.getElementById("dishImagePreview");
    const topAddDishBtn = document.getElementById("topAddDishBtn");
    const openAddDishModalBtn = document.getElementById("openAddDishModalBtn");

    // Tables & Filters
    const menuTableBody = document.getElementById("menuTableBody");
    const overviewFeaturedTableBody = document.getElementById("overviewFeaturedTableBody");
    const ordersTableBody = document.getElementById("ordersTableBody");
    const adminMenuSearch = document.getElementById("adminMenuSearch");
    const adminCategoryFilter = document.getElementById("adminCategoryFilter");

    // Settings
    const storeSettingsForm = document.getElementById("storeSettingsForm");
    const resetDataBtn = document.getElementById("resetDataBtn");

    // --- 1. AUTHENTICATION ---
    function checkAuth() {
        const isAuth = sessionStorage.getItem("desihut_is_authenticated");
        if (isAuth === "true") {
            authScreen.style.display = "none";
            dashboardScreen.style.display = "flex";
            initDashboard();
        } else {
            authScreen.style.display = "flex";
            dashboardScreen.style.display = "none";
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const user = usernameInput.value.trim();
            const pass = passwordInput.value.trim();

            if (user === "admin" && pass === "admin123") {
                sessionStorage.setItem("desihut_is_authenticated", "true");
                loginErrorMsg.style.display = "none";
                checkAuth();
            } else {
                loginErrorMsg.style.display = "block";
            }
        });
    }

    if (fillDemoCredentialsBtn) {
        fillDemoCredentialsBtn.addEventListener("click", () => {
            usernameInput.value = "admin";
            passwordInput.value = "admin123";
            loginForm.dispatchEvent(new Event("submit"));
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("desihut_is_authenticated");
            checkAuth();
        });
    }

    // --- 2. TAB SWITCHING ---
    function switchTab(tabName) {
        navTabBtns.forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-tab") === tabName);
        });

        tabPanes.forEach(p => {
            p.classList.toggle("active", p.id === `${tabName}Tab`);
        });

        const titles = {
            overview: "Overview & Analytics",
            menu: "Food Menu & Pricing Catalog",
            orders: "Customer Orders & Log",
            settings: "Store Profile & Location Settings"
        };
        if (tabTitleText) tabTitleText.textContent = titles[tabName] || "Dashboard";

        if (tabName === "overview") renderOverview();
        if (tabName === "menu") renderMenuTable();
        if (tabName === "orders") renderOrdersTable();
        if (tabName === "settings") loadSettingsForm();
    }

    navTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.getAttribute("data-tab");
            switchTab(tab);
        });
    });

    // --- 3. DASHBOARD INIT & STATS ---
    function initDashboard() {
        renderStats();
        renderOverview();
        renderMenuTable();
        renderOrdersTable();
        loadSettingsForm();
    }

    function renderStats() {
        const items = DesiHutData.getMenuItems();
        const orders = DesiHutData.getOrders();

        const totalItems = items.length;
        const activeItems = items.filter(i => i.isAvailable !== false).length;
        const totalOrders = orders.length;
        const estRevenue = orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);

        const statTotalItems = document.getElementById("statTotalItems");
        const statActiveItems = document.getElementById("statActiveItems");
        const statTotalOrders = document.getElementById("statTotalOrders");
        const statTotalRevenue = document.getElementById("statTotalRevenue");

        if (statTotalItems) statTotalItems.textContent = totalItems;
        if (statActiveItems) statActiveItems.textContent = activeItems;
        if (statTotalOrders) statTotalOrders.textContent = totalOrders;
        if (statTotalRevenue) statTotalRevenue.textContent = `Rs. ${estRevenue.toLocaleString()}`;
    }

    // --- 4. OVERVIEW TABLE ---
    function renderOverview() {
        renderStats();
        if (!overviewFeaturedTableBody) return;
        const items = DesiHutData.getMenuItems();
        const featured = items.filter(i => i.featured);

        overviewFeaturedTableBody.innerHTML = featured.map(item => `
            <tr>
                <td>
                    <div class="table-dish-cell">
                        <img src="${item.image}" alt="${item.name}" class="table-dish-img" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=150&q=80'">
                        <div class="table-dish-info">
                            <strong>${item.name}</strong>
                            <span>${item.description.substring(0, 40)}...</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge-pill">${item.category.toUpperCase()}</span></td>
                <td><strong>Rs. ${item.price.toLocaleString()}</strong></td>
                <td>${item.badge ? `<span style="color:var(--adm-primary); font-weight:700;">${item.badge}</span>` : '-'}</td>
                <td>
                    <span class="badge-status ${item.isAvailable !== false ? 'active' : 'soldout'}">
                        ${item.isAvailable !== false ? 'Available' : 'Sold Out'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon-action" onclick="AdminPanel.openEditModal('${item.id}')" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon-action" onclick="AdminPanel.toggleItemStatus('${item.id}')" title="Toggle Stock">
                        <i class="fa-solid fa-toggle-on"></i>
                    </button>
                </td>
            </tr>
        `).join("");
    }

    // --- 5. FULL MENU TABLE & CRUD ---
    function renderMenuTable() {
        renderStats();
        if (!menuTableBody) return;
        const items = DesiHutData.getMenuItems();
        const search = (adminMenuSearch ? adminMenuSearch.value : "").toLowerCase();
        const cat = adminCategoryFilter ? adminCategoryFilter.value : "all";

        const filtered = items.filter(i => {
            const matchSearch = i.name.toLowerCase().includes(search) || i.description.toLowerCase().includes(search);
            const matchCat = cat === "all" || i.category.toLowerCase() === cat.toLowerCase();
            return matchSearch && matchCat;
        });

        if (filtered.length === 0) {
            menuTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#94a3b8;">No matching dishes found.</td></tr>`;
            return;
        }

        menuTableBody.innerHTML = filtered.map(item => `
            <tr>
                <td>
                    <div class="table-dish-cell">
                        <img src="${item.image}" alt="${item.name}" class="table-dish-img" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=150&q=80'">
                        <div class="table-dish-info">
                            <strong>${item.name}</strong>
                            <span>${item.description.substring(0, 50)}...</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge-pill">${item.category.toUpperCase()}</span></td>
                <td><strong>Rs. ${item.price.toLocaleString()}</strong></td>
                <td>
                    ${item.badge ? `<span style="color:var(--adm-primary); font-weight:700;">${item.badge}</span><br>` : ''}
                    ${item.featured ? '<small style="color:#0284c7;">★ Featured</small>' : ''}
                </td>
                <td>
                    <span class="badge-status ${item.isAvailable !== false ? 'active' : 'soldout'}">
                        ${item.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon-action" onclick="AdminPanel.openEditModal('${item.id}')" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon-action" onclick="AdminPanel.toggleItemStatus('${item.id}')" title="Toggle Stock">
                        <i class="fa-solid fa-power-off"></i>
                    </button>
                    <button class="btn-icon-action delete" onclick="AdminPanel.deleteItem('${item.id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join("");
    }

    // Modal Helpers
    function openAddModal() {
        modalDishTitle.textContent = "Add New Food Item";
        dishForm.reset();
        document.getElementById("dishFormId").value = "";
        document.getElementById("dishFormAvailable").checked = true;
        document.getElementById("dishFormFeatured").checked = false;
        dishImagePreview.style.display = "none";
        dishModal.classList.add("active");
    }

    function openEditModal(id) {
        const items = DesiHutData.getMenuItems();
        const item = items.find(i => i.id === id);
        if (!item) return;

        modalDishTitle.textContent = "Edit Food Item";
        document.getElementById("dishFormId").value = item.id;
        document.getElementById("dishFormName").value = item.name;
        document.getElementById("dishFormCategory").value = item.category;
        document.getElementById("dishFormPrice").value = item.price;
        document.getElementById("dishFormDesc").value = item.description;
        document.getElementById("dishFormImage").value = item.image;
        document.getElementById("dishFormBadge").value = item.badge || "";
        document.getElementById("dishFormSpicy").value = item.spicyLevel !== undefined ? item.spicyLevel : 1;
        document.getElementById("dishFormFeatured").checked = !!item.featured;
        document.getElementById("dishFormAvailable").checked = item.isAvailable !== false;

        dishImagePreview.src = item.image;
        dishImagePreview.style.display = "block";
        dishModal.classList.add("active");
    }

    function closeDishModal() {
        dishModal.classList.remove("active");
    }

    // Image URL Preview
    if (dishFormImage) {
        dishFormImage.addEventListener("input", () => {
            const url = dishFormImage.value.trim();
            if (url) {
                dishImagePreview.src = url;
                dishImagePreview.style.display = "block";
            } else {
                dishImagePreview.style.display = "none";
            }
        });
    }

    // Save or Update Dish
    if (dishForm) {
        dishForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("dishFormId").value;
            const items = DesiHutData.getMenuItems();

            const itemData = {
                id: id || "dh-" + Date.now(),
                name: document.getElementById("dishFormName").value.trim(),
                category: document.getElementById("dishFormCategory").value,
                price: parseFloat(document.getElementById("dishFormPrice").value),
                description: document.getElementById("dishFormDesc").value.trim(),
                image: document.getElementById("dishFormImage").value.trim(),
                badge: document.getElementById("dishFormBadge").value.trim(),
                spicyLevel: parseInt(document.getElementById("dishFormSpicy").value),
                featured: document.getElementById("dishFormFeatured").checked,
                isAvailable: document.getElementById("dishFormAvailable").checked
            };

            if (id) {
                // Update
                const idx = items.findIndex(i => i.id === id);
                if (idx !== -1) items[idx] = itemData;
            } else {
                // Add
                items.unshift(itemData);
            }

            DesiHutData.saveMenuItems(items);
            closeDishModal();
            renderMenuTable();
            renderOverview();
            alert("Dish saved successfully!");
        });
    }

    // Toggle Availability
    function toggleItemStatus(id) {
        const items = DesiHutData.getMenuItems();
        const item = items.find(i => i.id === id);
        if (item) {
            item.isAvailable = item.isAvailable === false ? true : false;
            DesiHutData.saveMenuItems(items);
            renderMenuTable();
            renderOverview();
        }
    }

    // Delete Item
    function deleteItem(id) {
        if (!confirm("Are you sure you want to remove this item from the DesiHut menu?")) return;
        let items = DesiHutData.getMenuItems();
        items = items.filter(i => i.id !== id);
        DesiHutData.saveMenuItems(items);
        renderMenuTable();
        renderOverview();
    }

    // --- 6. ORDERS TABLE ---
    function renderOrdersTable() {
        if (!ordersTableBody) return;
        const orders = DesiHutData.getOrders();

        if (orders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:2.5rem; color:#94a3b8;">
                        No orders recorded yet. As customers click "Confirm & Order via WhatsApp" on the website, orders will appear here!
                    </td>
                </tr>
            `;
            return;
        }

        ordersTableBody.innerHTML = orders.map(ord => {
            const timeStr = new Date(ord.createdAt).toLocaleString();
            const itemsSummary = (ord.items || []).map(i => `${i.qty}x ${i.name}`).join("<br>");
            const waCleanPhone = (ord.customerPhone || "").replace(/\D/g, "");

            return `
                <tr>
                    <td><strong>${ord.id}</strong></td>
                    <td><strong>${ord.customerName}</strong></td>
                    <td><a href="tel:${ord.customerPhone}" style="color:var(--adm-primary); font-weight:600;">${ord.customerPhone}</a></td>
                    <td>
                        <span class="badge-pill">${ord.orderType || 'Delivery'}</span><br>
                        <small style="color:#64748b;">${ord.address || 'N/A'}</small>
                    </td>
                    <td style="font-size:0.85rem; line-height:1.4;">${itemsSummary}</td>
                    <td><strong style="color:var(--adm-primary);">Rs. ${(ord.grandTotal || 0).toLocaleString()}</strong></td>
                    <td><small style="color:#64748b;">${timeStr}</small></td>
                    <td>
                        <a href="https://wa.me/${waCleanPhone}?text=Hi%20${encodeURIComponent(ord.customerName)},%20this%20is%20DesiHut%20regarding%20your%20order%20${ord.id}" target="_blank" class="btn-icon-action" style="color:#16a34a;" title="Chat with customer on WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // --- 7. STORE SETTINGS FORM ---
    function loadSettingsForm() {
        const store = DesiHutData.getStoreInfo();
        document.getElementById("settingStoreName").value = store.name;
        document.getElementById("settingStoreTagline").value = store.tagline;
        document.getElementById("settingStorePhone").value = store.phone;
        document.getElementById("settingStoreWhatsApp").value = store.whatsapp;
        document.getElementById("settingStoreAddress").value = store.address;
        document.getElementById("settingStoreTiming").value = store.timing;
        document.getElementById("settingDeliveryFee").value = store.deliveryFee;
    }

    if (storeSettingsForm) {
        storeSettingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const store = {
                name: document.getElementById("settingStoreName").value.trim(),
                tagline: document.getElementById("settingStoreTagline").value.trim(),
                phone: document.getElementById("settingStorePhone").value.trim(),
                whatsapp: document.getElementById("settingStoreWhatsApp").value.trim(),
                address: document.getElementById("settingStoreAddress").value.trim(),
                timing: document.getElementById("settingStoreTiming").value.trim(),
                currency: "Rs.",
                deliveryFee: parseFloat(document.getElementById("settingDeliveryFee").value) || 100,
                email: "info@desihut.pk"
            };
            DesiHutData.saveStoreInfo(store);
            alert("Restaurant settings saved! All website pages are synchronized.");
        });
    }

    if (resetDataBtn) {
        resetDataBtn.addEventListener("click", () => {
            if (confirm("Reset menu to factory default dishes (Dahi Bhallay, Chaat, Samosay, Chicking Special, Dum Biryani)? Any custom items will be restored.")) {
                DesiHutData.resetToDefaults();
                initDashboard();
                alert("Data has been reset to defaults!");
            }
        });
    }

    // Search and filter listeners
    if (adminMenuSearch) adminMenuSearch.addEventListener("input", renderMenuTable);
    if (adminCategoryFilter) adminCategoryFilter.addEventListener("change", renderMenuTable);

    // Modal triggers
    if (topAddDishBtn) topAddDishBtn.addEventListener("click", openAddModal);
    if (openAddDishModalBtn) openAddDishModalBtn.addEventListener("click", openAddModal);
    if (closeDishModalBtn) closeDishModalBtn.addEventListener("click", closeDishModal);
    if (cancelDishModalBtn) cancelDishModalBtn.addEventListener("click", closeDishModal);

    // Run auth check on start
    checkAuth();

    // Export public methods for inline onclicks
    window.AdminPanel = {
        switchTab,
        openEditModal,
        toggleItemStatus,
        deleteItem
    };
});
