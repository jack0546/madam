import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from './firebase.js';
import { showToast } from './utils.js';

const sampleProducts = [
    { id: 'bag1', name: 'Classic Black Handbag', description: 'Elegant black leather handbag with gold hardware.', price: 89.99, category: 'Handbags', images: ['images/bags/bag_1.jpg'], rating: 4.5, isTrending: true, inventory: 25, sizes: ['Small', 'Medium', 'Large'], colors: ['Black', 'Brown', 'Red'] },
    { id: 'bag2', name: 'Chic Brown Handbag', description: 'Stylish brown leather handbag for work or casual.', price: 79.99, category: 'Handbags', images: ['images/bags/bag_2.jpg'], rating: 4.3, isTrending: true, inventory: 20, sizes: ['Medium'], colors: ['Brown', 'Black'] },
    { id: 'bag3', name: 'Sleek White Handbag', description: 'Minimalist white handbag with chain strap.', price: 69.99, category: 'Handbags', images: ['images/bags/bag_3.jpg'], rating: 4.2, isTrending: false, inventory: 18, sizes: ['Small'], colors: ['White', 'Cream'] },
    { id: 'bag4', name: 'Bold Red Handbag', description: 'Statement red handbag for special occasions.', price: 99.99, category: 'Handbags', images: ['images/bags/bag_4.jpg'], rating: 4.4, isTrending: false, inventory: 12, sizes: ['Medium'], colors: ['Red', 'Burgundy'] },
    { id: 'bag5', name: 'Elegant Clutch', description: 'Sleek clutch with magnetic closure.', price: 59.99, category: 'Clutch Bags', images: ['images/bags/bag_5.jpg'], rating: 4.3, isTrending: true, inventory: 18, sizes: ['One Size'], colors: ['Gold', 'Silver', 'Black'] },
    { id: 'bag6', name: 'Metallic Clutch', description: 'Shimmering clutch for evening events.', price: 65.99, category: 'Clutch Bags', images: ['images/bags/bag_6.jpg'], rating: 4.2, isTrending: false, inventory: 15, sizes: ['One Size'], colors: ['Gold', 'Rose Gold'] },
    { id: 'bag7', name: 'Textured Clutch', description: 'Unique texture design clutch bag.', price: 62.99, category: 'Clutch Bags', images: ['images/bags/bag_7.jpg'], rating: 4.1, isTrending: false, inventory: 22, sizes: ['One Size'], colors: ['Black', 'Gray'] },
    { id: 'bag8', name: 'Premium Shoulder Bag', description: 'Versatile shoulder bag with adjustable strap.', price: 99.99, category: 'Shoulder Bags', images: ['images/bags/bag_8.jpg'], rating: 4.2, isTrending: false, inventory: 15, sizes: ['Medium'], colors: ['Black', 'White', 'Pink'] },
    { id: 'bag9', name: 'Structured Tote', description: 'Large structured tote perfect for work.', price: 84.99, category: 'Tote Bags', images: ['images/bags/bag_9.jpg'], rating: 4.3, isTrending: false, inventory: 28, sizes: ['One Size'], colors: ['Navy', 'Black'] },
    { id: 'bag10', name: 'Spacious Travel Bag', description: 'Large travel tote with multiple compartments.', price: 94.99, category: 'Tote Bags', images: ['images/bags/bag_10.jpg'], rating: 4.5, isTrending: true, inventory: 20, sizes: ['Large'], colors: ['Black', 'Beige'] },
    { id: 'bag11', name: 'Tote Style 1', description: 'Modern tote with minimalist design.', price: 79.99, category: 'Tote Bags', images: ['images/bags/g1.png', 'images/bags/g2.png'], rating: 4.6, isTrending: true, inventory: 30, sizes: ['One Size'], colors: ['Navy', 'Beige', 'White'] },
    { id: 'bag12', name: 'Tote Style 2', description: 'Compact tote for daily essentials.', price: 74.99, category: 'Tote Bags', images: ['images/bags/g3.png'], rating: 4.3, isTrending: false, inventory: 25, sizes: ['Medium'], colors: ['Gray', 'Black'] },
    { id: 'bag13', name: 'Tote Style 3', description: 'Elegant tote with premium finish.', price: 82.99, category: 'Tote Bags', images: ['images/bags/g4.png'], rating: 4.4, isTrending: false, inventory: 18, sizes: ['Large'], colors: ['Brown', 'Tan'] },
    { id: 'bag14', name: 'Tote Style 4', description: 'Casual tote with relaxed styling.', price: 69.99, category: 'Tote Bags', images: ['images/bags/g5.png'], rating: 4.2, isTrending: false, inventory: 35, sizes: ['Medium'], colors: ['Green', 'Blue'] },
    { id: 'bag15', name: 'Tote Style 5', description: 'Luxury tote with gold accents.', price: 99.99, category: 'Tote Bags', images: ['images/bags/g6.png'], rating: 4.7, isTrending: true, inventory: 12, sizes: ['One Size'], colors: ['Gold', 'Silver'] },
    { id: 'bag16', name: 'Tote Style 6', description: 'Urban tote with modern design.', price: 76.99, category: 'Tote Bags', images: ['images/bags/g7.png'], rating: 4.3, isTrending: false, inventory: 22, sizes: ['Medium'], colors: ['Black', 'White'] },
    { id: 'bag17', name: 'Tote Style 7', description: 'Lightweight summer tote.', price: 64.99, category: 'Tote Bags', images: ['images/bags/g8.png'], rating: 4.1, isTrending: false, inventory: 40, sizes: ['Small'], colors: ['Yellow', 'Pink'] },
    { id: 'bag18', name: 'Tote Style 8', description: 'Professional tote for office.', price: 87.99, category: 'Tote Bags', images: ['images/bags/g9.png'], rating: 4.5, isTrending: false, inventory: 26, sizes: ['Large'], colors: ['Nude', 'Black'] },
    { id: 'bag19', name: 'Tote Style 9', description: 'Convertible tote with detachable strap.', price: 89.99, category: 'Tote Bags', images: ['images/bags/g10.png'], rating: 4.4, isTrending: false, inventory: 19, sizes: ['Medium'], colors: ['Purple', 'Black'] },
    { id: 'bag20', name: 'Tote Style 10', description: 'Weekend getaway tote.', price: 92.99, category: 'Tote Bags', images: ['images/bags/g11.png'], rating: 4.6, isTrending: true, inventory: 24, sizes: ['Large'], colors: ['Coral', 'Blue'] },
    { id: 'heel1', name: 'Classic Stiletto', description: 'Timeless black stiletto heels.', price: 129.99, category: 'High Heels', images: ['images/foot/w_1.jpg'], rating: 4.6, isTrending: true, inventory: 25, sizes: ['6', '7', '8', '9', '10'], colors: ['Black', 'Nude', 'Red'] },
    { id: 'heel2', name: 'Nude Pumps', description: 'Elegant nude pumps for any outfit.', price: 119.99, category: 'High Heels', images: ['images/foot/w_2.jpg'], rating: 4.7, isTrending: true, inventory: 22, sizes: ['6', '7', '8', '9'], colors: ['Nude', 'Beige'] },
    { id: 'heel3', name: 'Red Stilettos', description: 'Bold red heels for special occasions.', price: 124.99, category: 'High Heels', images: ['images/foot/w_3.jpg'], rating: 4.5, isTrending: false, inventory: 18, sizes: ['6', '7', '8'], colors: ['Red', 'Burgundy'] },
    { id: 'heel4', name: 'Black Ankle Strap', description: 'Sophisticated heels with ankle strap.', price: 115.99, category: 'High Heels', images: ['images/foot/w_4.jpg'], rating: 4.4, isTrending: false, inventory: 20, sizes: ['7', '8', '9'], colors: ['Black', 'Gray'] },
    { id: 'heel5', name: 'Classic Heels', description: 'Versatile heels for everyday wear.', price: 109.99, category: 'High Heels', images: ['images/foot/w_5.jpg'], rating: 4.3, isTrending: false, inventory: 28, sizes: ['6', '7', '8', '9', '10'], colors: ['Black', 'Nude'] },
    { id: 'heel6', name: 'Block Heel Sandals', description: 'Comfortable block heel sandals.', price: 79.99, category: 'Sandals', images: ['images/foot/w_6.jpg'], rating: 4.4, isTrending: false, inventory: 22, sizes: ['6', '7', '8', '9'], colors: ['Brown', 'Black', 'Tan'] },
    { id: 'heel7', name: 'Tan Sandals', description: 'Summer sandals with wedge heel.', price: 69.99, category: 'Sandals', images: ['images/foot/w_7.jpg'], rating: 4.2, isTrending: false, inventory: 30, sizes: ['5', '6', '7', '8'], colors: ['Tan', 'Brown'] },
    { id: 'heel8', name: 'Black Platform', description: 'Platform sandals with comfortable footbed.', price: 74.99, category: 'Sandals', images: ['images/foot/w_8.jpg'], rating: 4.3, isTrending: false, inventory: 25, sizes: ['6', '7', '8', '9'], colors: ['Black', 'White'] },
    { id: 'heel9', name: 'White Summer Sandals', description: 'Elegant white sandals for summer.', price: 64.99, category: 'Sandals', images: ['images/foot/w_10.jpg'], rating: 4.1, isTrending: false, inventory: 35, sizes: ['5', '6', '7', '8'], colors: ['White', 'Nude'] }
];

