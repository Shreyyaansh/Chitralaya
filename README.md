# 🎨 Chitralaya - Art Gallery E-commerce Platform

> **चित्रालय** - Where Colors Speak

A beautiful, full-stack e-commerce platform showcasing original artworks with a modern, responsive design and complete user authentication system.

> **⚠️ Note**: This is a portfolio demonstration project. The artwork and application are for showcase purposes only.

![Chitralaya Banner](https://img.shields.io/badge/Chitralaya-Art%20Gallery-orange?style=for-the-badge&logo=artstation)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-orange?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Styling-blue?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)

## 🌟 Features

### 🎨 **Art Gallery**
- **15+ Original Artworks** across multiple categories
- **Canvas Paintings** - Divine Hindu deities and landscapes
- **Charcoal Sketches** - Detailed portraits and wildlife
- **Watercolor Paintings** - Serene landscapes and traditional architecture
- **Interactive Gallery** with hover effects and smooth transitions
- **Category Filtering** (All, Canvas, Sketches, Water Color)

### 🛒 **E-commerce Functionality**
- **Shopping Cart** with persistent storage
- **Product Details** with multiple image views
- **Quantity Management** and cart updates
- **Checkout Process** with form validation
- **Order Summary** and shipping information
- **Customization Options** for artworks

### 👤 **User Authentication**
- **Secure Registration** with email validation
- **JWT-based Authentication** with token management
- **User Profile Management** with personal information
- **Session Persistence** across browser sessions
- **Password Security** with bcrypt hashing

### 🎨 **Design & UX**
- **Bilingual Interface** (Hindi + English) with Devanagari script
- **Responsive Design** for all device sizes
- **Interactive Animations** and smooth transitions
- **Modern UI/UX** with professional styling
- **Accessibility Features** and keyboard navigation

## 🏗️ Architecture

### **Frontend**
- **HTML5** with semantic markup
- **CSS3** with modern features (Grid, Flexbox, Animations)
- **Vanilla JavaScript** (ES6+) for interactivity
- **Responsive Design** with mobile-first approach
- **Progressive Enhancement** for better performance

### **Backend**
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT Authentication** for secure sessions
- **RESTful API** design
- **Security Middleware** (Helmet, CORS, Rate Limiting)

### **Database Schema**
```javascript
// User Model
{
  firstname: String,
  lastname: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: 'user'),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Portfolio Project

This is a **portfolio demonstration** of a full-stack e-commerce art gallery built with modern web technologies.

### **Technologies Used**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt
- **Security**: CORS, Helmet, Rate limiting

### **Features Demonstrated**
- Responsive design with modern UI/UX
- User authentication and session management
- Shopping cart with persistent storage
- Product gallery with filtering
- Checkout process with form validation
- RESTful API design
- Database integration
- Security best practices

## 📁 Project Structure

```
chitralaya/
├── 📁 assets/                    # Static assets
│   ├── 📁 canvas/               # Canvas painting images
│   ├── 📁 sketch/               # Sketch artwork images
│   ├── 📁 color paint/          # Watercolor painting images
│   └── 📄 *.png, *.jpeg         # UI icons and backgrounds
├── 📁 server/                   # Backend application
│   ├── 📁 config/               # Configuration files
│   │   ├── 📄 database.js       # MongoDB connection
│   │   └── 📄 config.env        # Environment variables
│   ├── 📁 controllers/          # Route controllers
│   │   └── 📄 authController.js # Authentication logic
│   ├── 📁 middleware/           # Custom middleware
│   │   └── 📄 auth.js           # JWT authentication
│   ├── 📁 models/               # Database models
│   │   └── 📄 User.js           # User schema
│   ├── 📁 routes/               # API routes
│   │   └── 📄 auth.js           # Authentication routes
│   ├── 📄 server.js             # Main server file
│   └── 📄 package.json          # Backend dependencies
├── 📄 main.html                 # Homepage with gallery
├── 📄 login.html                # Authentication page
├── 📄 product.html              # Product details page
├── 📄 cart.html                 # Shopping cart page
├── 📄 checkout.html             # Checkout page
├── 📄 profile.html              # User profile page
├── 📄 chitra.css                # Main stylesheet
├── 📄 auth.css                  # Authentication styles
├── 📄 script.js                 # Main JavaScript
├── 📄 auth.js                   # Authentication JavaScript
├── 📄 SETUP_INSTRUCTIONS.md     # Detailed setup guide
└── 📄 README.md                 # This file
```

## 🎨 Artwork Collection

### **Canvas Paintings**
- **Radha Krishna** - Divine love and spiritual devotion
- **Serene Walkway Landscape** - Peaceful natural beauty
- **Divine Krishna** - Sacred artwork with spiritual essence
- **Majestic Peacock** - Elegant bird in full glory

### **Charcoal Sketches**
- **Divine Ganesha Portrait** - Detailed elephant-headed deity
- **Mystical Liquid Drip** - Intriguing ritualistic artwork
- **Serene Young Girl** - Contemplative portrait
- **Elegant Traditional Woman** - Graceful traditional beauty
- **Majestic Tiger Portrait** - Powerful wildlife art

### **Watercolor Paintings**
- **Serene Mountain River** - Alpine landscape with emerald waters
- **Ancient Stone Pavilion** - Traditional Indian architecture
- **Divine Shiva and Parvati** - Sacred couple in embrace
- **Charming House** - Architectural beauty
- **Graceful Bird** - Nature's elegance

## 🔧 API Endpoints

### **Authentication**
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
POST /api/auth/logout      # User logout
```

### **Health Check**
```http
GET  /health               # Server health status
```

## 🛡️ Security Features

- **Password Hashing** with bcrypt
- **JWT Token Authentication** with expiration
- **CORS Protection** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Helmet.js** for security headers
- **Environment Variables** for sensitive data

## 🔒 Security Best Practices

### **Environment Variables**
- ✅ **Never commit** `.env` or `config.env` files to Git
- ✅ Use `config.env.example` as a template
- ✅ Generate strong JWT secrets for production
- ✅ Use different secrets for development and production

### **Production Security**
- 🔐 **Change default JWT secret** before deployment
- 🔐 **Use MongoDB Atlas** with proper authentication
- 🔐 **Enable HTTPS** in production
- 🔐 **Set strong CORS policies** for production domains
- 🔐 **Use environment-specific configurations**

### **Git Security**
- 🚫 **Never commit** sensitive files
- 🚫 **Use .gitignore** to exclude environment files
- 🚫 **Rotate secrets** if accidentally committed
- 🚫 **Review commits** before pushing

## 📱 Responsive Design

- **Mobile-First** approach
- **Breakpoints**: 480px, 768px, 1024px
- **Touch-Friendly** interface
- **Optimized Images** for different screen sizes
- **Flexible Grid** layouts

## 🌐 Browser Support

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+
- **Mobile Browsers** (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### **Frontend Deployment**
- **Netlify**: Drag and drop the root folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Enable in repository settings

### **Backend Deployment**
- **Heroku**: Connect GitHub and deploy
- **Railway**: One-click deployment
- **DigitalOcean**: App Platform deployment

### **Database**
- **MongoDB Atlas**: Free cloud database
- **Railway MongoDB**: Alternative cloud option

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- **[Setup Guide](setup.md)** - Quick start and detailed setup instructions
- **[Contributing](CONTRIBUTING.md)** - Guidelines for contributing to the project
- **[API Documentation](#-api-endpoints)** - Complete API reference

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact

- **Email**: mannu131376@gmail.com
- **Instagram**: [@pratishtha0605](https://instagram.com/pratishtha0605)
- **Website**: [Chitralaya](http://localhost:5500/main.html)

## 🙏 Acknowledgments

- **Artist**: All artworks created with love and creativity
- **Fonts**: Google Fonts (Playfair Display, Noto Sans Devanagari)
- **Icons**: Custom SVG icons and emojis
- **Inspiration**: Traditional Indian art and modern web design

---

<div align="center">

**Made with ❤️ for art lovers**

*चित्रालय - Where Colors Speak* 🎨

[![GitHub stars](https://img.shields.io/github/stars/yourusername/chitralaya?style=social)](https://github.com/yourusername/chitralaya)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/chitralaya?style=social)](https://github.com/yourusername/chitralaya)

</div>
