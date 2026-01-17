import { useEffect, useState } from 'react';
import { reviewAPI } from '../services/api';
import './ReviewsList.css';

const ReviewsList = ({ restaurantId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (restaurantId) {
            fetchReviews();
        }
    }, [restaurantId]);

    const fetchReviews = async () => {
        try {
            const response = await reviewAPI.getAll({ restaurant: restaurantId });
            setReviews(response.data.data || []);

            // Calculate average rating
            if (response.data.data && response.data.data.length > 0) {
                const avg = response.data.data.reduce((sum, review) => sum + review.rating, 0) / response.data.data.length;
                setAverageRating(avg.toFixed(1));
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <i
                key={index}
                className={`fas fa-star ${index < rating ? 'filled' : 'empty'}`}
            ></i>
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div className="reviews-loading">Loading reviews...</div>;
    }

    return (
        <div className="reviews-section">
            <div className="reviews-header">
                <h2>Customer Reviews</h2>
                {reviews.length > 0 && (
                    <div className="reviews-summary">
                        <div className="average-rating">
                            <span className="rating-number">{averageRating}</span>
                            <div className="rating-stars">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <span className="review-count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                        </div>
                    </div>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="no-reviews">
                    <i className="fas fa-comment-slash"></i>
                    <p>No reviews yet. Be the first to review this restaurant!</p>
                </div>
            ) : (
                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div key={review._id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <h4 className="reviewer-name">{review.user?.name || 'Anonymous'}</h4>
                                        <div className="review-stars">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                </div>
                                <span className="review-date">{formatDate(review.createdAt)}</span>
                            </div>
                            {review.comment && (
                                <p className="review-comment">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsList;
