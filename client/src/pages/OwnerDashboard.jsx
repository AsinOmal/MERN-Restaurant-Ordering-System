import { useState, useEffect } from 'react';
import { restaurantAPI, menuAPI, orderAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import MenuItemForm from '../components/MenuItemForm';
import Modal from '../components/Modal';
import './OwnerDashboard.css';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area
} from 'recharts';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [myRestaurants, setMyRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ todayOrders: 0, totalRevenue: 0, activeItems: 0 });

    // Analytics States
    const [revenueData, setRevenueData] = useState(null);
    const [popularItems, setPopularItems] = useState([]);
    const [orderTrends, setOrderTrends] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // Filter/Search States
    const [menuSearchQuery, setMenuSearchQuery] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');

    // Restaurant Edit States
    const [editMode, setEditMode] = useState(false);
    const [restaurantFormData, setRestaurantFormData] = useState({});

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Load initial data (restaurants)
    const loadDashboardData = async () => {
        try {
            const restsResponse = await restaurantAPI.getAll();
            // Filter for owned restaurants if API returns all
            const myRests = restsResponse.data.data.filter(r => r.owner?._id === user._id || r.owner === user._id);
            setMyRestaurants(myRests);

            if (myRests.length > 0) {
                setSelectedRestaurant(myRests[0]);
                // Load data for the default selected restaurant
                await loadRestaurantData(myRests[0]._id);
            }

            // Load Analytics Data independently
            loadAnalyticsData();
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRestaurantData = async (restaurantId) => {
        try {
            const [menuResp, ordersResp] = await Promise.all([
                menuAPI.getAll({ restaurant: restaurantId }),
                orderAPI.getAll()
            ]);

            setMenuItems(menuResp.data.data);

            // Filter orders for this restaurant
            const restOrders = ordersResp.data.data.filter(o => o.restaurant?._id === restaurantId);
            setOrders(restOrders);

            // Calculate basic stats
            const today = new Date().toDateString();
            const todayOrders = restOrders.filter(o => new Date(o.orderedAt).toDateString() === today);
            const totalRevenue = restOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            const activeItems = menuResp.data.data.filter(item => item.available).length;

            setStats({ todayOrders: todayOrders.length, totalRevenue, activeItems });
        } catch (err) {
            console.error('Failed to load restaurant data', err);
        }
    };

    const loadAnalyticsData = async () => {
        try {
            const [revenueRes, popularRes] = await Promise.all([
                analyticsAPI.getRevenue(),
                analyticsAPI.getPopularItems()
            ]);
            setRevenueData(revenueRes.data.data);
            setPopularItems(popularRes.data.data);
        } catch (err) {
            console.error('Failed to load analytics', err);
        }
    };

    // Menu Item Handlers
    const handleAddItem = async (formData) => {
        try {
            await menuAPI.create({ ...formData, restaurant: selectedRestaurant._id });
            setShowAddModal(false);
            await loadRestaurantData(selectedRestaurant._id);
        } catch (err) {
            alert('Failed to create item');
        }
    };

    const handleEditItem = async (formData) => {
        try {
            await menuAPI.update(currentItem._id, formData);
            setShowEditModal(false);
            setCurrentItem(null);
            await loadRestaurantData(selectedRestaurant._id);
        } catch (err) {
            alert('Failed to update item');
        }
    };

    const handleDeleteItem = async () => {
        try {
            await menuAPI.delete(currentItem._id);
            setShowDeleteModal(false);
            setCurrentItem(null);
            await loadRestaurantData(selectedRestaurant._id);
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const toggleAvailability = async (item) => {
        try {
            await menuAPI.update(item._id, { available: !item.available });
            await loadRestaurantData(selectedRestaurant._id);
        } catch (err) {
            console.error('Failed to update availability');
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    if (myRestaurants.length === 0) {
        return (
            <div className="empty-state-full">
                <i className="fas fa-store-slash"></i>
                <h2>No Restaurant Registered</h2>
                <p>Contact admin to register your restaurant</p>
            </div>
        );
    }

    // Render Helpers
    const renderOverview = () => (
        <div className="overview-section">
            <div className="dashboard-header">
                <div>
                    <h1>{selectedRestaurant?.name}</h1>
                    <p className="welcome-text">{selectedRestaurant?.address?.street}, {selectedRestaurant?.address?.city}</p>
                </div>
                {myRestaurants.length > 1 && (
                    <select
                        className="restaurant-selector"
                        value={selectedRestaurant?._id}
                        onChange={(e) => {
                            const rest = myRestaurants.find(r => r._id === e.target.value);
                            setSelectedRestaurant(rest);
                            loadRestaurantData(rest._id);
                        }}
                    >
                        {myRestaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                )}
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="status-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                        <i className="fas fa-shopping-bag"></i>
                    </div>
                    <div className="status-info">
                        <h3>Orders Today</h3>
                        <p>{stats.todayOrders}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="status-icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="status-info">
                        <h3>Total Revenue</h3>
                        <p>{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="status-icon" style={{ backgroundColor: '#fff3e0', color: '#ef6c00' }}>
                        <i className="fas fa-utensils"></i>
                    </div>
                    <div className="status-info">
                        <h3>Active Items</h3>
                        <p>{stats.activeItems}</p>
                    </div>
                </div>
            </div>

            <div className="recent-orders card" style={{ marginTop: '2rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
                <h3 style={{ marginBottom: '1rem', color: '#2d3436' }}>Recent Activity</h3>
                {orders.length === 0 ? <p>No orders yet</p> : (
                    <div className="orders-list-grid">
                        {orders.slice(0, 5).map(order => (
                            <div key={order._id} className="order-card-row" style={{ padding: '1rem' }}>
                                <div className="order-main-info">
                                    <div className="order-id-group">
                                        <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                                        <span className="order-time">{new Date(order.orderedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="order-customer" style={{ fontSize: '0.85rem' }}>
                                        {order.items.length} items • {formatCurrency(order.totalAmount)}
                                    </div>
                                </div>
                                <div className="order-status-group" style={{ minWidth: 'auto' }}>
                                    <span className={`status-pill status-${order.status}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="analytics-section">
            <h1 style={{ marginBottom: '2rem' }}>Analytics Overview</h1>
            {revenueData ? (
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>Revenue Trends (30 Days)</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData.chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2ecc71" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="total" stroke="#2ecc71" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="chart-card">
                        <h3>Top Selling Items</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={popularItems} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#e74c3c" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : <p>Loading analytics...</p>}
        </div>
    );

    const renderMenu = () => {
        // Filter menu items based on search
        const filteredMenuItems = menuItems.filter(item =>
            item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()))
        );

        return (
            <div className="menu-management">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Menu Management</h1>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <i className="fas fa-plus"></i> Add New Item
                    </button>
                </div>

                {/* Search Bar */}
                <div className="search-bar" style={{ marginBottom: '2rem' }}>
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={menuSearchQuery}
                        onChange={(e) => setMenuSearchQuery(e.target.value)}
                    />
                    {menuSearchQuery && (
                        <button className="clear-search" onClick={() => setMenuSearchQuery('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>

                <p style={{ marginBottom: '1rem', color: '#666' }}>
                    Showing {filteredMenuItems.length} of {menuItems.length} items
                </p>

                <div className="menu-items-grid">
                    {filteredMenuItems.map(item => (
                        <div key={item._id} className="menu-item-card">
                            {item.image && (
                                <div className="item-image-preview">
                                    <img src={item.image} alt={item.name} />
                                </div>
                            )}
                            <div className="item-content">
                                <div className="item-header">
                                    <h4>{item.name}</h4>
                                    <span className="item-price-badge">{formatCurrency(item.price)}</span>
                                </div>
                                <p className="item-description">{item.description}</p>
                                <div className="item-actions">
                                    <button
                                        className={`availability-toggle ${item.available ? 'active' : 'inactive'}`}
                                        onClick={() => toggleAvailability(item)}
                                    >
                                        {item.available ? 'Available' : 'Unavailable'}
                                    </button>
                                    <div className="action-buttons">
                                        <button className="btn-icon edit-btn" onClick={() => { setCurrentItem(item); setShowEditModal(true); }}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn-icon delete-btn" onClick={() => { setCurrentItem(item); setShowDeleteModal(true); }}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSettings = () => {
        if (!selectedRestaurant) return null;

        return (
            <div className="settings-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Restaurant Settings</h1>
                    {!editMode && (
                        <button className="btn btn-primary" onClick={() => {
                            setEditMode(true);
                            setRestaurantFormData({
                                name: selectedRestaurant.name,
                                description: selectedRestaurant.description,
                                phone: selectedRestaurant.phone,
                                street: selectedRestaurant.address?.street || '',
                                city: selectedRestaurant.address?.city || '',
                                postalCode: selectedRestaurant.address?.postalCode || ''
                            });
                        }}>
                            <i className="fas fa-edit"></i> Edit Profile
                        </button>
                    )}
                </div>

                {editMode ? (
                    <div className="card" style={{ padding: '2rem' }}>
                        <form onSubmit={handleUpdateRestaurant}>
                            <div className="form-group">
                                <label>Restaurant Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={restaurantFormData.name || ''}
                                    onChange={(e) => setRestaurantFormData({ ...restaurantFormData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={restaurantFormData.description || ''}
                                    onChange={(e) => setRestaurantFormData({ ...restaurantFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={restaurantFormData.phone || ''}
                                    onChange={(e) => setRestaurantFormData({ ...restaurantFormData, phone: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={restaurantFormData.street || ''}
                                    onChange={(e) => setRestaurantFormData({ ...restaurantFormData, street: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={restaurantFormData.city || ''}
                                        onChange={(e) => setRestaurantFormData({ ...restaurantFormData, city: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={restaurantFormData.postalCode || ''}
                                        onChange={(e) => setRestaurantFormData({ ...restaurantFormData, postalCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-save"></i> Save Changes
                                </button>
                                <button type="button" className="btn btn-outline" onClick={() => setEditMode(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '2rem' }}>
                        <div className="profile-view">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Restaurant Name</h3>
                                <p style={{ fontSize: '1.1rem' }}>{selectedRestaurant.name}</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Description</h3>
                                <p>{selectedRestaurant.description}</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Contact Phone</h3>
                                <p>{selectedRestaurant.phone}</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Address</h3>
                                <p>{selectedRestaurant.address?.street}</p>
                                <p>{selectedRestaurant.address?.city}, {selectedRestaurant.address?.postalCode}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-sidebar">
                <div className="user-profile-brief">
                    <div className="avatar-circle">O</div>
                    <div className="user-info">
                        <h3>Owner Dashboard</h3>
                        <p>{user?.name}</p>
                    </div>
                </div>
                <nav className="dashboard-nav">
                    <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <i className="fas fa-home"></i> Overview
                    </button>
                    <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                        <i className="fas fa-chart-line"></i> Analytics
                    </button>
                    <button className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
                        <i className="fas fa-utensils"></i> Menu
                    </button>
                    <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                        <i className="fas fa-clipboard-list"></i> Orders
                    </button>
                    <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                        <i className="fas fa-cog"></i> Settings
                    </button>
                </nav>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'menu' && renderMenu()}
                {activeTab === 'settings' && renderSettings()}
                {activeTab === 'orders' && (
                    <div className="orders-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h1>Order Management</h1>
                            <select
                                className="sort-select"
                                value={orderStatusFilter}
                                onChange={(e) => setOrderStatusFilter(e.target.value)}
                                style={{ minWidth: '200px', padding: '0.5rem', borderRadius: '8px', borderColor: '#ddd' }}
                            >
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="out-for-delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {(() => {
                            const filteredOrders = orderStatusFilter === 'all'
                                ? orders
                                : orders.filter(o => o.status === orderStatusFilter);

                            return (
                                <>
                                    <p style={{ marginBottom: '1.5rem', color: '#666' }}>Showing {filteredOrders.length} of {orders.length} orders</p>
                                    <div className="recent-orders">
                                        {filteredOrders.length === 0 ? (
                                            <div className="empty-state-card" style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #eee' }}>
                                                <i className="fas fa-clipboard-list" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
                                                <p style={{ color: '#666' }}>No orders found</p>
                                            </div>
                                        ) : (
                                            <div className="orders-list-grid">
                                                {filteredOrders.map(order => (
                                                    <div key={order._id} className="order-card-row">
                                                        <div className="order-main-info">
                                                            <div className="order-id-group">
                                                                <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                                                                <span className="order-time">{new Date(order.orderedAt).toLocaleString()}</span>
                                                            </div>
                                                            <div className="order-customer">
                                                                <i className="fas fa-user-circle"></i> {order.customer?.name || 'Guest'}
                                                            </div>
                                                            <div className="order-items-preview">
                                                                {order.items.map((item, idx) => (
                                                                    <span key={idx} className="item-pill">
                                                                        {item.quantity}x {item.menuItem?.name || 'Item'}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="order-status-group">
                                                            <span className={`status-pill status-${order.status}`}>
                                                                {order.status.replace('-', ' ')}
                                                            </span>
                                                            <p className="order-total">{formatCurrency(order.totalAmount)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAddModal && <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} type="form"><MenuItemForm onSubmit={handleAddItem} onCancel={() => setShowAddModal(false)} /></Modal>}
            {showEditModal && currentItem && <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} type="form"><MenuItemForm item={currentItem} onSubmit={handleEditItem} onCancel={() => setShowEditModal(false)} /></Modal>}
            {showDeleteModal && <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteItem} title="Delete Item" message="Are you sure?" type="danger" confirmText="Delete" />}
        </div>
    );
};

export default OwnerDashboard;
