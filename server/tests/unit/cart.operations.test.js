describe('Cart Operations - Business Logic', () => {
  test('should calculate cart subtotal correctly', () => {
    const cartItems = [
      { name: 'Pizza', price: 15.99, quantity: 2 },
      { name: 'Salad', price: 7.50, quantity: 1 },
      { name: 'Drink', price: 2.99, quantity: 3 }
    ];

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 15.99*2 + 7.50*1 + 2.99*3 = 31.98 + 7.50 + 8.97 = 48.45
    expect(subtotal).toBeCloseTo(48.45, 2);
  });

  test('should update item quantity in cart', () => {
    const cart = {
      items: [
        { id: '1', name: 'Burger', quantity: 2 },
        { id: '2', name: 'Fries', quantity: 1 }
      ]
    };

    // Update quantity
    const itemToUpdate = cart.items.find(item => item.id === '1');
    itemToUpdate.quantity = 5;

    expect(cart.items[0].quantity).toBe(5);
    expect(cart.items[1].quantity).toBe(1);
  });

  test('should remove item from cart', () => {
    let cart = {
      items: [
        { id: '1', name: 'Burger' },
        { id: '2', name: 'Fries' },
        { id: '3', name: 'Drink' }
      ]
    };

    // Remove item with id '2'
    cart.items = cart.items.filter(item => item.id !== '2');

    expect(cart.items).toHaveLength(2);
    expect(cart.items.find(item => item.id === '2')).toBeUndefined();
    expect(cart.items.find(item => item.id === '1')).toBeDefined();
  });

  test('should calculate cart total with tax and delivery fee', () => {
    const subtotal = 50.00;
    const taxRate = 0.10; // 10%
    const deliveryFee = 5.00;

    const tax = subtotal * taxRate;
    const total = subtotal + tax + deliveryFee;

    expect(tax).toBe(5.00);
    expect(total).toBe(60.00);
  });

  test('should validate minimum order amount', () => {
    const cartSubtotal = 8.50;
    const minimumOrder = 10.00;

    const meetsMinimum = cartSubtotal >= minimumOrder;

    expect(meetsMinimum).toBe(false);
  });
});
