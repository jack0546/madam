import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, db, getDocs, collection, deleteDoc } from './firebase.js';
import { showToast } from './utils.js';

const LOCAL_STORAGE_KEY = 'luxebags_local_products';
const LOCAL_PREFIX = 'local_';



const getLocalProducts = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveLocalProducts = (products) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
};

const addLocalProduct = (product) => {
    const products = getLocalProducts();
    products.push(product);
    saveLocalProducts(products);
};

const updateLocalProduct = (productId, data) => {
    const products = getLocalProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index >= 0) {
        products[index] = { ...products[index], ...data };
        saveLocalProducts(products);
    }
};

const deleteLocalProduct = (productId) => {
    const products = getLocalProducts();
    const filtered = products.filter(p => p.id !== productId);
    saveLocalProducts(filtered);
};

export const loadProducts = async () => {
    try {
        const firestoreProducts = await getAllProducts();
        const localProducts = getLocalProducts();

        // Merge Firestore products with any products saved locally while offline,
        // dedupe by id so a product isn't listed twice.
        const byId = new Map();
        const addUnique = (list) => {
            (list || []).forEach(p => {
                if (p && p.id && !byId.has(p.id)) byId.set(p.id, p);
            });
        };
        addUnique(firestoreProducts);
        addUnique(localProducts);

        return { success: true, products: Array.from(byId.values()) };
    } catch (error) {
        const localProducts = getLocalProducts();
        const merged = [...localProducts];
        return { success: true, products: merged };
    }
};

export const loadProduct = async (productId) => {
    try {
        const product = await getProductById(productId);
        if (product) return { success: true, product };

        const localProducts = getLocalProducts();
        const localProduct = localProducts.find(p => p.id === productId);
        if (localProduct) return { success: true, product: localProduct };

        showToast('Product not found', 'error');
        return { success: false, product: null };
    } catch (error) {
        const localProducts = getLocalProducts();
        const localProduct = localProducts.find(p => p.id === productId);
        if (localProduct) return { success: true, product: localProduct };

        return { success: false, product: null };
    }
};

export const createNewProduct = async (productData) => {
    try {
        const productId = await createProduct(productData);
        showToast('Product created successfully!', 'success');
        return { success: true, productId };
    } catch (error) {
        const localProduct = {
            ...productData,
            id: LOCAL_PREFIX + Date.now(),
            createdAt: new Date().toISOString()
        };
        addLocalProduct(localProduct);
        showToast('Product saved locally (Firebase unavailable)', 'success');
        return { success: true, productId: localProduct.id };
    }
};

export const updateExistingProduct = async (productId, productData) => {
    try {
        await updateProduct(productId, productData);
        showToast('Product updated successfully!', 'success');
        return { success: true };
    } catch (error) {
        updateLocalProduct(productId, productData);
        showToast('Product updated locally (Firebase unavailable)', 'success');
        return { success: true };
    }
};

// Fully delete a product: remove it from Firestore (when available) and always
// purge any local (offline) copy so the dashboard never shows a stale "local" image.
export const deleteExistingProduct = async (productId) => {
    let firestoreDeleted = false;
    try {
        await deleteProduct(productId);
        firestoreDeleted = true;
    } catch (error) {
        console.error('Failed to delete product from Firestore:', error);
    }
    deleteLocalProduct(productId);
    showToast(firestoreDeleted ? 'Product deleted successfully!' : 'Product deleted (local copy removed).', 'success');
    return { success: true };
};

// Delete every product: clears Firestore and wipes any locally-saved products/images.
export const deleteAllProducts = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    } catch (error) {
        console.error('Failed to delete Firestore products:', error);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    showToast('All products deleted.', 'success');
    return { success: true };
};

export const filterProductsByCategory = (products, category) => {
    if (!category || category === 'all') return products;
    return products.filter(product => product.category === category);
};

export const searchProducts = (products, searchTerm) => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
    );
};

export const sortProducts = (products, sortBy = 'name') => {
    const sorted = [...products];
    switch (sortBy) {
        case 'price-low': return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        case 'price-high': return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        case 'rating': return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        default: return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
};

export const getProductsByCategory = async (category) => {
    const result = await loadProducts();
    if (result.success) {
        return { success: true, products: filterProductsByCategory(result.products, category) };
    }
    return result;
};

export const getTrendingProducts = async (products = null) => {
    const result = products ? { products } : await loadProducts();
    if (result.success) {
        return { success: true, products: result.products.filter(p => p.isTrending) };
    }
    return result;
};

const BAG_CATEGORIES = ['Handbags', 'Tote Bags', 'Clutch Bags', 'Shoulder Bags'];

export const getRelatedProducts = (product, products, limit = 4) => {
    if (!product || !Array.isArray(products)) return [];

    const isBag = BAG_CATEGORIES.includes(product.category);
    const isRelated = (p) => p.id !== product.id;

    const sameCategory = products.filter(p => isRelated(p) && p.category === product.category);
    const sameType = products.filter(p => isRelated(p) && p.category !== product.category && BAG_CATEGORIES.includes(p.category) === isBag);
    const others = products.filter(p => isRelated(p) && !sameCategory.includes(p) && !sameType.includes(p));

    return [...sameCategory, ...sameType, ...others].slice(0, limit);
};

export const getCategories = () => [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'Handbags', name: 'Handbags', icon: '👜' },
    { id: 'Tote Bags', name: 'Tote Bags', icon: '👜' },
    { id: 'Clutch Bags', name: 'Clutch Bags', icon: '📿' },
    { id: 'Shoulder Bags', name: 'Shoulder Bags', icon: '💼' },
    { id: 'High Heels', name: 'High Heels', icon: '👠' },
    { id: 'Sandals', name: 'Sandals', icon: '👡' }
];