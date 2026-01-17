import { useState } from 'react';
import './ReviewForm.css';

const ReviewForm = ({ orderId, restaurantId, onSubmit, onCancel, existingReview = null }) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            setError('Please write a comment');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({ orderId, restaurant: restaurantId, rating, comment });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                className={`star-button ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
            >
                <i className={`fas fa-star`}></i>
            </button>
        ));
    };

    return (
        <div className="review-form-container">
            <h3>{existingReview ? 'Edit Your Review' : 'Leave a Review'}</h3>

            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label>Your Rating *</label>
                    <div className="star-rating">
                        {renderStars()}
                        {rating > 0 && (
                            <span className="rating-text">
                                {rating} {rating === 1 ? 'star' : 'stars'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="comment">Your Review *</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this restaurant..."
                        rows="5"
                        maxLength="500"
                        required
                    />
                    <small className="char-count">{comment.length}/500 characters</small>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i>
                                {existingReview ? 'Update Review' : 'Submit Review'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
