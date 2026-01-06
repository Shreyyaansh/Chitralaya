const mongoose = require('mongoose');
const Product = require('./models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update all products artist name
const updateArtistName = async () => {
  try {
    const artistName = 'Pratishtha Sharma';
    
    // Update all products to set artist name
    const result = await Product.updateMany(
      {}, // Empty filter means update all documents
      { $set: { artist: artistName } }
    );
    
    console.log(`✅ Successfully updated ${result.modifiedCount} products`);
    console.log(`📊 Total products matched: ${result.matchedCount}`);
    
    // Display updated products summary
    const updatedProducts = await Product.find({});
    console.log('\n📋 Updated Products:');
    updatedProducts.forEach(product => {
      console.log(`   - ${product.name}: Artist = "${product.artist}"`);
    });
    
    console.log(`\n🎉 All products now have artist name: "${artistName}"`);
    
  } catch (error) {
    console.error('❌ Error updating artist names:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the update
const runUpdate = async () => {
  await connectDB();
  await updateArtistName();
};

runUpdate();

