import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isRegister) {
                result = await register(formData);
            } else {
                result = await login({ email: formData.email, password: formData.password });
            }

            // Role-based redirect
            const userRole = result.user.role;
            if (userRole === 'staff') {
                navigate('/staff/dashboard');
            } else if (userRole === 'owner') {
                navigate('/owner/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Image Column */}
                <div
                    className="auth-image-col"
                    style={{
                        backgroundImage: `url(${isRegister ? '/assets/register-bg.png' : '/assets/login-bg.png'})`
                    }}
                >
                    <div className="auth-overlay">
                        <h2>{isRegister ? 'Join the Flavour.' : 'Taste the Best.'}</h2>
                        <p>Experience the quickest food delivery in town.</p>
                    </div>
                </div>

                {/* Form Column */}
                <div className="auth-form-col">
                    <div className="auth-form-content">
                        <div className="auth-header">
                            <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                            <p className="auth-subtitle">
                                {isRegister ? 'Enter your details to get started' : 'Please enter your details to login'}
                            </p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {isRegister && (
                                <>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+1 234 567 890"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="mail@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
                            </button>
                        </form>

                        <div className="toggle-auth">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button onClick={() => setIsRegister(!isRegister)} className="link-button">
                                {isRegister ? 'Sign in' : 'Sign up for free'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
