import { 
    auth, 
    db, 
    loginUser, 
    loginWithGoogle,
    registerUser, 
    logoutUser, 
    onAuthStateChange, 
    getUserRole, 
    getUserProfile, 
    updateUserProfile,
    isAdminEmail,
    resetPassword,
    ensureUserProfile
} from './firebase.js';
import { showToast } from './utils.js';

let currentUser = null;
let userProfile = null;

export const initAuth = async (onUserChange) => {
    onAuthStateChange(async (user) => {
        currentUser = user;
        if (user) {
            await ensureUserProfile(user);
            userProfile = await getUserProfile(user.uid);
        } else {
            userProfile = null;
        }
        onUserChange(user, userProfile);
    });
};

export const login = async (email, password) => {
    try {
        const result = await loginUser(email, password);
        await ensureUserProfile(result.user);
        return { success: true, user: result.user };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
};

export const loginGoogle = async () => {
    try {
        const result = await loginWithGoogle();
        showToast('Logged in with Google!', 'success');
        return { success: true, user: result.user };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
};

export const register = async (email, password, name) => {
    try {
        const result = await registerUser(email, password, name);
        return { success: true, user: result.user };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
};

export const logout = async () => {
    try {
        await logoutUser();
        return { success: true };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
};

export const forgotPassword = async (email) => {
    try {
        await resetPassword(email);
        showToast('Password reset email sent!', 'success');
        return { success: true };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
};

export const updateProfile = async (data) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    
    try {
        await updateUserProfile(currentUser.uid, data);
        userProfile = { ...userProfile, ...data };
        showToast('Profile updated successfully!', 'success');
        return { success: true };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
};

export const getUser = () => currentUser;
export const getProfile = () => userProfile;
export const isAuthenticated = () => !!currentUser;
export const isAdmin = () => userProfile?.role === 'admin';

export const requireAuth = (redirectUrl = '/login.html') => {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
};

export const requireAdmin = (redirectUrl = '/') => {
    if (!isAuthenticated() || !isAdmin()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
};