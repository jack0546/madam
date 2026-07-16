export const escapeHtml = (str) => {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const formatCurrency = (amount, currency = 'GHS') => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
};

export const formatDate = (value) => {
    if (!value) return '';
    let date;
    if (value && typeof value.seconds === 'number') {
        // Firestore Timestamp (e.g. serverTimestamp())
        date = new Date(value.seconds * 1000);
    } else if (value && typeof value.toDate === 'function') {
        // Firestore Timestamp (newer SDK object)
        date = value.toDate();
    } else {
        date = new Date(value);
    }
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const generateOrderNumber = () => {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

export const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const inner = document.createElement('div');
    inner.className = 'flex-center gap-2';
    const span = document.createElement('span');
    span.textContent = message;
    inner.appendChild(span);
    toast.appendChild(inner);
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 100);

    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

export const setLoading = (element, isLoading) => {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
};

export const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
};

export const calculateSubtotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const calculateShipping = (subtotal) => {
    return subtotal > 100 ? 0 : 15;
};

export const calculateTotal = (items) => {
    const subtotal = calculateSubtotal(items);
    return subtotal + calculateShipping(subtotal);
};