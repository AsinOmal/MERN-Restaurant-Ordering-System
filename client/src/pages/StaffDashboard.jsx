import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatCurrency, formatDateTime, ORDER_STATUS } from '../utils/helpers';
import Toast from '../components/Toast';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadOrders();
    }, [filter]);

    // Real-time updates listener
    useEffect(() => {
        if (!socket) return;

        socket.on('order:new', (data) => {
            console.log('New order received:', data);
            // Add new order to top of list if it matches filter
            if (filter === 'all' || filter === 'pending') {
                setOrders(prev => [data.order, ...prev]);
                setToast({ message: `New Order received! #${data.order._id.slice(-6)}`, type: 'success' });
            }
        });

        socket.on('order:update', (data) => {
            console.log('Order update received:', data);
            setOrders(prev => prev.map(order =>
                order._id === data.orderId ? { ...order, status: data.status } : order
            ));
        });

        return () => {
            socket.off('order:new');
            socket.off('order:update');
        };
    }, [socket, filter]);

    const loadOrders = async () => {
        try {
            const response = await orderAPI.getAll({ status: filter !== 'all' ? filter : undefined });
            setOrders(response.data.data);
        } catch (err) {
            console.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            await loadOrders();
            setToast({ message: `Order status updated to ${newStatus}!`, type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to update order status', type: 'error' });
        }
    };

    const getStatusBadge = (status) => {
        const statusInfo = ORDER_STATUS[status] || ORDER_STATUS.pending;
        return (
            <span className="status-badge" style={{ background: statusInfo.color }}>
                <i className={`fas ${statusInfo.icon}`}></i> {statusInfo.label}
            </span>
        );
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="staff-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Staff Dashboard</h1>
                        <p className="welcome-text">Welcome back, {user?.name}!</p>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <i className="fas fa-clock"></i>
                            <div>
                                <span className="stat-value">{orders.filter(o => o.status === 'pending').length}</span>
                                <span className="stat-label">Pending</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-fire"></i>
                            <div>
                                <span className="stat-value">{orders.filter(o => o.status === 'preparing').length}</span>
                                <span className="stat-label">Preparing</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-filters">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        All Orders
                    </button>
                    <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        Pending
                    </button>
                    <button className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`} onClick={() => setFilter('preparing')}>
                        Preparing
                    </button>
                    <button className={`filter-btn ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}>
                        Ready
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-inbox"></i>
                        <h3>No orders found</h3>
                        <p>Waiting for orders to come in...</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map(order => (
                            <div key={order._id} className="order-card card">
                                <div className="order-card-header">
                                    <div>
                                        <h4>Order #{order._id.slice(-6)}</h4>
                                        <p className="order-time">{formatDateTime(order.orderedAt)}</p>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="order-customer">
                                    <i className="fas fa-user"></i>
                                    <span>{order.customer?.name || 'Customer'}</span>
                                </div>

                                <div className="order-items-summary">
                                    <strong>Items ({order.items.length}):</strong>
                                    <ul>
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <li key={idx}>{item.quantity}x {item.name || 'Item'}</li>
                                        ))}
                                        {order.items.length > 3 && <li>+{order.items.length - 3} more...</li>}
                                    </ul>
                                </div>

                                <div className="order-card-footer">
                                    <span className="order-total">{formatCurrency(order.totalAmount)}</span>
                                    <div className="order-actions">
                                        {order.status === 'pending' && (
                                            <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(order._id, 'confirmed')}>
                                                <i className="fas fa-check"></i> Accept
                                            </button>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button className="btn btn-success btn-sm" onClick={() => updateOrderStatus(order._id, 'preparing')}>
                                                <i className="fas fa-fire"></i> Start Cooking
                                            </button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <button className="btn btn-warning btn-sm" onClick={() => updateOrderStatus(order._id, 'ready')}>
                                                <i className="fas fa-check-circle"></i> Mark Ready
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button className="btn btn-info btn-sm" onClick={() => updateOrderStatus(order._id, 'out-for-delivery')}>
                                                <i className="fas fa-shipping-fast"></i> Out for Delivery
                                            </button>
                                        )}
                                        {order.status === 'out-for-delivery' && (
                                            <button className="btn btn-success btn-sm" onClick={() => updateOrderStatus(order._id, 'delivered')}>
                                                <i className="fas fa-check-double"></i> Mark Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default StaffDashboard;
