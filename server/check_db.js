const mongoose = require('mongoose');
require('dotenv').config();

const RestaurantSchema = new mongoose.Schema({
  name: String,
  cuisineTypes: [String]
});
const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

async function checkRestaurants() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const count = await Restaurant.countDocuments();
    console.log(`Total restaurants in DB: ${count}`);
    
    if (count > 0) {
      const sample = await Restaurant.findOne();
      console.log('Sample restaurant:', sample.name);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRestaurants();
