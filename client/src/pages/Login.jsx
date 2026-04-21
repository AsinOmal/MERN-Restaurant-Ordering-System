import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

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

                        <button
                            className="btn btn-primary btn-block"
                            onClick={login}
                            style={{ marginTop: '2rem', padding: '0.85rem' }}
                        >
                            <i className="fas fa-sign-in-alt" style={{ marginRight: '0.5rem' }}></i>
                            Sign in with Asgardeo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
