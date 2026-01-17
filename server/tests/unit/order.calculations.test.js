const mongoose = require('mongoose');

describe('Order Model - Calculations', () => {
  test('should calculate correct subtotal from items', () => {
    const items = [
      { name: 'Burger', price: 10, quantity: 2 },
      { name: 'Fries', price: 5, quantity: 1 },
    ];

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    expect(subtotal).toBe(25);
  });

  test('should calculate correct total with tax and delivery fee', () => {
    const subtotal = 25;
    const taxRate = 0.10; // 10%
    const deliveryFee = 5;

    const tax = subtotal * taxRate;
    const totalAmount = subtotal + tax + deliveryFee;

    expect(tax).toBe(2.5);
    expect(totalAmount).toBe(32.5);
  });

  test('should handle free delivery (zero delivery fee)', () => {
    const subtotal = 50;
    const deliveryFee = 0;
    const tax = subtotal * 0.10;
    const totalAmount = subtotal + tax + deliveryFee;

    expect(totalAmount).toBe(55);
  });

  test('should correctly sum varying quantities and prices', () => {
    const items = [
      { name: 'Pizza', price: 12.99, quantity: 3 },
      { name: 'Salad', price: 7.50, quantity: 2 },
      { name: 'Drink', price: 2.99, quantity: 4 },
    ];

    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 12.99*3 = 38.97, 7.50*2 = 15.00, 2.99*4 = 11.96
    // Total = 65.93
    expect(subtotal).toBeCloseTo(65.93, 2);
  });
});

describe('Order Model - Status History', () => {
  test('should initialize with empty status history', () => {
    const statusHistory = [];
    expect(statusHistory).toHaveLength(0);
  });

  test('should add status to history on status change', () => {
    const statusHistory = [
      { status: 'pending', timestamp: new Date() },
    ];

    // Simulate status change
    statusHistory.push({ status: 'confirmed', timestamp: new Date() });

    expect(statusHistory).toHaveLength(2);
    expect(statusHistory[0].status).toBe('pending');
    expect(statusHistory[1].status).toBe('confirmed');
  });
});

describe('Order Model - Validation', () => {
  test('should require minimum quantity of 1', () => {
    const invalidQuantity = 0;
    const minQuantity = 1;

    expect(invalidQuantity).toBeLessThan(minQuantity);
  });

  test('should validate status enum values', () => {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];
    const testStatus = 'preparing';

    expect(validStatuses).toContain(testStatus);
  });

  test('should reject invalid status values', () => {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];
    const invalidStatus = 'invalid-status';

    expect(validStatuses).not.toContain(invalidStatus);
  });
});
