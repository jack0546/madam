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

// Resolves once the first Firebase auth state event has fired.
// Await this before calling isAuthenticated() or isAdmin() on page load.
let _authReadyResolve;
export const authReady = new Promise(resolve => { _authReadyResolve = resolve; });
export const waitForAuth = () => authReady;

export const initAuth = (onUserChange) => {
    return new Promise((resolve) => {
        onAuthStateChange(async (user) => {
            currentUser = user;
            if (user) {
                await ensureUserProfile(user);
                userProfile = await getUserProfile(user.uid);
            } else {
                userProfile = null;
            }
            // Resolve authReady on first fire
            if (_authReadyResolve) {
                _authReadyResolve();
                _authReadyResolve = null;
            }
            if (onUserChange) onUserChange(user, userProfile);
            resolve({ user, profile: userProfile });
        });
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
        await ensureUserProfile(result.user);
        showToast('Logged in with Google!', 'success');
        return { success: true, user: result.user };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
};

export const register = async (email, password, name, phone = '') => {
    try {
        const result = await registerUser(email, password, name, phone);
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