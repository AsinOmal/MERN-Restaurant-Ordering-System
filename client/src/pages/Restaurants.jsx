import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { restaurantAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import './Restaurants.css';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [sortBy, setSortBy] = useState('name');

    const { user } = useAuth(); // Create this context hook first
    const [favorites, setFavorites] = useState([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadRestaurants();
        if (user) {
            loadFavorites();
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [restaurants, searchQuery, selectedCuisine, sortBy]);

    const loadRestaurants = async () => {
        try {
            const response = await restaurantAPI.getAll();
            setRestaurants(response.data.data);
        } catch (err) {
            setError('Failed to load restaurants');
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const response = await favoritesAPI.getAll();
            // Store just IDs for easy lookup
            setFavorites(response.data.data.map(fav => fav._id));
        } catch (err) {
            console.error('Failed to load favorites');
        }
    };

    const toggleFavorite = async (e, restaurantId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            if (favorites.includes(restaurantId)) {
                await favoritesAPI.remove(restaurantId);
                setFavorites(prev => prev.filter(id => id !== restaurantId));
            } else {
                await favoritesAPI.add(restaurantId);
                setFavorites(prev => [...prev, restaurantId]);
            }
        } catch (err) {
            console.error('Failed to toggle favorite');
        }
    };

    const applyFilters = () => {
        let filtered = [...restaurants];

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.cuisineTypes.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Cuisine filter
        if (selectedCuisine !== 'All') {
            filtered = filtered.filter(r =>
                r.cuisineTypes.includes(selectedCuisine)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'reviews') return b.totalReviews - a.totalReviews;
            return 0;
        });

        setFilteredRestaurants(filtered);
    };

    // Get unique cuisines
    const allCuisines = ['All', ...new Set(restaurants.flatMap(r => r.cuisineTypes))];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading restaurants...</p>
            </div>
        );
    }

    return (
        <div className="restaurants-page">
            <div className="container">
                <div className="page-header">
                    <h1>Discover <span className="accent-text">Restaurants</span></h1>
                    <p>Find your favorite restaurants and cuisines</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Search and Filters */}
                <div className="filters-section">
                    <div className="search-bar">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search restaurants or cuisines..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    <div className="filter-controls">
                        <div className="cuisine-filters">
                            {allCuisines.map(cuisine => (
                                <button
                                    key={cuisine}
                                    className={`cuisine-chip ${selectedCuisine === cuisine ? 'active' : ''}`}
                                    onClick={() => setSelectedCuisine(cuisine)}
                                >
                                    {cuisine}
                                </button>
                            ))}
                        </div>

                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="reviews">Sort by Reviews</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="results-info">
                    <p>{filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found</p>
                </div>

                {filteredRestaurants.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-search" style={{ fontSize: '4rem', color: 'var(--color-gray-400)', marginBottom: '1rem' }}></i>
                        <h3>No restaurants found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {filteredRestaurants.map((restaurant) => (
                            <Link to={`/menu/${restaurant._id}`} key={restaurant._id} className="restaurant-card card">
                                {restaurant.image ? (
                                    <div className="restaurant-image-real">
                                        <button
                                            className={`favorite-btn ${favorites.includes(restaurant._id) ? 'active' : ''}`}
                                            onClick={(e) => toggleFavorite(e, restaurant._id)}
                                            aria-label={favorites.includes(restaurant._id) ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <i className={`fas fa-heart ${favorites.includes(restaurant._id) ? 'filled' : ''}`}></i>
                                        </button>
                                        <img src={restaurant.image} alt={restaurant.name} />
                                    </div>
                                ) : (
                                    <div className="restaurant-image">
                                        <button
                                            className={`favorite-btn ${favorites.includes(restaurant._id) ? 'active' : ''}`}
                                            onClick={(e) => toggleFavorite(e, restaurant._id)}
                                            aria-label={favorites.includes(restaurant._id) ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <i className={`fas fa-heart ${favorites.includes(restaurant._id) ? 'filled' : ''}`}></i>
                                        </button>
                                        <i className="fas fa-store"></i>
                                    </div>
                                )}
                                <div className="restaurant-content">
                                    <h3>{restaurant.name}</h3>
                                    <p className="restaurant-address">
                                        <i className="fas fa-map-marker-alt"></i>
                                        {restaurant.address.street}, {restaurant.address.city}
                                    </p>
                                    <p className="restaurant-cuisine">
                                        {restaurant.cuisineTypes.join(' • ')}
                                    </p>
                                    <div className="restaurant-rating">
                                        <div className="stars">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <i
                                                    key={star}
                                                    className={`fas fa-star ${star <= Math.round(restaurant.rating) ? 'filled' : 'empty'}`}
                                                ></i>
                                            ))}
                                        </div>
                                        <span className="rating-number">{restaurant.rating.toFixed(1)}</span>
                                        <span className="review-count">({restaurant.totalReviews} {restaurant.totalReviews === 1 ? 'review' : 'reviews'})</span>
                                    </div>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                        <i className="fas fa-utensils"></i> View Menu
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onConfirm={() => navigate('/login')}
                title="Login Required"
                message="Please log in to save your favorite restaurants."
                confirmText="Login"
                cancelText="Cancel"
            />
        </div>
    );
};

export default Restaurants;
