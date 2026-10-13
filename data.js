/**
 * DesiHut - Shared Data & Storage Helper
 * Provides seed menu items, restaurant profile, and localStorage synchronization
 */

const DEFAULT_STORE_INFO = {
    name: "DesiHut",
    tagline: "Authentic Pakistani Street Flavors & Traditional Feast",
    phone: "03143666277",
    whatsapp: "923143666277",
    email: "info@desihut.pk",
    address: "Banglow No A/2, Auto Bahn Rd, Latifabad Unit # 3 Latifabad Unit 3 Latifabad, Hyderabad, Pakistan",
    timing: "Mon - Sun: 12:00 PM - 01:00 AM",
    currency: "Rs.",
    deliveryFee: 100,
    googleMapsUrl: "https://maps.google.com/?q=Auto+Bahn+Rd+Latifabad+Unit+3+Hyderabad+Pakistan"
};

const DEFAULT_MENU_ITEMS = [
    {
        id: "dh-1",
        name: "Special Dahi Bhallay",
        category: "chaat",
        price: 280,
        description: "Soft fluffy lentil dumplings soaked in chilled spiced creamy yogurt, topped with sweet tamarind (imli) sauce, mint chutney, and roasted cumin.",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80",
        badge: "Chef Special",
        spicyLevel: 1,
        isAvailable: true,
        featured: true
    },
    {
        id: "dh-2",
        name: "Desi Special Chaat",
        category: "chaat",
        price: 250,
        description: "Crispy papdi layered with boiled chickpeas, diced potatoes, tangy imli sauce, sweetened yogurt, fresh onions, coriander, and secret chaat masala.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
        badge: "Bestseller",
        spicyLevel: 2,
        isAvailable: true,
        featured: true
    },
    {
        id: "dh-3",
        name: "Crispy Samosay (Pair)",
        category: "samosay",
        price: 140,
        description: "Golden flaky pastry pockets filled with gently spiced potatoes, green peas, and fresh coriander. Served with homemade red khatti meethi chutney.",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80",
        badge: "Crispy & Fresh",
        spicyLevel: 2,
        isAvailable: true,
        featured: true
    },
    {
        id: "dh-4",
        name: "Samosa Chaat Platter",
        category: "chaat",
        price: 320,
        description: "Two crushed golden samosas smothered in chana masala gravy, beaten yogurt, chopped red onions, green chilies, and sweet tamarind drizzle.",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
        badge: "Popular",
        spicyLevel: 2,
        isAvailable: true,
        featured: false
    },
    {
        id: "dh-5",
        name: "DesiHut Chicking Special",
        category: "chicken",
        price: 790,
        description: "Our signature quarter fried & char-grilled chicken marinated in 14 aromatic herbs and spices, crispy on the outside, juicy inside. Served with garlic dip and naan.",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=80",
        badge: "Signature",
        spicyLevel: 3,
        isAvailable: true,
        featured: true
    },
    {
        id: "dh-6",
        name: "Special Dum Biryani (Chicken)",
        category: "biryani",
        price: 450,
        description: "Royal Sindh-style layered long-grain sella basmati rice steamed over tender spiced marinated chicken, golden aloo, fried onions, and kewra essence. Served with raita.",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80",
        badge: "Must Try",
        spicyLevel: 3,
        isAvailable: true,
        featured: true
    },
    {
        id: "dh-7",
        name: "Special Beef Dum Biryani",
        category: "biryani",
        price: 550,
        description: "Slow-cooked fragrant Hyderabadi beef biryani infused with bone-marrow gravy, green chilies, saffron, and tender melt-in-mouth beef chunks.",
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=700&q=80",
        badge: "Weekend Special",
        spicyLevel: 3,
        isAvailable: true,
        featured: false
    },
    {
        id: "dh-8",
        name: "Chicken Malai Boti Roll",
        category: "chicken",
        price: 360,
        description: "Smoky boneless chicken cooked in fresh cream, wrapped in a hot flaky paratha with mint sauce and rings of spiced onion.",
        image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80",
        badge: "Snack Favorite",
        spicyLevel: 1,
        isAvailable: true,
        featured: false
    },
    {
        id: "dh-9",
        name: "Crispy Gol Gappay (8 Pcs)",
        category: "chaat",
        price: 220,
        description: "Crisp hollow puris stuffed with boiled chickpeas and potatoes, served alongside chilled tangy khatta water and sweet imli pani.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
        badge: "Street Hit",
        spicyLevel: 2,
        isAvailable: true,
        featured: false
    },
    {
        id: "dh-10",
        name: "Royal Matka Kheer",
        category: "desserts",
        price: 240,
        description: "Traditional slow-simmered rice pudding enriched with condensed milk, cardamom, sliced almonds, pistachios, and silver warq in a clay pot.",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
        badge: "Sweet Tooth",
        spicyLevel: 0,
        isAvailable: true,
        featured: false
    }
];

const STORAGE_KEYS = {
    MENU: "desihut_menu_items",
    STORE_INFO: "desihut_store_info",
    ORDERS: "desihut_orders_list",
    AUTH: "desihut_admin_auth"
};

// Data Helper utilities
const DesiHutData = {
    getStoreInfo() {
        const stored = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { /* fallback */ }
        }
        localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(DEFAULT_STORE_INFO));
        return DEFAULT_STORE_INFO;
    },

    saveStoreInfo(info) {
        localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(info));
    },

    getMenuItems() {
        const stored = localStorage.getItem(STORAGE_KEYS.MENU);
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { /* fallback */ }
        }
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
        return DEFAULT_MENU_ITEMS;
    },

    saveMenuItems(items) {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    },

    getOrders() {
        const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { /* fallback */ }
        }
        return [];
    },

    saveOrder(order) {
        const orders = this.getOrders();
        orders.unshift({
            ...order,
            id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    },

    resetToDefaults() {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
        localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(DEFAULT_STORE_INFO));
        return {
            storeInfo: DEFAULT_STORE_INFO,
            menu: DEFAULT_MENU_ITEMS
        };
    }
};
