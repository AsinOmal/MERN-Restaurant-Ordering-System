import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            const response = await orderAPI.getById(id);
            setOrder(response.data.data);
        } catch (err) {
            console.error('Failed to load order', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (!order) {
        return (
            <div className="success-page">
                <div className="success-card card">
                    <h1 style={{ color: 'var(--color-error)' }}>Order Not Found</h1>
                    <p>We couldn't find the order details.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="success-page">
            <div className="success-card card">
                <div className="success-icon">
                    <i className="fas fa-check"></i>
                </div>

                <h1>Order Placed!</h1>
                <p>Thank you for your order. We've received it and will start preparing it shortly.</p>

                <div className="order-details-box">
                    <div className="detail-row">
                        <span className="detail-label">Order Number</span>
                        <span className="detail-value">#{order._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Restaurant</span>
                        <span className="detail-value">{order.restaurant.name}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Amount Paid</span>
                        <span className="detail-value accent-text">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Payment Method</span>
                        <span className="detail-value" style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span>
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/orders')}>
                        <i className="fas fa-list"></i> My Orders
                    </button>
                    <button className="btn btn-outline btn-lg" onClick={() => navigate('/')}>
                        <i className="fas fa-home"></i> Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
