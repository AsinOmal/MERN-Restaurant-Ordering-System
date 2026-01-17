import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with token
const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Reviews API
export const reviewAPI = {
    // Get reviews for a restaurant
    getRestaurantReviews: (restaurantId) => api.get(`/reviews?restaurant=${restaurantId}`),
    
    // Get my reviews
    getMyReviews: () => api.get('/reviews/my-reviews'),
    
    // Create a review
    create: (reviewData) => api.post('/reviews', reviewData),
    
    // Update a review
    update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
    
    // Delete a review
    delete: (id) => api.delete(`/reviews/${id}`)
};

export default api;
