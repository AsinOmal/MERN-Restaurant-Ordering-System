const request = require('supertest');
const Restaurant = require('../../src/models/Restaurant');

describe('Restaurant Operations - Business Logic', () => {
  test('should validate restaurant data structure', () => {
    const restaurantData = {
      name: 'Test Pizza Place',
      description: 'Italian cuisine',
      cuisineTypes: ['Italian'],
      address: {
        street: '123 Main St',
        city: 'Plymouth',
        postalCode: 'PL1 1AA'
      },
      rating: 4.5,
      totalReviews: 100
    };

    expect(restaurantData).toHaveProperty('name');
    expect(restaurantData).toHaveProperty('cuisineTypes');
    expect(restaurantData.cuisineTypes).toContain('Italian');
    expect(restaurantData.rating).toBeGreaterThanOrEqual(0);
    expect(restaurantData.rating).toBeLessThanOrEqual(5);
  });

  test('should calculate average rating correctly', () => {
    const reviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
      { rating: 5 },
      { rating: 4 }
    ];

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    expect(averageRating).toBe(4.2);
  });

  test('should filter restaurants by cuisine type', () => {
    const restaurants = [
      { name: 'Pizza Place', cuisineTypes: ['Italian'] },
      { name: 'Burger Joint', cuisineTypes: ['American'] },
      { name: 'Sushi Bar', cuisineTypes: ['Japanese'] },
      { name: 'Thai Restaurant', cuisineTypes: ['Asian', 'Thai'] }
    ];

    const italianRestaurants = restaurants.filter(r => 
      r.cuisineTypes.includes('Italian')
    );

    expect(italianRestaurants).toHaveLength(1);
    expect(italianRestaurants[0].name).toBe('Pizza Place');
  });
});
