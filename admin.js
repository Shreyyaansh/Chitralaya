// Admin Panel JavaScript
// API Configuration (loaded from config.js)

// Global variables
let currentSection = 'dashboard';
let products = [];
let orders = [];
let users = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

async function initializeAdminPanel() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please login to access admin panel');
        window.location.href = 'login.html';
        return;
    }

    // Check if user has admin privileges based on server profile (do NOT trust localStorage)
    try {
        const profile = await getServerUserProfile(token);
        const emailFromServer = profile?.email || profile?.user?.email;
        if (!emailFromServer || !isAdminUser(emailFromServer)) {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'main.html';
            return;
        }
    } catch (err) {
        console.error('Failed to verify user profile:', err);
        alert('Session invalid. Please login again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return;
    }

    // Setup event listeners
    setupEventListeners();
    
    // Load dashboard data
    loadDashboard();
}

// Simple admin check - you can modify this list
function isAdminUser(email) {
    const adminEmails = [
        'shreyansh123sharma123@gmail.com',
        // Add your admin email here
    ];
    return adminEmails.includes(email.toLowerCase());
}

// Retrieve the authenticated user's profile from the server to prevent client-side spoofing
async function getServerUserProfile(token) {
    const res = await fetch(`${window.API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Unable to verify profile');
    }
    // Try to return a normalized profile object
    return data.data?.user || data.user || data.data || {};
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Header buttons
    document.getElementById('refresh-btn').addEventListener('click', refreshCurrentSection);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Product management
    document.getElementById('add-product-btn').addEventListener('click', showAddProductModal);
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    document.getElementById('cancel-product').addEventListener('click', hideAddProductModal);
    document.querySelector('.close').addEventListener('click', hideAddProductModal);

    // Edit product management
    document.getElementById('edit-product-form').addEventListener('submit', handleEditProduct);

    // Order filters
    document.getElementById('order-status-filter').addEventListener('change', filterOrders);
    

    // Image preview functionality
    setupImagePreviews();

    // Modal close on outside click
    window.addEventListener('click', function(e) {
        const productModal = document.getElementById('add-product-modal');
        const orderModal = document.getElementById('order-details-modal');
        if (e.target === productModal) {
            hideAddProductModal();
        }
        if (e.target === orderModal) {
            hideOrderDetailsModal();
        }
    });
}

function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section).classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        products: 'Products',
        orders: 'Orders',
        users: 'Users',
        notifications: 'Notifications',
    };
    document.getElementById('page-title').textContent = titles[section] || 'Admin Panel';

    currentSection = section;

    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
        case 'notifications':
            loadNotifications();
            break;
    }
}

function refreshCurrentSection() {
    switchSection(currentSection);
}

// Dashboard functions
async function loadDashboard() {
    try {
        const token = localStorage.getItem('authToken');
        const [productsRes, ordersRes, usersRes] = await Promise.all([
            fetch(`${window.API_BASE_URL}/admin/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${window.API_BASE_URL}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${window.API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();

        // Update stats
        document.getElementById('total-products').textContent = productsData.data?.products?.length || 0;
        document.getElementById('total-orders').textContent = ordersData.data?.orders?.length || 0;
        document.getElementById('total-users').textContent = usersData.data?.users?.length || 0;

        // Calculate total revenue
        const totalRevenue = ordersData.data?.orders?.reduce((sum, order) => {
            return sum + (order.totalAmount || 0);
        }, 0) || 0;
        document.getElementById('total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;

        // Calculate paid orders
        const paidOrders = ordersData.data?.orders?.filter(order => order.paymentStatus === 'completed').length || 0;
        document.getElementById('paid-orders').textContent = paidOrders;

        // Load recent orders
        loadRecentOrders(ordersData.data?.orders || []);
        
        // Load recent notifications
        loadRecentNotifications();
        
        // Load notification count
        updateNotificationBadge();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

function loadRecentOrders(orders) {
    const recentOrders = orders.slice(0, 5);
    const container = document.getElementById('recent-orders-list');
    
    if (recentOrders.length === 0) {
        container.innerHTML = '<p>No recent orders</p>';
        return;
    }

    container.innerHTML = recentOrders.map(order => `
        <div class="order-item" style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Order #${order._id.slice(-6)}</strong>
                    <p style="margin: 5px 0; color: #666;">${order.shippingAddress?.fullName || 'Unknown'}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #2c3e50;">₹${order.totalAmount || 0}</div>
                    <div style="color: #666; font-size: 0.9rem;">${order.orderStatus || 'pending'}</div>
                    <div style="color: #666; font-size: 0.8rem;">Payment: ${order.paymentStatus || 'pending'}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Products functions
async function loadProducts() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${window.API_BASE_URL}/admin/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            products = data.data.products;
            displayProducts(products);
        } else {
            showError('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-grid');
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found</p>';
        return;
    }

    container.innerHTML = products.map(product => {
        // Get the first image from the images array, or use a placeholder
        const productImage = (product.images && product.images.length > 0) 
            ? product.images[0] 
            : 'assets/favicon.svg'; // fallback image
        
        return `
        <div class="product-card">
            <img src="${productImage}" alt="${product.name}" class="product-image" onerror="this.src='assets/favicon.svg'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p><strong>Price:</strong> ₹${product.price}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Stock:</strong> ${product.stock || 0}</p>
                <div class="product-actions">
                    <button class="btn-edit" onclick="editProduct('${product._id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct('${product._id}')">Delete</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function showAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'block';
}

function hideAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'none';
    document.getElementById('add-product-form').reset();
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Collect all image files
    const images = [];
    const mainImage = formData.get('mainImage');
    const hoverImage = formData.get('hoverImage');
    
    if (mainImage && mainImage.size > 0) {
        images.push(mainImage);
    }
    if (hoverImage && hoverImage.size > 0) {
        images.push(hoverImage);
    }
    
    // Create FormData for file upload
    const uploadData = new FormData();
    uploadData.append('name', formData.get('name'));
    uploadData.append('description', formData.get('description'));
    uploadData.append('price', formData.get('price'));
    uploadData.append('category', formData.get('category'));
    uploadData.append('artist', formData.get('artist') || 'Chitralaya Artist');
    uploadData.append('size', formData.get('size') || '');
    uploadData.append('medium', formData.get('medium') || '');
    // Get image position (from dropdown or custom input)
    let imagePosition = formData.get('imagePosition') || 'center';
    if (imagePosition === 'custom') {
        const customPosition = document.getElementById('add-custom-position').value;
        imagePosition = customPosition || 'center';
    }
    uploadData.append('imagePosition', imagePosition);
    uploadData.append('isActive', formData.get('isActive') === 'true');
    
    // Append all images
    images.forEach((image, index) => {
        uploadData.append('images', image);
    });

    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: uploadData
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Product added successfully');
            hideAddProductModal();
            loadProducts();
        } else {
            showError(data.message || 'Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showError('Failed to add product');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Product deleted successfully');
            loadProducts();
        } else {
            showError(data.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
    }
}

// Orders functions
async function loadOrders() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${window.API_BASE_URL}/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            orders = data.data.orders;
            displayOrders(orders);
        } else {
            showError('Failed to load orders');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders');
    }
}

function displayOrders(orders) {
    const container = document.getElementById('orders-table');
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No orders found</p>';
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>
                            #${order._id.slice(-6)}
                            ${order.isRepaintRequest ? '<span style="background: #d35400; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">REPAINT REQUEST</span>' : ''}
                        </td>
                        <td>${order.shippingAddress?.fullName || 'Unknown'}</td>
                        <td>${order.items?.length || 0} items</td>
                        <td>₹${order.totalAmount || 0}</td>
                        <td>
                            <select onchange="updateOrderStatus('${order._id}', this.value)">
                                <option value="pending" ${order.orderStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${order.orderStatus === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="shipped" ${order.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>
                            <span class="payment-status-badge payment-${order.paymentStatus || 'pending'}">
                                ${(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                            </span>
                        </td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="btn-edit" onclick="viewOrderDetails('${order._id}')">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function filterOrders() {
    const status = document.getElementById('order-status-filter').value;
    const filteredOrders = status ? orders.filter(order => order.orderStatus === status) : orders;
    displayOrders(filteredOrders);
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ orderStatus: newStatus })
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Order status updated');
            loadOrders();
        } else {
            showError(data.message || 'Failed to update order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Failed to update order status');
    }
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            displayOrderDetails(data.data.order);
        } else {
            showError('Failed to load order details');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showError('Failed to load order details');
    }
}

function displayOrderDetails(order) {
    const modal = document.getElementById('order-details-modal');
    const content = document.getElementById('order-details-content');
    
    if (!modal) {
        console.error('Modal element not found!');
        return;
    }
    
    if (!content) {
        console.error('Modal content element not found!');
        return;
    }
    
    // Format date
    const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format items
    const itemsHtml = order.items.map(item => {
        // Get product image - handle both images array and single image
        let productImage = 'assets/favicon.svg'; // default fallback
        if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
            productImage = item.product.images[0];
        } else if (item.product?.image) {
            productImage = item.product.image;
        }
        
        return `
        <div class="order-item-detail">
            <img src="${productImage}" alt="${item.product?.name || 'Product'}" class="order-item-image" onerror="this.src='assets/favicon.svg'; this.onerror=null;">
            <div class="order-item-info">
                <h5>${item.product?.name || 'Unknown Product'}</h5>
                <p><strong>Artist:</strong> ${item.product?.artist || 'Unknown'}</p>
                <p><strong>Category:</strong> ${item.product?.category || 'Unknown'}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                ${order.isRepaintRequest ? '<p style="color: #d35400; font-weight: 600;"><strong>🎨 Repaint Request</strong></p>' : ''}
            </div>
            <div class="order-item-price">₹${(item.product?.price || 0) * item.quantity}</div>
        </div>
        `;
    }).join('');

    content.innerHTML = `
        ${order.isRepaintRequest ? `
        <div class="order-details-section" style="background: #fff3cd; border-left: 4px solid #d35400; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
            <h4 style="color: #d35400; margin: 0 0 10px 0;">🎨 REPAINT REQUEST</h4>
            <p style="margin: 0; color: #856404;">This is a repaint request. The customer wants the artist to create another copy of this artwork.</p>
        </div>
        ` : ''}
        <!-- Order Information -->
        <div class="order-details-section">
            <h4>📋 Order Information</h4>
            <div class="order-details-grid">
                <div class="order-details-item">
                    <strong>Order ID:</strong>
                    <span>#${order._id}</span>
                </div>
                <div class="order-details-item">
                    <strong>Order Date:</strong>
                    <span>${orderDate}</span>
                </div>
                <div class="order-details-item">
                    <strong>Order Status:</strong>
                    <span class="status-badge status-${order.orderStatus || 'pending'}">${(order.orderStatus || 'pending').charAt(0).toUpperCase() + (order.orderStatus || 'pending').slice(1)}</span>
                </div>
                <div class="order-details-item">
                    <strong>Payment Status:</strong>
                    <span class="payment-status-badge payment-${order.paymentStatus || 'pending'}">${(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}</span>
                </div>
                <div class="order-details-item">
                    <strong>Payment Method:</strong>
                    <span>${order.paymentMethod || 'Unknown'}</span>
                </div>
                <div class="order-details-item">
                    <strong>Transaction ID:</strong>
                    <span>${order.transactionId || 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- Customer Information -->
        <div class="order-details-section">
            <h4>👤 Customer Information</h4>
            <div class="order-details-grid">
                <div class="order-details-item">
                    <strong>Customer Name:</strong>
                    <span>${order.shippingAddress?.fullName || 'Unknown'}</span>
                </div>
                <div class="order-details-item">
                    <strong>Email:</strong>
                    <span>${order.user?.email || 'Unknown'}</span>
                </div>
                <div class="order-details-item">
                    <strong>Phone:</strong>
                    <span>${order.shippingAddress?.phone || 'Unknown'}</span>
                </div>
            </div>
        </div>

        <!-- Shipping Address -->
        <div class="order-details-section">
            <h4>📍 Shipping Address</h4>
            <div class="order-details-grid">
                <div class="order-details-item">
                    <strong>Full Name:</strong>
                    <span>${order.shippingAddress?.fullName || 'Unknown'}</span>
                </div>
                <div class="order-details-item">
                    <strong>Phone:</strong>
                    <span>${order.shippingAddress?.phone || 'Unknown'}</span>
                </div>
                <div class="order-details-item" style="grid-column: 1 / -1;">
                    <strong>Address:</strong>
                    <span>${order.shippingAddress?.address || 'Unknown'}</span>
                </div>
                <div class="order-details-item">
                    <strong>City:</strong>
                    <span>${order.shippingAddress?.city || 'Unknown'}</span>
                </div>
                <div class="order-details-item">
                    <strong>State:</strong>
                    <span>${order.shippingAddress?.state || 'Unknown'}</span>
                </div>
                <div class="order-details-item">
                    <strong>Pincode:</strong>
                    <span>${order.shippingAddress?.pincode || 'Unknown'}</span>
                </div>
            </div>
        </div>

        <!-- Order Items -->
        <div class="order-details-section">
            <h4>🛍️ Order Items (${order.items?.length || 0} items)</h4>
            <div class="order-items-list">
                ${itemsHtml}
            </div>
        </div>

        <!-- Order Total -->
        <div class="order-details-section order-total-section">
            <h4>💰 Order Total</h4>
            <div class="order-total-amount">₹${order.totalAmount?.toLocaleString('en-IN') || '0'}</div>
        </div>

        <!-- Notes -->
        ${order.notes ? `
        <div class="order-details-section">
            <h4>📝 Order Notes</h4>
            <p>${order.notes}</p>
        </div>
        ` : ''}
    `;

    modal.style.display = 'block';
}

function hideOrderDetailsModal() {
    document.getElementById('order-details-modal').style.display = 'none';
}

function setupImagePreviews() {
    // Main image preview
    const mainImageInput = document.getElementById('product-main-image');
    const mainImagePreview = document.getElementById('main-image-preview');
    
    mainImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                mainImagePreview.innerHTML = `<img src="${e.target.result}" alt="Main image preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            mainImagePreview.innerHTML = '<div class="preview-placeholder">No image selected</div>';
        }
    });

    // Hover image preview
    const hoverImageInput = document.getElementById('product-hover-image');
    const hoverImagePreview = document.getElementById('hover-image-preview');
    
    hoverImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                hoverImagePreview.innerHTML = `<img src="${e.target.result}" alt="Hover image preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            hoverImagePreview.innerHTML = '<div class="preview-placeholder">No image selected</div>';
        }
    });

}

