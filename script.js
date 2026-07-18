// Product Database
const products = [
    { id: 1, name: "Fresh Bananas", price: 50, image: "🍌", category: "Fruits" },
    { id: 2, name: "Red Apples", price: 120, image: "🍎", category: "Fruits" },
    { id: 3, name: "Fresh Oranges", price: 80, image: "🍊", category: "Fruits" },
    { id: 4, name: "Tomatoes", price: 40, image: "🍅", category: "Vegetables" },
    { id: 5, name: "Onions (1kg)", price: 30, image: "🧅", category: "Vegetables" },
    { id: 6, name: "Carrots (500g)", price: 35, image: "🥕", category: "Vegetables" },
    { id: 7, name: "Basmati Rice (5kg)", price: 300, image: "🍚", category: "Grains" },
    { id: 8, name: "Whole Wheat Flour (5kg)", price: 180, image: "🌾", category: "Grains" },
    { id: 9, name: "Fresh Milk (1L)", price: 60, image: "🥛", category: "Dairy" },
    { id: 10, name: "Dahi (500ml)", price: 50, image: "🥣", category: "Dairy" },
    { id: 11, name: "Paneer (250g)", price: 100, image: "🧀", category: "Dairy" },
    { id: 12, name: "Bread (400g)", price: 45, image: "🍞", category: "Bakery" }
];

let cart = [];
let orders = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    loadOrders();
    displayProducts();
});

// Display Products
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.image}</div>
            <h3>${product.name}</h3>
            <p class="price">₹${product.price}</p>
            <p class="category">${product.category}</p>
            <button class="btn btn-add" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

// Add to Cart
function addToCart(productId, name, price) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, name: name, price: price, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    alert(`✅ ${name} added to cart!`);
}

