import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import './Cart.css';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);

    useEffect(() => {
        // Wait for auth to load before checking
        if (authLoading) return;

        if (!isAuthenticated()) {
            navigate('/login?redirect=/cart');
            return;
        }
        loadCart();
    }, [authLoading, isAuthenticated]);

    const loadCart = async () => {
        try {
            const response = await cartAPI.get();
            setCart(response.data.data);
        } catch (err) {
            console.error('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            confirmRemoveItem(itemId);
            return;
        }

        try {
            await cartAPI.updateItem(itemId, { quantity: newQuantity });
            await loadCart();
        } catch (err) {
            setToast({ message: 'Failed to update quantity', type: 'error' });
        }
    };

    const confirmRemoveItem = (itemId) => {
        setItemToDelete(itemId);
        setShowDeleteModal(true);
    };

    const executeRemoveItem = async () => {
        if (!itemToDelete) return;

        try {
            await cartAPI.removeItem(itemToDelete);
            await loadCart();
            setItemToDelete(null);
        } catch (err) {
            setToast({ message: 'Failed to remove item', type: 'error' });
        }
    };

    const confirmClearCart = () => {
        setShowClearModal(true);
    };

    const executeClearCart = async () => {
        try {
            await cartAPI.clear();
            await loadCart();
            // alert('Cart cleared successfully!'); // Removed alert for smoother UX
        } catch (err) {
            console.error('Clear cart error:', err);
            setToast({ message: 'Failed to clear cart: ' + (err.response?.data?.message || err.message), type: 'error' });
        }
    };

    const proceedToCheckout = () => {
        if (!cart || cart.items.length === 0) return;

        // Filter valid items
        const validItems = cart.items.filter(item => item.menuItem !== null);
        if (validItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="empty-cart-container">
                <div className="empty-cart">
                    <div className="empty-state-icon">
                        <i className="fas fa-shopping-cart"></i>
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious items to get started!</p>
                </div>
            </div>
        );
    }

    // Filter out items with null menuItem (orphaned items)
    const validItems = cart.items.filter(item => item.menuItem !== null);

    if (validItems.length === 0) {
        return (
            <div className="empty-cart-container">
                <div className="empty-cart">
                    <div className="empty-state-icon">
                        <i className="fas fa-shopping-cart"></i>
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious items to get started!</p>
                </div>
            </div>
        );
    }

    const subtotal = validItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const deliveryFee = 5;
    const total = subtotal + tax + deliveryFee;

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <div className="cart-breadcrumb">
                        <Link to="/">Home</Link>
                        <i className="fas fa-chevron-right"></i>
                        <span>Cart</span>
                    </div>
                </div>

                <div className="cart-grid-wrapper">
                    {/* Cart Items */}
                    <div className="cart-items-list">
                        {validItems.map(item => (
                            <div key={item._id} className="cart-item-row">
                                <div className="item-image">
                                    <i className="fas fa-concierge-bell"></i>
                                </div>
                                <div className="item-details">
                                    <h3>{item.menuItem?.name || 'Menu Item'}</h3>
                                    <div className="item-price">{formatCurrency(item.menuItem?.price)}</div>
                                    <div className="item-actions">
                                        <div className="quantity-controls">
                                            <button className="quantity-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                                                −
                                            </button>
                                            <span className="quantity-display">{item.quantity}</span>
                                            <button className="quantity-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                                                +
                                            </button>
                                        </div>
                                        <button className="remove-btn" onClick={() => confirmRemoveItem(item._id)}>
                                            <i className="fas fa-trash"></i> Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="item-total">{formatCurrency(item.menuItem.price * item.quantity)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary-card">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span className="label">Subtotal</span>
                            <span className="price">{formatCurrency(subtotal)}</span>
                        </div>

                        <div className="summary-row">
                            <span className="label">Tax <span className="tax-note">(10%)</span></span>
                            <span className="price">{formatCurrency(tax)}</span>
                        </div>

                        <div className="summary-row">
                            <span className="label">Delivery Fee</span>
                            <span className="price">{formatCurrency(deliveryFee)}</span>
                        </div>

                        <div className="summary-row total">
                            <span className="label">Total</span>
                            <span className="price">{formatCurrency(total)}</span>
                        </div>

                        <div className="checkout-actions">
                            <button className="btn-checkout" onClick={proceedToCheckout}>
                                <i className="fas fa-lock"></i> Proceed to Checkout
                            </button>

                            <button className="btn-clear" onClick={confirmClearCart}>
                                <i className="fas fa-trash"></i> Clear Cart
                            </button>
                        </div>

                        <div className="secure-checkout">
                            <i className="fas fa-shield-alt"></i>
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={executeRemoveItem}
                title="Remove Item?"
                message="Are you sure you want to remove this item from your cart? This action cannot be undone."
                type="danger"
                confirmText="Remove"
            />

            <Modal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={executeClearCart}
                title="Clear Cart?"
                message="Are you sure you want to remove all items from your cart?"
                type="danger"
                confirmText="Clear All"
            />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default Cart;
