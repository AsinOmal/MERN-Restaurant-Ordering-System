import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ReviewForm from '../components/ReviewForm';
import { formatCurrency, formatDateTime, ORDER_STATUS } from '../utils/helpers';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const socket = useSocket(); // Use socket

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
    const [reviewModal, setReviewModal] = useState({ isOpen: false, order: null });

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated()) {
            navigate('/login?redirect=/orders');
            return;
        }
        loadOrders();
    }, [authLoading, isAuthenticated]);

    // Apply filters whenever orders, statusFilter, or searchQuery changes
    useEffect(() => {
        applyFilters();
    }, [orders, statusFilter, searchQuery]);

    // Real-time updates
    useEffect(() => {
        if (!socket) {
            console.log('[Orders] Socket not available');
            return;
        }

        console.log('[Orders] Setting up socket listeners');

        const handleOrderUpdate = (data) => {
            console.log('[Orders] ✅ Order update received:', data);
            setOrders(prev => {
                const updated = prev.map(order =>
                    order._id === data.orderId ? { ...order, status: data.status } : order
                );
                console.log('[Orders] Updated orders:', updated);
                return updated;
            });

            // Show toast notification
            if (data.message) {
                setToast({ message: data.message, type: 'info' });
            }
        };

        socket.on('order:update', handleOrderUpdate);

        return () => {
            console.log('[Orders] Cleaning up socket listeners');
            socket.off('order:update', handleOrderUpdate);
        };
    }, [socket]);

    const loadOrders = async () => {
        try {
            const response = await orderAPI.getAll();
            setOrders(response.data.data);
        } catch (err) {
            console.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...orders];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(order =>
                order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.restaurant?.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

        setFilteredOrders(filtered);
    };

    const cancelOrder = async (orderId) => {
        setCancelModal({ isOpen: true, orderId });
    };

    const confirmCancelOrder = async () => {
        try {
            await orderAPI.cancel(cancelModal.orderId);
            await loadOrders();
            setToast({ message: 'Order cancelled successfully', type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to cancel order', type: 'error' });
        } finally {
            setCancelModal({ isOpen: false, orderId: null });
        }
    };

    const openReviewModal = (order) => {
        setReviewModal({ isOpen: true, order });
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            await reviewAPI.create(reviewData);
            setToast({ message: 'Review submitted successfully! Thank you for your feedback.', type: 'success' });
            setReviewModal({ isOpen: false, order: null });
            await loadOrders(); // Reload to update review status
        } catch (err) {
            throw err; // Let ReviewForm handle the error
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
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="empty-orders-container">
                <div className="empty-orders">
                    <div className="empty-state-icon">
                        <i className="fas fa-shopping-bag"></i>
                    </div>
                    <h2>No orders yet</h2>
                    <p>Start ordering from your favorite restaurants!</p>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/restaurants')}>
                        <i className="fas fa-utensils"></i> Browse Restaurants
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="container">
                <h1 className="page-title">My Orders</h1>

                {/* Search Bar */}
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by Order ID or Restaurant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>

                {/* Status Filters */}
                <div className="status-filters">
                    {['all', 'pending', 'preparing', 'ready', 'delivered'].map(status => (
                        <button
                            key={status}
                            className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                <p className="results-count">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</p>

                <div className="orders-list">
                    {filteredOrders.map(order => (
                        <div key={order._id} className="order-card card">
                            <div className="order-header">
                                <div>
                                    <h3>{order.restaurant?.name || 'Restaurant'}</h3>
                                    <p className="order-date">
                                        <i className="fas fa-calendar"></i> {formatDateTime(order.orderedAt)}
                                    </p>
                                    <p className="order-id">
                                        <i className="fas fa-hashtag"></i> Order #{order._id.slice(-6)}
                                    </p>
                                </div>
                                <div className="order-status">
                                    {getStatusBadge(order.status)}
                                    <div className="order-total">{formatCurrency(order.totalAmount)}</div>
                                </div>
                            </div>

                            <div className="order-items">
                                <strong>Items:</strong>
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.quantity}x {item.name || 'Item'} - {formatCurrency(item.price * item.quantity)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="order-actions">
                                {(order.status === 'pending' || order.status === 'confirmed') && (
                                    <button className="btn btn-outline" onClick={() => cancelOrder(order._id)}>
                                        <i className="fas fa-times"></i> Cancel Order
                                    </button>
                                )}
                                {order.status === 'delivered' && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => openReviewModal(order)}
                                    >
                                        <i className="fas fa-star"></i> Leave Review
                                    </button>
                                )}
                                {(order.status === 'out-for-delivery' || order.status === 'preparing') && (
                                    <button className="btn btn-success">
                                        <i className="fas fa-map-marked-alt"></i> Track Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Modal
                isOpen={cancelModal.isOpen}
                onConfirm={confirmCancelOrder}
                onCancel={() => setCancelModal({ isOpen: false, orderId: null })}
                title="Cancel Order"
                message="Are you sure you want to cancel this order? This action cannot be undone."
                type="danger"
            />
            <Modal
                isOpen={reviewModal.isOpen}
                onCancel={() => setReviewModal({ isOpen: false, order: null })}
                title="Review Your Order"
                hideConfirm={true}
            >
                {reviewModal.order && (
                    <ReviewForm
                        orderId={reviewModal.order._id}
                        restaurantId={reviewModal.order.restaurant?._id}
                        onSubmit={handleSubmitReview}
                        onCancel={() => setReviewModal({ isOpen: false, order: null })}
                    />
                )}
            </Modal>
        </div>
    );
};

export default Orders;
