import { createContext, useContext, useState, useEffect } from 'react';
import { useAsgardeo } from '@asgardeo/react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const { isSignedIn, isLoading, signIn, signOut, getAccessToken, user: asgardeoUser } = useAsgardeo();
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (isSignedIn && asgardeoUser) {
            setUser({
                name: asgardeoUser.displayName || asgardeoUser.username || asgardeoUser.email,
                email: asgardeoUser.email,
                sub: asgardeoUser.sub,
            });
        } else {
            setUser(null);
        }
    }, [isSignedIn, asgardeoUser]);

    useEffect(() => {
        if (isSignedIn) {
            getAccessToken().then((token) => {
                localStorage.setItem('asgardeo_token', token);
            }).catch(() => {
                localStorage.removeItem('asgardeo_token');
            });
        } else {
            localStorage.removeItem('asgardeo_token');
        }
    }, [isSignedIn]);

    const login = () => signIn();
    const logout = () => signOut();
    const isAuthenticated = () => !!isSignedIn;

    return (
        <AuthContext.Provider value={{ user, loading: isLoading, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
