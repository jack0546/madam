import { 
    db,
    createOrder, 
    getUserOrders, 
    getAllOrders, 
    updateOrderStatus,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    getAllUsers
} from './firebase.js';
import { formatCurrency, formatDate, showToast } from './utils.js';

export const createNewOrder = async (orderData) => {
    try {
        const orderId = await createOrder(orderData);
        showToast('Order placed successfully!', 'success');
        return { success: true, orderId };
    } catch (error) {
        showToast(error.message || 'Failed to place order', 'error');
        return { success: false, error: error.message };
    }
};

export const loadUserOrders = async (userId) => {
    try {
        const orders = await getUserOrders(userId);
        return { success: true, orders };
    } catch (error) {
        showToast('Failed to load orders', 'error');
        return { success: false, orders: [] };
    }
};

export const loadAllOrdersAdmin = async () => {
    try {
        const orders = await getAllOrders();
        return { success: true, orders };
    } catch (error) {
        showToast('Failed to load orders', 'error');
        return { success: false, orders: [] };
    }
};

export const changeOrderStatus = async (orderId, status, note = '') => {
    try {
        await updateOrderStatus(orderId, status);
        showToast('Order status updated!', 'success');
        return { success: true };
    } catch (error) {
        showToast('Failed to update order status', 'error');
        return { success: false, error: error.message };
    }
};

export const subscribeToOrderUpdates = (orderId, callback) => {
    return onSnapshot(doc(db, "orders", orderId), (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        }
    });
};

export const subscribeToUserOrders = (userId, callback) => {
    const q = query(
        collection(db, "orders"), 
        where("userId", "==", userId), 
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(orders);
    });
};

export const getOrderById = async (orderId) => {
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    return orderDoc.exists() ? { id: orderDoc.id, ...orderDoc.data() } : null;
};

export const loadAllUsers = async () => {
    try {
        const users = await getAllUsers();
        return { success: true, users };
    } catch (error) {
        showToast('Failed to load users', 'error');
        return { success: false, users: [] };
    }
};