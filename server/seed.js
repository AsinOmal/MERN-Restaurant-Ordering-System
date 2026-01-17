// Sample Data Seeder for Restaurant Ordering System
//Run: node server/seed.js

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

// Import models
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');
const Order = require('./src/models/Order');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-ordering-system');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      MenuItem.deleteMany({}),
      Order.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create Users
    const users = await User.create([
      {
        name: 'John Customer',
        email: 'customer@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'Plymouth',
          postalCode: 'PL1 1AA'
        }
      },
      {
        name: 'Jane Owner',
        email: 'owner@example.com',
        password: 'password123',
        role: 'owner',
        phone: '+1234567891'
      },
      {
        name: 'Bob Staff',
        email: 'staff@example.com',
        password: 'password123',
        role: 'staff',
        phone: '+1234567892'
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Restaurants
    const restaurants = await Restaurant.create([
      {
        name: 'Pizza Paradise',
        description: 'Authentic Italian pizzas made with love',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
        address: {
          street: '45 High Street',
          city: 'Plymouth',
          postalCode: 'PL1 2AB',
          coordinates: { lat: 50.3714, lng: -4.1422 }
        },
        phone: '+44-1752-123456',
        cuisineTypes: ['Italian'],
        openingHours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '11:00', close: '23:00' },
          sunday: { open: '12:00', close: '21:00' }
        },
        rating: 4.5,
        totalReviews: 234,
        isActive: true
      },
      {
        name: 'Burger Bliss',
        description: 'Gourmet burgers and loaded fries',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
        address: {
          street: '78 Union Street',
          city: 'Plymouth',
          postalCode: 'PL1 3EZ',
          coordinates: { lat: 50.3704, lng: -4.1431 }
        },
        phone: '+44-1752-234567',
        cuisineTypes: ['American'],
        openingHours: {
          monday: { open: '10:00', close: '23:00' },
          tuesday: { open: '10:00', close: '23:00' },
          wednesday: { open: '10:00', close: '23:00' },
          thursday: { open: '10:00', close: '23:00' },
          friday: { open: '10:00', close: '00:00' },
          saturday: { open: '10:00', close: '00:00' },
          sunday: { open: '11:00', close: '22:00' }
        },
        rating: 4.7,
        totalReviews: 567,
        isActive: true
      },
      {
        name: 'Sushi Station',
        description: 'Fresh sushi and Japanese cuisine',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
        address: {
          street: '12 Armada Way',
          city: 'Plymouth',
          postalCode: 'PL1 1HH',
          coordinates: { lat: 50.3721, lng: -4.1401 }
        },
        phone: '+44-1752-345678',
        cuisineTypes: ['Japanese'],
        openingHours: {
          monday: { open: '12:00', close: '22:00' },
          tuesday: { open: '12:00', close: '22:00' },
          wednesday: { open: '12:00', close: '22:00' },
          thursday: { open: '12:00', close: '22:00' },
          friday: { open: '12:00', close: '23:00' },
          saturday: { open: '12:00', close: '23:00' },
          sunday: { open: '12:00', close: '21:00' }
        },
        rating: 4.8,
        totalReviews: 189,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${restaurants.length} restaurants`);

    // Assign restaurant to owner and staff users for WebSocket functionality
    await User.findByIdAndUpdate(users[1]._id, { restaurant: restaurants[0]._id }); // Owner -> Pizza Paradise  
    await User.findByIdAndUpdate(users[2]._id, { restaurant: restaurants[0]._id }); // Staff -> Pizza Paradise
    console.log(`✅ Assigned Pizza Paradise to owner and staff users`);

    // Create Menu Items for Pizza Paradise
    const pizzaItems = await MenuItem.create([
      {
        restaurant: restaurants[0]._id,
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce, mozzarella, and fresh basil',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
        price: 12.99,
        category: 'Main Course',
        available: true,
        dietary: ['Vegetarian']
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Pepperoni Pizza',
        description: 'Tomato sauce, mozzarella, and pepperoni',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
        price: 14.99,
        category: 'Main Course',
        available: true
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        image: 'https://images.unsplash.com/photo-1573140401552-388e6f5c1fc4?w=400&h=300&fit=crop',
        price: 4.99,
        category: 'Appetizer',
        available: true,
        dietary: ['Vegetarian']
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
        price: 6.99,
        category: 'Dessert',
        available: true,
        dietary: ['Vegetarian']
      }
    ]);

    // Create Menu Items for Burger Bliss
    const burgerItems = await MenuItem.create([
      {
        restaurant: restaurants[1]._id,
        name: 'Classic Cheeseburger',
        description: 'Beef patty, cheese, lettuce, tomato, pickles',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        price: 10.99,
        category: 'Main Course',
        available: true
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Bacon BBQ Burger',
        description: 'Beef patty, bacon, BBQ sauce, onion rings',
        image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
        price: 12.99,
        category: 'Main Course',
        available: true
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Loaded Fries',
        description: 'Fries topped with cheese, bacon, and sour cream',
        image: 'https://images.unsplash.com/photo-1630431341973-02e1cc2e7c2b?w=400&h=300&fit=crop',
        price: 6.99,
        category: 'Side',
        available: true
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Milkshake',
        description: 'Choice of vanilla, chocolate, or strawberry',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
        price: 4.99,
        category: 'Beverage',
        available: true,
        dietary: ['Vegetarian']
      }
    ]);

    // Create Menu Items for Sushi Station
    const sushiItems = await MenuItem.create([
      {
        restaurant: restaurants[2]._id,
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        price: 8.99,
        category: 'Main Course',
        available: true
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Spicy Tuna Roll',
        description: 'Tuna, spicy mayo, and cucumber',
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop',
        price: 9.99,
        category: 'Main Course',
        available: true
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Edamame',
        description: 'Steamed soybeans with sea salt',
        image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400&h=300&fit=crop',
        price: 4.99,
        category: 'Appetizer',
        available: true,
        dietary: ['Vegetarian', 'Vegan']
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu and seaweed',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
        price: 3.99,
        category: 'Appetizer',
        available: true,
        dietary: ['Vegetarian', 'Vegan']
      }
    ]);

    console.log(`✅ Created ${pizzaItems.length + burgerItems.length + sushiItems.length} menu items`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Customer: customer@example.com / password123');
    console.log('Owner: owner@example.com / password123');
    console.log('Staff: staff@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
