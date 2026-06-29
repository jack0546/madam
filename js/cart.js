let cart = [];

const CART_STORAGE_KEY = 'shopping_cart';

const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="flex-center gap-2"><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('active'), 100);
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

export const loadCart = () => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    cart = savedCart ? JSON.parse(savedCart) : [];
};

export const saveCart = () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

const notifyCartUpdated = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
    }
};

export const getCart = () => cart;

export const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
};

export const getCartSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

export const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    return subtotal + (subtotal > 100 ? 0 : 15);
};

export const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    const size = selectedSize ?? product.sizes?.[0];
    const color = selectedColor ?? product.colors?.[0];
    
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
    );
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity,
            selectedSize: size,
            selectedColor: color
        });
    }
    
    saveCart();
    showToast(`${product.name} added to cart!`, 'success');
    updateCartUI();
    notifyCartUpdated();
};

export const removeFromCart = (itemId) => {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
    notifyCartUpdated();
};

export const updateCartItem = (itemId, quantity) => {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = Math.max(1, Number(quantity) || 1);
        saveCart();
        updateCartUI();
        notifyCartUpdated();
    }
};

export const clearCart = () => {
    cart = [];
    saveCart();
    updateCartUI();
    notifyCartUpdated();
};

export const updateCartUI = () => {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = getCartItemCount();
        cartCountEl.style.display = getCartItemCount() > 0 ? 'block' : 'none';
    }
};

export const initCart = () => {
    loadCart();
    updateCartUI();
    notifyCartUpdated();
};

export const cartToOrderItems = () => {
    return cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price || item.discountPrice,
        quantity: item.quantity,
        image: item.images?.[0] || '',
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
    }));
};

document.addEventListener('DOMContentLoaded', initCart);