import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, menuAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import Modal from '../components/Modal';
import ReviewsList from '../components/ReviewsList';
import './Menu.css';

const Menu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        applyFilters();
    }, [selectedCategory, searchQuery, menuItems]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [restResponse, menuResponse] = await Promise.all([
                restaurantAPI.getById(id),
                menuAPI.getAll({ restaurant: id })
            ]);

            setRestaurant(restResponse.data.data);
            const items = menuResponse.data.data;
            setMenuItems(items);

            const cats = [...new Set(items.map(item => item.category))];
            setCategories(cats);
        } catch (err) {
            setError('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = menuItems.filter(item => item.available);

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const showModal = (title, message, type = 'info') => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type
        });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleAddToCart = async (item) => {
        if (!isAuthenticated()) {
            navigate(`/login?redirect=/menu/${id}`);
            return;
        }

        try {
            await cartAPI.addItem({
                menuItem: item._id,
                quantity: 1,
                restaurant: id
            });

            showModal('Added to Cart', `${item.name} has been added to your cart.`, 'success');
        } catch (err) {
            console.error('Cart error:', err);
            showModal('Error', 'Failed to add item to cart', 'danger');
        }
    };

    // Helper to get image based on item content
    const getItemImage = (item) => {
        // If exact image exists, return it (assuming URL or path)
        if (item.image) return item.image;

        // Fallback logic
        const cat = item.category.toLowerCase();
        const name = item.name.toLowerCase();

        if (cat.includes('burger') || name.includes('burger')) return '/assets/food/burger.png';
        if (cat.includes('pizza') || name.includes('pizza')) return '/assets/food/pizza.png';
        if (cat.includes('dessert') || cat.includes('cake') || cat.includes('sweet')) return '/assets/food/dessert.png';

        // Default fallback for Asian/Bowl or generic
        return '/assets/food/bowl.png';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading menu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>{error}</h2>
                <button className="btn btn-primary" onClick={() => navigate('/restaurants')}>
                    Back to Restaurants
                </button>
            </div>
        );
    }

    return (
        <div className="menu-page">
            {/* Hero Header */}
            <div
                className="restaurant-hero"
                style={{
                    backgroundImage: restaurant?.image ? `url(${restaurant.image})` : 'linear-gradient(135deg, #2d3436, #000)'
                }}
            >
                <div className="hero-overlay">
                    <div className="container">
                        <button onClick={() => navigate('/restaurants')} className="back-button">
                            <i className="fas fa-arrow-left"></i> Back to Restaurants
                        </button>
                        <div className="hero-content">
                            <h1>{restaurant?.name}</h1>
                            <p className="cuisine-types">{restaurant?.cuisineTypes.join(' • ')}</p>
                            <div className="rating-info">
                                <span className="stars">{'★'.repeat(Math.floor(restaurant?.rating || 0))}</span>
                                <span className="rating-number">{restaurant?.rating.toFixed(1)}</span>
                                <span className="review-count">({restaurant?.totalReviews} reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Navigation / Search */}
            <div className="menu-controls">
                <div className="container control-flex">
                    <div className="category-scroll">
                        <button
                            className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('all')}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="menu-search-bar">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Content */}
            <section className="section menu-section">
                <div className="container">
                    {filteredItems.length === 0 ? (
                        <div className="empty-menu">
                            <i className="fas fa-utensils"></i>
                            <h3>No items found</h3>
                        </div>
                    ) : (
                        <div className="menu-grid">
                            {filteredItems.map(item => (
                                <div key={item._id} className="menu-card">
                                    <div
                                        className="menu-card-image"
                                        style={{ backgroundImage: `url(${getItemImage(item)})` }}
                                    >
                                        {/* Optional badges could go here */}
                                    </div>
                                    <div className="menu-card-content">
                                        <div className="card-header">
                                            <h4>{item.name}</h4>
                                            <span className="item-price">{formatCurrency(item.price)}</span>
                                        </div>
                                        <p className="item-description">{item.description}</p>

                                        {item.dietary?.length > 0 && (
                                            <div className="dietary-tags">
                                                {item.dietary.map(tag => (
                                                    <span key={tag} className="badge-dietary">{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            className="add-btn"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <i className="fas fa-plus"></i> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="container" style={{ marginTop: "4rem" }}>
                    <ReviewsList restaurantId={id} />
                </div>
            </section>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText="OK"
                cancelText="Close"
            />
        </div>
    );
};

export default Menu;
