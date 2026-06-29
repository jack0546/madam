import { formatCurrency } from './utils.js';
import { createNewOrder, cartToOrderItems } from './orders.js';
import { getUser, getProfile } from './auth.js';
import { clearCart } from './cart.js';

const PAYSTACK_PUBLIC_KEY = 'pk_test_1a2c5f8b05033afe957551195da95d2e8d237047';
const PAYSTACK_SCRIPT_ID = 'paystack-inline-script';

export const initializePaystack = () => {
    return new Promise((resolve, reject) => {
        if (window.PaystackPop) {
            resolve(window.PaystackPop);
            return;
        }

        const existingScript = document.getElementById(PAYSTACK_SCRIPT_ID);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.PaystackPop), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.id = PAYSTACK_SCRIPT_ID;
        script.src = 'https://js.paystack.co/v2/inline.js';
        script.async = true;
        script.onload = () => resolve(window.PaystackPop);
        script.onerror = () => reject(new Error('Failed to load Paystack'));
        document.body.appendChild(script);
    });
};

export const processPayment = async (amount, email, fullName, orderId = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            const PaystackPop = await initializePaystack();
            
            const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

            const handler = PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: email,
                amount: Math.round(amount * 100),
                currency: 'GHS',
                ref: paymentReference,
                metadata: {
                    custom_fields: [
                        { display_name: 'Customer Name', value: fullName },
                        { display_name: 'Order ID', value: orderId || '' }
                    ]
                },
                onClose: () => {
                    reject(new Error('Payment closed'));
                },
                callback: (response) => {
                    resolve({
                        success: true,
                        transactionReference: response.reference,
                        transactionId: response.trans,
                        status: response.status
                    });
                }
            });

            handler.openIframe();
        } catch (error) {
            reject(error);
        }
    });
};

export const handleCheckoutPayment = async (orderData) => {
    try {
        const user = getUser();
        const profile = getProfile();
        
        if (!user) {
            return { success: false, error: 'Please login first' };
        }

        const paymentResult = await processPayment(
            orderData.total,
            orderData.email,
            orderData.customerName
        );

        if (paymentResult.success) {
            const orderPayload = {
                userId: user.uid,
                customerName: orderData.customerName,
                email: orderData.email,
                phone: orderData.phone,
                address: orderData.address,
                items: orderData.items,
                subtotal: orderData.subtotal,
                shippingFee: orderData.shippingFee,
                total: orderData.total,
                paymentMethod: 'paystack',
                paymentStatus: 'success',
                orderStatus: 'pending',
                transactionReference: paymentResult.transactionReference,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const orderResult = await createNewOrder(orderPayload);
            
            if (orderResult.success) {
                clearCart();
                return { success: true, orderId: orderResult.orderId, transactionReference: paymentResult.transactionReference };
            }
            
            return orderResult;
        }
        
        return { success: false, error: 'Payment failed' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const verifyPayment = async (reference) => {
    try {
        const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference })
        });
        
        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        }
        
        return { success: false, error: 'Payment verification failed' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
