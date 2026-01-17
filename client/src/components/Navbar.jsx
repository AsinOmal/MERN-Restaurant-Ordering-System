import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <i className="fas fa-utensils"></i>
                    FoodFlow
                </Link>
                <ul className="navbar-nav">
                    <li><Link to="/">Home</Link></li>

                    {/* Customer-specific links */}
                    {isAuthenticated() && user?.role === 'customer' && (
                        <>
                            <li><Link to="/restaurants">Restaurants</Link></li>
                            <li><Link to="/cart"><i className="fas fa-shopping-cart"></i> Cart</Link></li>
                            <li><Link to="/orders">My Orders</Link></li>
                            <li><Link to="/profile"><i className="fas fa-user"></i> Profile</Link></li>
                        </>
                    )}

                    {/* Staff-specific links */}
                    {isAuthenticated() && user?.role === 'staff' && (
                        <>
                            <li><Link to="/staff/dashboard">Dashboard</Link></li>
                            <li><Link to="/staff/dashboard">Manage Orders</Link></li>
                        </>
                    )}

                    {/* Owner-specific links */}
                    {isAuthenticated() && user?.role === 'owner' && (
                        <>
                            <li><Link to="/owner/dashboard">Dashboard</Link></li>
                            <li><Link to="/owner/dashboard">My Restaurant</Link></li>
                        </>
                    )}

                    {/* Non-authenticated users */}
                    {!isAuthenticated() && (
                        <li><Link to="/restaurants">Restaurants</Link></li>
                    )}

                    {isAuthenticated() ? (
                        <li>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </li>
                    ) : (
                        <li><Link to="/login">Login</Link></li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
