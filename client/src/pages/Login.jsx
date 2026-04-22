import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const { loginWithAsgardeo, loginWithCredentials, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated() && user) {
            // Redirect based on role
            if (user.role === 'admin' || user.role === 'owner') {
                navigate('/owner/dashboard');
            } else if (user.role === 'staff') {
                navigate('/staff/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    const handleLocalLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginWithCredentials(email, password);
            // Redirect happens in useEffect
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div
                    className="auth-image-col"
                    style={{ backgroundImage: `url(/assets/login-bg.png)` }}
                >
                    <div className="auth-overlay">
                        <h2>Taste the Best.</h2>
                        <p>Experience the quickest food delivery in town.</p>
                    </div>
                </div>

                <div className="auth-form-col">
                    <div className="auth-form-content">
                        <div className="auth-header">
                            <h2>Welcome Back</h2>
                            <p className="auth-subtitle">Sign in to your account to continue</p>
                        </div>
                        
                        {/* ─── Customer Login (Asgardeo) ─── */}
                        <div className="customer-login-section">
                            <button
                                className="btn btn-primary btn-block"
                                onClick={loginWithAsgardeo}
                                style={{ padding: '0.85rem', marginBottom: '1.5rem', backgroundColor: '#FF7043', border: 'none' }}
                            >
                                <i className="fas fa-user" style={{ marginRight: '0.5rem' }}></i>
                                Customer Sign in (Asgardeo)
                            </button>
                        </div>
                        
                        <div className="divider" style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                            <span style={{ margin: '0 1rem', color: '#888', fontSize: '0.9rem' }}>or continue with email</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                        </div>

                        {/* ─── Admin / Staff / Owner Login (Local DB) ─── */}
                        <form onSubmit={handleLocalLogin} className="local-login-form">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#444' }}>Staff & Partner Portal</h3>
                            
                            {error && <div className="alert alert-danger" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                            
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555' }}>Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            
                            <button
                                type="submit"
                                className="btn btn-block"
                                disabled={loading}
                                style={{ width: '100%', padding: '0.85rem', backgroundColor: '#2C3E50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In as Staff/Owner'}
                            </button>
                        </form>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
