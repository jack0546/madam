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

// Resolves once the Firebase auth state has settled. Firebase emits a transient
// `null` on initial page load before restoring a persisted session, so we must
// not treat that first `null` as "logged out" or logged-in users get bounced to
// the login page (and back) in a redirect loop.
let _authReadyResolve;
let _authReadyResolved = false;
export const authReady = new Promise(resolve => { _authReadyResolve = resolve; });
export const waitForAuth = () => authReady;

const resolveAuthReady = () => {
    if (_authReadyResolved) return;
    _authReadyResolved = true;
    _authReadyResolve && _authReadyResolve();
};

export const initAuth = (onUserChange) => {
    return new Promise((resolve) => {
        let firstFire = true;
        onAuthStateChange(async (user) => {
            currentUser = user;
            if (user) {
                try {
                    await ensureUserProfile(user);
                    userProfile = await getUserProfile(user.uid);
                } catch (err) {
                    console.error('Failed to load user profile', err);
                }
            } else {
                userProfile = null;
            }

            if (onUserChange) onUserChange(user, userProfile);
            resolve({ user, profile: userProfile });

            if (firstFire) {
                firstFire = false;
                if (user) {
                    // Definitively signed in — settle immediately.
                    resolveAuthReady();
                } else {
                    // Transient `null`: wait briefly for a persisted session to
                    // be restored before settling. A genuinely logged-out user
                    // has no follow-up event, so the timer still resolves.
                    setTimeout(resolveAuthReady, 800);
                }
            }
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
        const allowedFields = ['name', 'phone', 'address', 'photo'];
        const cleanData = {};
        
        for (const key of allowedFields) {
            if (data[key] !== undefined) {
                cleanData[key] = data[key];
            }
        }
        
        if (Object.keys(cleanData).length === 0) {
            return { success: false, error: 'No valid fields to update' };
        }
        
        await updateUserProfile(currentUser.uid, cleanData);
        userProfile = { ...userProfile, ...cleanData };
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
export const isAdmin = () => {
    if (!currentUser) return false;
    if (userProfile?.role === 'admin') return true;
    if (currentUser.email && isAdminEmail(currentUser.email)) return true;
    return false;
};

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