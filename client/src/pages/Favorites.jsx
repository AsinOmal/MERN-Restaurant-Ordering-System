import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../services/api';
import './Restaurants.css'; // Reusing restaurant card styles

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const response = await favoritesAPI.getAll();
            setFavorites(response.data.data);
        } catch (err) {
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (e, id) => {
        e.preventDefault();
        try {
            await favoritesAPI.remove(id);
            setFavorites(prev => prev.filter(restaurant => restaurant._id !== id));
        } catch (err) {
            console.error('Failed to remove favorite');
        }
    };

    if (loading) return <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>;

    return (
        <div className="home-page">
            <div className="container">
                <div className="header-section">
                    <div>
                        <h1>My Favorites</h1>
                        <p className="subtitle">Your saved spots for quick ordering</p>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div style={{ fontSize: '4rem', color: '#ddd', marginBottom: '1.5rem' }}>
                            <i className="fas fa-heart-broken"></i>
                        </div>
                        <h2>No favorites yet</h2>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>Start exploring restaurants and save the ones you love!</p>
                        <Link to="/restaurants" className="btn btn-primary">
                            Browse Restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {favorites.map((restaurant) => (
                            <Link to={`/menu/${restaurant._id}`} key={restaurant._id} className="restaurant-card card">
                                {restaurant.image ? (
                                    <div className="restaurant-image-real">
                                        <button
                                            className="favorite-btn active"
                                            onClick={(e) => removeFavorite(e, restaurant._id)}
                                            aria-label="Remove from favorites"
                                        >
                                            <i className="fas fa-heart filled"></i>
                                        </button>
                                        <img src={restaurant.image} alt={restaurant.name} />
                                    </div>
                                ) : (
                                    <div className="restaurant-image">
                                        <button
                                            className="favorite-btn active"
                                            onClick={(e) => removeFavorite(e, restaurant._id)}
                                            aria-label="Remove from favorites"
                                        >
                                            <i className="fas fa-heart filled"></i>
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
                                        <span className="review-count">({restaurant.totalReviews} reviews)</span>
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
        </div>
    );
};

export default Favorites;
