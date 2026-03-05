/**
 * Pakzon eCommerce Website - Main JavaScript
 * Handles cart functionality, form validation, and interactive features
 * WCAG 2.1 AA Compliant
 */

// ==========================================================================
// Global State Management
// ==========================================================================

let cart = [];
const SHIPPING_COST = 250;

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Format price in PKR currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted price string
 */
function formatPrice(amount) {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Update cart count badge
 */
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Announce to screen readers
    cartCount.setAttribute('aria-label', `${totalItems} item${totalItems !== 1 ? 's' : ''} in cart`);
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    try {
        localStorage.setItem('pakzon_cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

/**
 * Load cart from localStorage
 */
function loadCart() {
    try {
        const savedCart = localStorage.getItem('pakzon_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart = [];
    }
}

// ==========================================================================
// Cart Management Functions
// ==========================================================================

/**
 * Add product to cart
 * @param {Object} product - Product object to add
 */
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`Increased ${product.name} quantity to ${existingItem.quantity}`);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            quantity: 1
        });
        showToast(`${product.name} added to cart`);
    }
    
    saveCart();
    updateCartCount();
}

/**
 * Update item quantity in cart
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        item.quantity = quantity;
        saveCart();
        renderCart();
        updateCartCount();
    }
}

/**
 * Remove product from cart
 * @param {string} productId - Product ID to remove
 */
function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
        updateCartCount();
        showToast(`${item.name} removed from cart`);
    }
}

/**
 * Calculate cart totals
 * @returns {Object} Object containing subtotal and total
 */
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + SHIPPING_COST;
    
    return { subtotal, total };
}

/**
 * Handle Buy Now button click
 * @param {Object} product - Product object
 */
function buyNow(product) {
    // Clear cart and add only this product
    cart = [{
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity: 1
    }];
    
    saveCart();
    updateCartCount();
    
    // Redirect to checkout
    window.location.href = 'checkout.html';
}

// ==========================================================================
// Cart Page Rendering
// ==========================================================================

/**
 * Render cart items on cart.html
 */
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartItemsWrapper = document.getElementById('cart-items-wrapper');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    // Show empty cart message if cart is empty
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartItemsWrapper) cartItemsWrapper.style.display = 'none';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartItemsWrapper) cartItemsWrapper.style.display = 'grid';
    
    // Clear existing items
    cartItemsContainer.innerHTML = '';
    
    // Render each cart item
    cart.forEach(item => {
        const cartItem = document.createElement('article');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('role', 'listitem');
        
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-header">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <span class="cart-item-price" aria-label="Price: ${item.price} rupees">${formatPrice(item.price)}</span>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control" role="group" aria-label="Quantity controls for ${item.name}">
                        <button 
                            class="quantity-btn" 
                            data-action="decrease" 
                            data-id="${item.id}"
                            aria-label="Decrease quantity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                        <input 
                            type="number" 
                            class="quantity-input" 
                            value="${item.quantity}" 
                            min="1" 
                            data-id="${item.id}"
                            aria-label="Quantity"
                            readonly>
                        <button 
                            class="quantity-btn" 
                            data-action="increase" 
                            data-id="${item.id}"
                            aria-label="Increase quantity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                <line x1="12" y1="5" x2="12" y2="19" stroke-width="2" stroke-linecap="round"/>
                                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <button 
                        class="remove-btn" 
                        data-id="${item.id}"
                        aria-label="Remove ${item.name} from cart">
                        Remove
                    </button>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Update totals
    const { subtotal, total } = calculateTotals();
    if (cartSubtotal) {
        cartSubtotal.textContent = formatPrice(subtotal);
        cartSubtotal.setAttribute('aria-label', `Subtotal: ${subtotal} rupees`);
    }
    if (cartTotal) {
        cartTotal.textContent = formatPrice(total);
        cartTotal.setAttribute('aria-label', `Total: ${total} rupees`);
    }
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityChange);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', handleRemove);
    });
}

/**
 * Handle quantity button clicks
 * @param {Event} e - Click event
 */
function handleQuantityChange(e) {
    const action = e.currentTarget.dataset.action;
    const productId = e.currentTarget.dataset.id;
    const item = cart.find(item => item.id === productId);
    
    if (!item) return;
    
    if (action === 'increase') {
        updateQuantity(productId, item.quantity + 1);
    } else if (action === 'decrease') {
        updateQuantity(productId, item.quantity - 1);
    }
}

/**
 * Handle remove button clicks
 * @param {Event} e - Click event
 */
function handleRemove(e) {
    const productId = e.currentTarget.dataset.id;
    removeFromCart(productId);
}

// ==========================================================================
// Checkout Page Functions
// ==========================================================================

/**
 * Render order summary on checkout page
 */
function renderOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const orderSubtotal = document.getElementById('order-subtotal');
    const orderTotal = document.getElementById('order-total');
    
    if (!orderItems) return;
    
    // Clear existing items
    orderItems.innerHTML = '';
    
    // Check if cart is empty
    if (cart.length === 0) {
        orderItems.innerHTML = '<p style="text-align: center; color: var(--color-gray-500);">Your cart is empty</p>';
        return;
    }
    
    // Render each order item
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.setAttribute('role', 'listitem');
        
        orderItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-details">
                <h3 class="order-item-title">${item.name}</h3>
                <p class="order-item-meta">Qty: ${item.quantity} × ${formatPrice(item.price)}</p>
            </div>
        `;
        
        orderItems.appendChild(orderItem);
    });
    
    // Update totals
    const { subtotal, total } = calculateTotals();
    if (orderSubtotal) orderSubtotal.textContent = formatPrice(subtotal);
    if (orderTotal) orderTotal.textContent = formatPrice(total);
}

/**
 * Validate form field
 * @param {HTMLElement} field - Input field to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateField(field) {
    const errorElement = document.getElementById(`${field.id}-error`);
    let isValid = true;
    let errorMessage = '';
    
    // Check if field is empty
    if (!field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    } else {
        // Specific validation based on field type
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'tel':
                const phoneRegex = /^03\d{9}$/;
                if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = 'Please enter a valid Pakistani phone number (03XXXXXXXXX)';
                }
                break;
        }
        
        // Postal code validation
        if (field.id === 'postal-code') {
            const postalRegex = /^\d{5}$/;
            if (!postalRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid 5-digit postal code';
            }
        }
    }
    
    // Update field styling and error message
    if (!isValid) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    } else {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    return isValid;
}

/**
 * Handle checkout form submission
 * @param {Event} e - Submit event
 */
function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formStatus = document.getElementById('form-status');
    const fields = form.querySelectorAll('input[required], textarea[required]');
    
    let isFormValid = true;
    
    // Validate all fields
    fields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        // Show error message
        if (formStatus) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Please correct the errors above before submitting';
        }
        
        // Focus first invalid field
        const firstInvalid = form.querySelector('.error');
        if (firstInvalid) {
            firstInvalid.focus();
        }
        
        return;
    }
    
    // Check if cart is empty
    if (cart.length === 0) {
        if (formStatus) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Your cart is empty. Please add items before checkout.';
        }
        return;
    }
    
    // Get form data
    const formData = {
        fullName: form.fullName.value,
        email: form.email.value,
        phone: form.phone.value,
        address: form.address.value,
        city: form.city.value,
        postalCode: form.postalCode.value,
        orderItems: cart,
        orderTotal: calculateTotals().total
    };
    
    // Simulate order processing
    console.log('Order submitted:', formData);
    
    // Show success modal
    showSuccessModal(formData.email);
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
}

/**
 * Show success modal after order placement
 * @param {string} email - Customer email
 */
function showSuccessModal(email) {
    const modal = document.getElementById('success-modal');
    const confirmationEmail = document.getElementById('confirmation-email');
    
    if (!modal) return;
    
    if (confirmationEmail) {
        confirmationEmail.textContent = email;
    }
    
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus on modal
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.focus();
    }
    
    // Trap focus within modal
    trapFocus(modal);
}

/**
 * Trap focus within element (for modal accessibility)
 * @param {HTMLElement} element - Element to trap focus in
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
        
        if (e.key === 'Escape') {
            window.location.href = 'index.html';
        }
    });
}

// ==========================================================================
// Mobile Menu Toggle
// ==========================================================================

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    
    if (!menuToggle || !navbarMenu) return;
    
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navbarMenu.style.display = isExpanded ? 'none' : 'flex';
        
        // Position menu below header on mobile
        if (window.innerWidth < 768) {
            if (!isExpanded) {
                navbarMenu.style.position = 'absolute';
                navbarMenu.style.top = '100%';
                navbarMenu.style.left = '0';
                navbarMenu.style.right = '0';
                navbarMenu.style.backgroundColor = 'var(--color-white)';
                navbarMenu.style.flexDirection = 'column';
                navbarMenu.style.padding = 'var(--spacing-4)';
                navbarMenu.style.boxShadow = 'var(--shadow-md)';
            }
        }
    });
    
    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            navbarMenu.style.display = 'flex';
            navbarMenu.style.position = 'static';
            navbarMenu.style.flexDirection = 'row';
            navbarMenu.style.padding = '0';
            navbarMenu.style.boxShadow = 'none';
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ==========================================================================
// Event Listeners
// ==========================================================================

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Add to Cart buttons
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const product = {
                id: e.target.dataset.productId,
                name: e.target.dataset.productName,
                price: e.target.dataset.productPrice,
                image: e.target.dataset.productImage
            };
            addToCart(product);
        });
    });
    
    // Buy Now buttons
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const product = {
                id: e.target.dataset.productId,
                name: e.target.dataset.productName,
                price: e.target.dataset.productPrice,
                image: e.target.dataset.productImage
            };
            buyNow(product);
        });
    });
    
    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
        
        // Real-time validation
        const fields = checkoutForm.querySelectorAll('input[required], textarea[required]');
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                validateField(field);
            });
            
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    validateField(field);
                }
            });
        });
    }
    
    // Modal close functionality
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ==========================================================================
// Page Initialization
// ==========================================================================

/**
 * Initialize the application
 */
function init() {
    // Load cart from localStorage
    loadCart();
    
    // Update cart count
    updateCartCount();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize event listeners
    initEventListeners();
    
    // Page-specific initialization
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'cart.html' || currentPage === '') {
        renderCart();
    }
    
    if (currentPage === 'checkout.html') {
        renderOrderSummary();
        
        // Redirect if cart is empty
        if (cart.length === 0) {
            showToast('Your cart is empty. Redirecting to home page...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==========================================================================
// Export functions for testing (if needed)
// ==========================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotals,
        formatPrice
    };
}
