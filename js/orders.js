import { 
    db,
    createOrder, 
    createPendingOrder,
    updateOrderPayment,
    getUserOrders, 
    getAllOrders, 
    updateOrderStatus,
    onSnapshot,
    collection,
    query,
    where,
    doc,
    getDoc,
    getAllUsers,
    createNotification,
    getUserNotifications as getNotifications,
    markNotificationRead as markNotifRead,
    markAllNotificationsRead as markAllNotifsRead,
    getUnreadNotificationCount as getNotifCount,
    subscribeToUserNotifications as subscribeNotifs,
    deleteNotification
} from './firebase.js';
import { formatCurrency, formatDate, showToast } from './utils.js';

export const createNewOrder = async (orderData) => {
    try {
        const orderId = await createOrder(orderData);
        showToast('Order placed successfully!', 'success');

        if (orderData.userId) {
            await createNotification({
                userId: orderData.userId,
                title: 'Order Confirmed',
                message: `Your order #${orderData.orderNumber || orderId} has been placed successfully.`,
                type: 'order',
                relatedId: orderId
            });
        }

        return { success: true, orderId };
    } catch (error) {
        showToast(error.message || 'Failed to place order', 'error');
        return { success: false, error: error.message };
    }
};

export const createUserNotification = createNotification;

export { createPendingOrder, updateOrderPayment };

export { createNotification };

export const getUserNotifications = getNotifications;

export const markNotificationRead = markNotifRead;

export const markAllNotificationsRead = markAllNotifsRead;

export { deleteNotification };

export const getUnreadNotificationCount = getNotifCount;

export const subscribeToUserNotifications = subscribeNotifs;

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
    // Subscribe to the top-level `orders` collection (source of truth the admin
    // updates) filtered to this user, so admin status/payment changes appear
    // live. The `users/{uid}/orders` mirror is write-once and never updated.
    const q = query(
        collection(db, "orders"),
        where("userId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        callback(orders);
    }, (error) => {
        console.error('User orders listener error:', error);
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