// Display Cart
function displayCart() {
    const cartContainer = document.getElementById('cartContainer');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-message">Your cart is empty</p>';
        checkoutBtn.style.display = 'none';
        return;
    }
    
    let total = 0;
    let html = '<table class="cart-table"><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th>Action</th></tr>';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.price}</td>
                <td>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </td>
                <td>₹${itemTotal}</td>
                <td><button class="btn btn-remove" onclick="removeFromCart(${item.id})">Remove</button></td>
            </tr>
        `;
    });
    
    html += `</table><div class="cart-total"><h2>Total: ₹${total}</h2></div>`;
    cartContainer.innerHTML = html;
    checkoutBtn.style.display = 'block';
    document.getElementById('checkoutTotal').textContent = total;
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            displayCart();
        }
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCart();
}

// Go to Checkout
function goToCheckout() {
    showSection('checkout');
}

// Place Order
function placeOrder(event) {
    event.preventDefault();
    
    const order = {
        orderId: 'ORD-' + Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customer: {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        },
        payment: document.getElementById('paymentMethod').value,
        date: new Date().toLocaleString()
    };
    
    orders.push(order);
    saveOrders();
    
    alert(`✅ Order placed successfully!\nOrder ID: ${order.orderId}`);
    
    // Clear form and cart
    document.querySelector('form').reset();
    cart = [];
    saveCart();
    updateCartCount();
    
    showSection('orders');
}

// Display Orders
function displayOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p class="empty-message">No orders yet</p>';
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        const isBulk = order.type === 'bulk';
        const discountLine = isBulk && order.discount > 0
            ? `<p><strong>Discount:</strong> ₹${order.discount}</p>` : '';
        html += `
            <div class="order-card${isBulk ? ' bulk-order-card' : ''}">
                <h3>${isBulk ? '📦 Bulk ' : ''}Order ID: ${order.orderId}</h3>
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Customer:</strong> ${order.customer.name}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Phone:</strong> ${order.customer.phone}</p>
                <p><strong>Address:</strong> ${order.customer.address}</p>
                <p><strong>Payment Method:</strong> ${order.payment}</p>
                <h4>Items:</h4>
                <ul>
                    ${order.items.map(item => `<li>${item.name} x${item.quantity} = ₹${item.price * item.quantity}</li>`).join('')}
                </ul>
                ${discountLine}
                <p class="order-total"><strong>Total: ₹${order.total}</strong></p>
            </div>
        `;
    });
    
    ordersContainer.innerHTML = html;
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Show Section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Load data
    if (sectionId === 'cart') {
        displayCart();
    } else if (sectionId === 'orders') {
        displayOrders();
    } else if (sectionId === 'products') {
        displayProducts();
    } else if (sectionId === 'bulk') {
        displayBulkProducts();
    }
}

// ─── BULK ORDER PANEL ────────────────────────────────────────────────────────

function getBulkDiscount(totalUnits) {
    if (totalUnits >= 50) return 0.15;
    if (totalUnits >= 20) return 0.10;
    if (totalUnits >= 10) return 0.05;
    return 0;
}

function displayBulkProducts() {
    const grid = document.getElementById('bulkProductsGrid');
    grid.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('div');
        row.className = 'bulk-product-row';
        row.innerHTML = `
            <div class="bulk-product-info">
                <span class="bulk-product-image">${product.image}</span>
                <div>
                    <div class="bulk-product-name">${product.name}</div>
                    <div class="bulk-product-category">${product.category}</div>
                    <div class="bulk-product-price">₹${product.price} / unit</div>
                </div>
            </div>
            <div class="bulk-qty-controls">
                <button class="qty-btn" onclick="changeBulkQty(${product.id}, -1)">−</button>
                <input type="number" id="bulkQty_${product.id}" value="0" min="0" class="bulk-qty-input"
                    onchange="updateBulkSummary()">
                <button class="qty-btn" onclick="changeBulkQty(${product.id}, 1)">+</button>
            </div>
            <div class="bulk-line-total" id="bulkLine_${product.id}">₹0</div>
        `;
        grid.appendChild(row);
    });
}

function changeBulkQty(productId, delta) {
    const input = document.getElementById('bulkQty_' + productId);
    const newVal = Math.max(0, parseInt(input.value || 0) + delta);
    input.value = newVal;
    updateBulkSummary();
}

function updateBulkSummary() {
    let subtotal = 0;
    let totalUnits = 0;
    let hasItems = false;

    products.forEach(product => {
        const input = document.getElementById('bulkQty_' + product.id);
        const qty = parseInt(input.value) || 0;
        const lineTotal = qty * product.price;
        document.getElementById('bulkLine_' + product.id).textContent = '₹' + lineTotal;
        subtotal += lineTotal;
        totalUnits += qty;
        if (qty > 0) hasItems = true;
    });

    const discountRate = getBulkDiscount(totalUnits);
    const discountAmt = Math.round(subtotal * discountRate);
    const total = subtotal - discountAmt;

    document.getElementById('bulkSubtotal').textContent = subtotal;
    document.getElementById('bulkDiscount').textContent = discountAmt + (discountRate > 0 ? ' (' + (discountRate * 100) + '%)' : '');
    document.getElementById('bulkTotal').textContent = total;

    const summaryContainer = document.getElementById('bulkSummaryContainer');
    summaryContainer.style.display = hasItems ? 'block' : 'none';

    // Build summary items list
    let summaryHtml = '';
    products.forEach(product => {
        const qty = parseInt(document.getElementById('bulkQty_' + product.id).value) || 0;
        if (qty > 0) {
            summaryHtml += `<div class="bulk-row"><span>${product.image} ${product.name} × ${qty}</span><span>₹${qty * product.price}</span></div>`;
        }
    });
    document.getElementById('bulkSummaryItems').innerHTML = summaryHtml;
}

function placeBulkOrder(event) {
    event.preventDefault();

    const items = [];
    let subtotal = 0;
    let totalUnits = 0;

    products.forEach(product => {
        const qty = parseInt(document.getElementById('bulkQty_' + product.id).value) || 0;
        if (qty > 0) {
            items.push({ id: product.id, name: product.name, price: product.price, quantity: qty });
            subtotal += qty * product.price;
            totalUnits += qty;
        }
    });

    if (items.length === 0) {
        alert('⚠️ Please add at least one product to place a bulk order.');
        return;
    }

    const discountRate = getBulkDiscount(totalUnits);
    const discountAmt = Math.round(subtotal * discountRate);
    const total = subtotal - discountAmt;

    const order = {
        orderId: 'BULK-' + Date.now(),
        type: 'bulk',
        items: items,
        subtotal: subtotal,
        discount: discountAmt,
        total: total,
        customer: {
            name: document.getElementById('bulkName').value,
            email: document.getElementById('bulkEmail').value,
            phone: document.getElementById('bulkPhone').value,
            address: document.getElementById('bulkAddress').value
        },
        payment: document.getElementById('bulkPayment').value,
        date: new Date().toLocaleString()
    };

    orders.push(order);
    saveOrders();

    alert(`✅ Bulk order placed successfully!\nOrder ID: ${order.orderId}\nTotal: ₹${total}${discountAmt > 0 ? '\nYou saved: ₹' + discountAmt : ''}`);
    resetBulkForm();
    showSection('orders');
}

function resetBulkForm() {
    products.forEach(product => {
        const input = document.getElementById('bulkQty_' + product.id);
        if (input) input.value = 0;
        const lineEl = document.getElementById('bulkLine_' + product.id);
        if (lineEl) lineEl.textContent = '₹0';
    });
    const form = document.getElementById('bulkOrderForm');
    if (form) form.reset();
    document.getElementById('bulkSummaryContainer').style.display = 'none';
}

// ─────────────────────────────────────────────────────────────────────────────

// LocalStorage Functions
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartCount();
    }
}

function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function loadOrders() {
    const saved = localStorage.getItem('orders');
    if (saved) {
        orders = JSON.parse(saved);
    }
}
