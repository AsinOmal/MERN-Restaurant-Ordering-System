import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import Toast from '../components/Toast';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [formData, setFormData] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        postalCode: user?.address?.postalCode || '',
        phone: user?.phone || '',
        instructions: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated()) {
            navigate('/login?redirect=/checkout');
            return;
        }
        loadCart();
    }, [authLoading, isAuthenticated]);

    const loadCart = async () => {
        try {
            const response = await cartAPI.get();
            const cartData = response.data.data;

            if (!cartData || !cartData.items || cartData.items.length === 0) {
                navigate('/cart');
                return;
            }

            // Filter valid items
            const validItems = cartData.items.filter(item => item.menuItem !== null);
            if (validItems.length === 0) {
                navigate('/cart');
                return;
            }

            cartData.items = validItems; // Only use valid items
            setCart(cartData);
        } catch (err) {
            console.error('Failed to load cart', err);
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.street || !formData.city || !formData.phone) {
            setToast({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        setPlacingOrder(true);

        try {
            const subtotal = cart.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

            const orderData = {
                restaurant: cart.restaurant._id || cart.restaurant,
                items: cart.items.map(item => ({
                    menuItem: item.menuItem._id,
                    name: item.menuItem.name,
                    price: item.menuItem.price,
                    quantity: item.quantity
                })),
                subtotal: subtotal,
                deliveryAddress: {
                    street: formData.street,
                    city: formData.city,
                    postalCode: formData.postalCode,
                },
                paymentMethod: paymentMethod,
                specialInstructions: formData.instructions
            };

            console.log('Placing order:', orderData);
            const response = await orderAPI.create(orderData);
            const orderId = response.data.data._id;

            await cartAPI.clear();

            navigate(`/order-success/${orderId}`);
        } catch (err) {
            console.error('Checkout error:', err);
            setToast({ message: 'Failed to place order: ' + (err.response?.data?.message || err.message), type: 'error' });
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (!cart) return null;

    const subtotal = cart.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const deliveryFee = 5;
    const total = subtotal + tax + deliveryFee;

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="page-title">Checkout</h1>

                <form onSubmit={handleSubmit}>
                    <div className="checkout-grid">
                        {/* Forms Column */}
                        <div className="checkout-forms">
                            {/* Delivery Address */}
                            <div className="checkout-section card">
                                <h2>
                                    <div className="section-icon"><i className="fas fa-map-marker-alt"></i></div>
                                    Delivery Details
                                </h2>

                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Street Address</label>
                                        <input
                                            type="text"
                                            name="street"
                                            className="form-control"
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            placeholder="123 Main St"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="form-control"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            className="form-control"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            placeholder="12345"
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+1 (555) 000-0000"
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Delivery Instructions (Optional)</label>
                                        <textarea
                                            name="instructions"
                                            className="form-control"
                                            value={formData.instructions}
                                            onChange={handleInputChange}
                                            placeholder="Gate code, leave at door, etc."
                                            rows="2"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="checkout-section card">
                                <h2>
                                    <div className="section-icon"><i className="fas fa-credit-card"></i></div>
                                    Payment Method
                                </h2>

                                <div className="payment-methods">
                                    <div
                                        className={`payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        {paymentMethod === 'card' && <i className="fas fa-check-circle payment-check"></i>}
                                        <i className="fas fa-credit-card"></i>
                                        Credit Card
                                    </div>
                                    <div
                                        className={`payment-method-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('cash')}
                                    >
                                        {paymentMethod === 'cash' && <i className="fas fa-check-circle payment-check"></i>}
                                        <i className="fas fa-money-bill-wave"></i>
                                        Cash on Delivery
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Column */}
                        <div className="checkout-summary">
                            <div className="card">
                                <h2>Order Summary</h2>
                                <h4>{cart.restaurant.name}</h4>

                                <div className="summary-items">
                                    {cart.items.map(item => (
                                        <div key={item._id} className="summary-item">
                                            <div className="item-info">
                                                <h4>{item.menuItem.name}</h4>
                                                <span className="item-qty">Qty: {item.quantity}</span>
                                            </div>
                                            <div className="item-price">
                                                {formatCurrency(item.menuItem.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax (10%)</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span>{formatCurrency(deliveryFee)}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span className="accent-text">{formatCurrency(total)}</span>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg"
                                    type="submit"
                                    disabled={placingOrder}
                                    style={{ width: '100%', marginTop: '1.5rem' }}
                                >
                                    {placingOrder ? (
                                        <>
                                            <div className="spinner" style={{ width: '20px', height: '20px', borderSize: '2px' }}></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check"></i> Place Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default Checkout;