export const loadProducts = async () => {
    try {
        const products = await getAllProducts();
        if (products.length === 0) {
            return { success: true, products: sampleProducts };
        }
        return { success: true, products };
    } catch (error) {
        return { success: true, products: sampleProducts };
    }
};

export const loadProduct = async (productId) => {
    try {
        const product = await getProductById(productId);
        if (product) return { success: true, product };
        const sample = sampleProducts.find(p => p.id === productId);
        if (sample) return { success: true, product: sample };
        showToast('Product not found', 'error');
        return { success: false, product: null };
    } catch (error) {
        const sample = sampleProducts.find(p => p.id === productId);
        if (sample) return { success: true, product: sample };
        return { success: false, product: null };
    }
};

export const createNewProduct = async (productData) => {
    try {
        const productId = await createProduct(productData);
        showToast('Product created successfully!', 'success');
        return { success: true, productId };
    } catch (error) {
        showToast('Failed to create product', 'error');
        return { success: false, error: error.message };
    }
};

export const updateExistingProduct = async (productId, productData) => {
    try {
        await updateProduct(productId, productData);
        showToast('Product updated successfully!', 'success');
        return { success: true };
    } catch (error) {
        showToast('Failed to update product', 'error');
        return { success: false, error: error.message };
    }
};

export const deleteExistingProduct = async (productId) => {
    try {
        await deleteProduct(productId);
        showToast('Product deleted successfully!', 'success');
        return { success: true };
    } catch (error) {
        showToast('Failed to delete product', 'error');
        return { success: false, error: error.message };
    }
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

export const getCategories = () => [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'Handbags', name: 'Handbags', icon: '👜' },
    { id: 'Tote Bags', name: 'Tote Bags', icon: '👜' },
    { id: 'Clutch Bags', name: 'Clutch Bags', icon: '📿' },
    { id: 'Shoulder Bags', name: 'Shoulder Bags', icon: '💼' },
    { id: 'High Heels', name: 'High Heels', icon: '👠' },
    { id: 'Sandals', name: 'Sandals', icon: '👡' }
];