// Users functions
async function loadUsers() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${window.API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            users = data.data.users;
            displayUsers(users);
        } else {
            showError('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
    }
}

function displayUsers(users) {
    const container = document.getElementById('users-table');
    
    if (users.length === 0) {
        container.innerHTML = '<p>No users found</p>';
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.firstname} ${user.lastname}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>
                            <span style="color: ${user.isActive ? 'green' : 'red'};">
                                ${user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="btn-edit" onclick="toggleUserStatus('${user._id}', ${user.isActive})">
                                ${user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function toggleUserStatus(userId, currentStatus) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ isActive: !currentStatus })
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            loadUsers();
        } else {
            showError(data.message || 'Failed to update user status');
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        showError('Failed to update user status');
    }
}

// Notifications functions
let notifications = [];

async function loadNotifications() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${window.API_BASE_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            notifications = data.data.notifications;
            displayNotifications(notifications);
            updateNotificationBadge();
        } else {
            showError('Failed to load notifications');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showError('Failed to load notifications');
    }
}

function displayNotifications(notificationsList) {
    const container = document.getElementById('notifications-table');
    
    if (notificationsList.length === 0) {
        container.innerHTML = '<p>No notifications found</p>';
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${notificationsList.map(notification => `
                    <tr class="${!notification.isRead ? 'unread-notification' : ''}">
                        <td>${new Date(notification.createdAt).toLocaleDateString()}</td>
                        <td>${notification.user?.firstname || ''} ${notification.user?.lastname || ''}</td>
                        <td>${notification.product?.name || 'Unknown Product'}</td>
                        <td>
                            <span style="background: #d35400; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                                ${notification.type === 'repaint_request' ? 'Repaint Request' : notification.type}
                            </span>
                        </td>
                        <td>
                            <button class="btn-edit" onclick="viewNotificationDetails('${notification._id}')">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}


async function viewNotificationDetails(notificationId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${window.API_BASE_URL}/notifications/${notificationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            displayNotificationDetails(data.data.notification);
        } else {
            showError('Failed to load notification details');
        }
    } catch (error) {
        console.error('Error loading notification details:', error);
        showError('Failed to load notification details');
    }
}

function displayNotificationDetails(notification) {
    // Create or get modal
    let modal = document.getElementById('notification-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'notification-details-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const product = notification.product || {};
    const user = notification.user || {};
    const productImage = (product.images && product.images[0]) || 'assets/favicon.svg';
    
    modal.innerHTML = `
        <div class="modal-content order-details-modal">
            <div class="modal-header">
                <h3>Repaint Request Details</h3>
                <span class="close" onclick="hideNotificationDetailsModal()">&times;</span>
            </div>
            <div class="notification-details-content">
                <div class="notification-details-section" style="background: #fff3cd; border-left: 4px solid #d35400; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
                    <h4 style="color: #d35400; margin: 0 0 10px 0;">🎨 REPAINT REQUEST</h4>
                    <p style="margin: 0; color: #856404;">Customer has requested the artist to create another copy of this artwork.</p>
                </div>
                
                <div class="notification-details-section">
                    <h4>📋 Request Information</h4>
                    <div class="order-details-grid">
                        <div class="order-details-item">
                            <strong>Request ID:</strong>
                            <span>#${notification._id.slice(-6)}</span>
                        </div>
                        <div class="order-details-item">
                            <strong>Request Date:</strong>
                            <span>${new Date(notification.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <div class="order-details-item">
                            <strong>Read Status:</strong>
                            <span>${notification.isRead ? 'Read' : 'Unread'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="notification-details-section">
                    <h4>👤 Customer Information</h4>
                    <div class="order-details-grid">
                        <div class="order-details-item">
                            <strong>Name:</strong>
                            <span>${user.firstname || ''} ${user.lastname || ''}</span>
                        </div>
                        <div class="order-details-item">
                            <strong>Email:</strong>
                            <span>${user.email || 'N/A'}</span>
                        </div>
                        <div class="order-details-item">
                            <strong>Phone:</strong>
                            <span>${user.phone || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="notification-details-section">
                    <h4>🖼️ Product Information</h4>
                    <div class="order-item-detail">
                        <img src="${productImage}" alt="${product.name || 'Product'}" class="order-item-image">
                        <div class="order-item-info">
                            <h5>${product.name || 'Unknown Product'}</h5>
                            <p><strong>Artist:</strong> ${product.artist || 'Unknown'}</p>
                            <p><strong>Category:</strong> ${product.category || 'Unknown'}</p>
                            <p><strong>Price:</strong> ₹${product.price || 0}</p>
                            ${product.size ? `<p><strong>Size:</strong> ${product.size}</p>` : ''}
                            ${product.medium ? `<p><strong>Medium:</strong> ${product.medium}</p>` : ''}
                            ${product.description ? `<p><strong>Description:</strong> ${product.description}</p>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="notification-details-section">
                    <h4>📝 Message</h4>
                    <p>${notification.message || 'No additional message'}</p>
                </div>
                
                <div class="form-actions" style="margin-top: 20px;">
                    <button class="btn-secondary" onclick="hideNotificationDetailsModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function hideNotificationDetailsModal() {
    const modal = document.getElementById('notification-details-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}


async function loadRecentNotifications() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${window.API_BASE_URL}/notifications?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            displayRecentNotifications(data.data.notifications || []);
        }
    } catch (error) {
        // Silently handle error
    }
}

function displayRecentNotifications(notifications) {
    const container = document.getElementById('recent-notifications-list');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">No repaint requests yet</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notification => {
        const product = notification.product || {};
        const user = notification.user || {};
        return `
            <div class="order-item" style="padding: 15px; border-bottom: 1px solid #e0e0e0; ${!notification.isRead ? 'background: #fff3cd;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong>${product.name || 'Unknown Product'}</strong>
                        <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">
                            Requested by: ${user.firstname || ''} ${user.lastname || ''}
                        </p>
                        <p style="margin: 5px 0; color: #999; font-size: 0.85rem;">
                            ${new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <button class="btn-edit" onclick="viewNotificationDetails('${notification._id}')" style="margin-left: 10px;">View</button>
                </div>
            </div>
        `;
    }).join('');
}

async function updateNotificationBadge() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${window.API_BASE_URL}/notifications/count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const badge = document.getElementById('notification-badge');
            if (badge) {
                if (data.data.count > 0) {
                    badge.textContent = data.data.count;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch (error) {
        // Silently handle error
    }
}


// Utility functions
function showSuccess(message) {
    alert(`✅ ${message}`);
}

function showError(message) {
    alert(`❌ ${message}`);
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Edit Product Functions
function editProduct(productId) {
    // Find the product in the products array
    const product = products.find(p => p._id === productId);
    if (!product) {
        showError('Product not found');
        return;
    }

    // Populate the edit form with product data
    document.getElementById('edit-product-id').value = product._id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-description').value = product.description;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-artist').value = product.artist || '';
    document.getElementById('edit-product-size').value = product.size || '';
    document.getElementById('edit-product-medium').value = product.medium || '';
    document.getElementById('edit-product-stock').value = product.stock || 0;
    document.getElementById('edit-product-image-position').value = product.imagePosition || 'center';
    document.getElementById('edit-product-is-active').value = product.isActive ? 'true' : 'false';

    // Show the edit modal
    document.getElementById('edit-product-modal').style.display = 'block';
}

function hideEditProductModal() {
    document.getElementById('edit-product-modal').style.display = 'none';
}

// Custom positioning functions for Edit Product
function updatePositionInput() {
    const select = document.getElementById('edit-product-image-position');
    const customInput = document.getElementById('edit-custom-position');
    
    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
    }
}

function updatePositionFromInput() {
    const customInput = document.getElementById('edit-custom-position');
    const select = document.getElementById('edit-product-image-position');
    
    if (customInput.value.trim()) {
        // Create a temporary option with the custom value
        select.value = customInput.value;
    }
}

// Custom positioning functions for Add Product
function updateAddPositionInput() {
    const select = document.getElementById('product-image-position');
    const customInput = document.getElementById('add-custom-position');
    
    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
    }
}

function updateAddPositionFromInput() {
    const customInput = document.getElementById('add-custom-position');
    const select = document.getElementById('product-image-position');
    
    if (customInput.value.trim()) {
        // Create a temporary option with the custom value
        select.value = customInput.value;
    }
}


async function handleEditProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productId = formData.get('id');
    
    // Get image position (from dropdown or custom input)
    let imagePosition = formData.get('imagePosition') || 'center';
    if (imagePosition === 'custom') {
        const customPosition = document.getElementById('edit-custom-position').value;
        imagePosition = customPosition || 'center';
    }

    const productData = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        category: formData.get('category'),
        artist: formData.get('artist'),
        size: formData.get('size'),
        medium: formData.get('medium'),
        stock: parseInt(formData.get('stock')) || 0,
        imagePosition: imagePosition,
        isActive: formData.get('isActive') === 'true'
    };

    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Product updated successfully!');
            hideEditProductModal();
            loadProducts(); // Refresh the products list
        } else {
            showError(data.message || 'Failed to update product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showError('Failed to update product');
    }
}


