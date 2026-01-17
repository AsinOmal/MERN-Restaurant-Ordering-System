import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
    const { user, login } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        postalCode: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                postalCode: user.address?.postalCode || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                address: {
                    street: formData.street,
                    city: formData.city,
                    postalCode: formData.postalCode
                }
            };

            const response = await authAPI.updateProfile(updateData);

            // Update user in AuthContext
            localStorage.setItem('user', JSON.stringify(response.data.data));

            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Refresh page to update AuthContext
            window.location.reload();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await authAPI.updateProfile({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="container">
                <h1 className="page-title">My Profile</h1>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Information */}
                <div className="profile-section card">
                    <div className="section-header">
                        <h2>Personal Information</h2>
                        {!editing && (
                            <button className="btn btn-outline" onClick={() => setEditing(true)}>
                                <i className="fas fa-edit"></i> Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="disabled-field"
                                />
                                <small>Email cannot be changed</small>
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <input
                                    type="text"
                                    value={user?.role || 'customer'}
                                    disabled
                                    className="disabled-field"
                                />
                            </div>
                        </div>

                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Default Delivery Address</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="123 Main St"
                                />
                            </div>

                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="City"
                                />
                            </div>

                            <div className="form-group">
                                <label>Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="12345"
                                />
                            </div>
                        </div>

                        {editing && (
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Change Password */}
                <div className="profile-section card">
                    <h2>Change Password</h2>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength="6"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Account Stats */}
                <div className="profile-section card">
                    <h2>Account Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <i className="fas fa-calendar-alt"></i>
                            <div>
                                <h4>Member Since</h4>
                                <p>{new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="stat-item">
                            <i className="fas fa-user-tag"></i>
                            <div>
                                <h4>Account Type</h4>
                                <p>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
