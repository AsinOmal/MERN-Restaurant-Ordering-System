import { createContext, useContext, useState, useEffect } from 'react';
import { useAsgardeo } from '@asgardeo/react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const { isSignedIn, isLoading: asgardeoLoading, signIn, signOut, getAccessToken } = useAsgardeo();
    const [user, setUser]       = useState(null);
    const [authMode, setAuthMode] = useState(null); // 'asgardeo' | 'local'
    const [loading, setLoading] = useState(true);

    // ── On mount: restore local (email+password) session if token exists ──
    useEffect(() => {
        const restoreLocalSession = async () => {
            const localToken = localStorage.getItem('auth_token');
            if (localToken) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.data);
                    setAuthMode('local');
                } catch {
                    localStorage.removeItem('auth_token');
                }
            }
            // Loading will be set to false after Asgardeo resolves too (below)
        };
        restoreLocalSession();
    }, []);

    // ── When Asgardeo state resolves, sync the DB user ────────────────────
    useEffect(() => {
        if (asgardeoLoading) return;

        const syncAsgardeo = async () => {
            if (isSignedIn) {
                try {
                    const token = await getAccessToken();
                    localStorage.setItem('asgardeo_token', token);
                    // Backend protect middleware auto-upserts on this call
                    const res = await api.get('/auth/me');
                    setUser(res.data.data);
                    setAuthMode('asgardeo');
                } catch (err) {
                    console.error('[Auth] Failed to sync Asgardeo user:', err);
                    localStorage.removeItem('asgardeo_token');
                }
            } else if (authMode === 'asgardeo') {
                // Asgardeo signed out
                localStorage.removeItem('asgardeo_token');
                setUser(null);
                setAuthMode(null);
            }
            setLoading(false);
        };

        syncAsgardeo();
    }, [isSignedIn, asgardeoLoading]);

    // ── Email + password login (Admin / Owner / Staff) ────────────────────
    const loginWithCredentials = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('auth_token', token);
        setUser(userData);
        setAuthMode('local');
        return userData;
    };

    // ── Asgardeo login (Customers) ────────────────────────────────────────
    const loginWithAsgardeo = () => signIn();

    // ── Logout (handles both modes) ───────────────────────────────────────
    const logout = async () => {
        if (authMode === 'asgardeo') {
            localStorage.removeItem('asgardeo_token');
            setUser(null);
            setAuthMode(null);
            await signOut();
        } else {
            localStorage.removeItem('auth_token');
            setUser(null);
            setAuthMode(null);
        }
    };

    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider value={{
            user,
            loading: loading || asgardeoLoading,
            authMode,
            loginWithAsgardeo,
            loginWithCredentials,
            logout,
            isAuthenticated,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
