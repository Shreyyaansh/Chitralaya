const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config({ path: './config.env' });

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

// Sample products data (your existing artworks)
const products = [
  {
    name: "Radha Krishna",
    price: 3500,
    description: "A beautiful depiction of the divine love between Radha and Krishna, capturing the eternal bond and spiritual devotion that represents the highest form of love in Hindu mythology.",
    images: ["assets/canvas/2.jpeg", "assets/canvas/b.jpeg"],
    category: "canvas",
    size: "16 × 20 inch",
    medium: "Canvas"
  },
  {
    name: "Serene Walkway Landscape",
    price: 2349,
    description: "Stroll through this peaceful walkway landscape, where the gentle path leads through serene natural beauty, creating a sense of tranquility and contemplation.",
    images: ["assets/canvas/3.jpeg", "assets/canvas/a.jpeg"],
    category: "canvas",
    size: "18 × 24 inch",
    medium: "Canvas"
  },
  {
    name: "Graceful Bird",
    price: 2349,
    description: "A graceful bird captured in this beautiful artwork, showcasing the elegance and beauty of nature through artistic expression.",
    images: ["assets/canvas/7.jpeg", "assets/canvas/d.jpeg"],
    category: "color",
    size: "A3 size",
    medium: "A3 paper"
  },
  {
    name: "Divine Krishna",
    price: 2199,
    description: "Behold the divine presence of Lord Krishna in this sacred artwork, beautifully capturing the spiritual essence and divine grace.",
    images: ["assets/canvas/6.jpeg", "assets/canvas/e.jpeg"],
    category: "canvas",
    size: "14 × 18 inch",
    medium: "Canvas"
  },
  {
    name: "Charming House",
    price: 2549,
    description: "A charming house captured in this beautiful artwork, showcasing architectural beauty and artistic expression.",
    images: ["assets/color paint/5.jpeg", "assets/color paint/c.jpeg"],
    category: "color",
    size: "A3 size",
    medium: "A3 paper"
  },
  {
    name: "Majestic Peacock",
    price: 2799,
    description: "A majestic peacock displayed in all its glory, showcasing the beauty and elegance of this magnificent bird through artistic expression.",
    images: ["assets/canvas/paint1.jpeg", "assets/canvas/g.jpeg"],
    category: "canvas",
    size: "30 × 20 inch",
    medium: "Canvas"
  },
  {
    name: "Beautiful Girl",
    price: 2999,
    description: "A beautiful girl captured in this elegant artwork, showcasing grace and beauty through artistic expression.",
    images: ["assets/sketch/8.jpeg", "assets/sketch/f.jpeg"],
    category: "sketches",
    size: "12 × 11.5 inch",
    medium: "Paper"
  },
  {
    name: "Divine Ganesha Portrait",
    price: 1999,
    description: "A majestic charcoal sketch capturing the divine presence of Lord Ganesha. This detailed portrait highlights his iconic elephant head, adorned with an elaborate crown and intricate jewelry.",
    images: ["assets/sketch/sketch1.jpeg", "assets/sketch/ganesh.jpeg"],
    category: "sketches",
    size: "A4 size",
    medium: "A4 paper"
  },
  {
    name: "Mystical Liquid Drip",
    price: 1899,
    description: "An intriguing charcoal sketch featuring a woman with her eyes closed and a viscous liquid flowing down the center of her face. The detailed rendering creates a mystical and contemplative quality.",
    images: ["assets/sketch/sketch 2.jpeg", "assets/sketch/girl3.jpeg"],
    category: "sketches",
    size: "A3 size",
    medium: "A3 paper"
  },
  {
    name: "Serene Young Girl",
    price: 2199,
    description: "A poignant charcoal portrait of a young girl with a thoughtful and slightly somber expression. Her long hair frames her face beautifully, and the artist has captured her contemplative mood with exquisite detail.",
    images: ["assets/sketch/sketch3.jpeg", "assets/sketch/girl2.jpeg"],
    category: "sketches",
    size: "A3 size",
    medium: "A3 paper"
  },
  {
    name: "Elegant Traditional Woman",
    price: 2099,
    description: "A serene charcoal sketch of a woman with closed eyes, featuring a distinctive vertical design on her forehead. The artist has captured her peaceful expression with delicate shading and attention to detail.",
    images: ["assets/sketch/sketch4.jpeg", "assets/sketch/girl.jpeg"],
    category: "sketches",
    size: "A3 size",
    medium: "A3 paper"
  },
  {
    name: "Majestic Tiger Portrait",
    price: 1799,
    description: "A powerful and detailed charcoal sketch capturing the intense gaze and majestic presence of a tiger. The intricate stripes, textured fur, and deep shading bring this magnificent creature to life.",
    images: ["assets/sketch/sketch5.jpeg", "assets/sketch/sher.jpeg"],
    category: "sketches",
    size: "A3 size",
    medium: "A3 paper"
  },
  {
    name: "Serene Mountain River",
    price: 2499,
    description: "A tranquil watercolor painting capturing the peaceful essence of an alpine landscape. Majestic snow-capped mountains rise in the background, overlooking a vibrant emerald green river.",
    images: ["assets/color paint/yo.png", "assets/color paint/yo6.jpeg"],
    category: "color",
    size: "A3 size",
    medium: "A3 paper"
  },
  {
    name: "Ancient Stone Pavilion",
    price: 2399,
    description: "An elegant watercolor painting featuring a traditional domed chhatri or gazebo in warm reddish-brown stone. The ornate pavilion stands majestically against a soft blue sky.",
    images: ["assets/color paint/yo2.png", "assets/color paint/yo5.jpeg"],
    category: "color",
    size: "A4 size",
    medium: "A4 paper"
  },
  {
    name: "Divine Shiva and Parvati",
    price: 2299,
    description: "A sacred watercolor painting depicting the divine couple Lord Shiva and Goddess Parvati in intimate embrace. Shiva's blue-skinned form contrasts beautifully with Parvati's golden radiance.",
    images: ["assets/color paint/yo3.png", "assets/color paint/yo4.jpeg"],
    category: "color",
    size: "A3 size",
    medium: "A3 paper"
  }
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${createdProducts.length} products`);
    
    // Display summary
    console.log('\n📊 Product Summary:');
    const categories = {};
    createdProducts.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

runSeed();
