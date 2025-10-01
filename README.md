# 🎨 Chitralaya - Art Gallery E-commerce Platform

> **चित्रालय** - Where Colors Speak

A beautiful, full-stack e-commerce platform showcasing original artworks with a modern, responsive design and complete user authentication system.


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


## 🛡️ Security Features

- **Password Hashing** with bcrypt
- **JWT Token Authentication** with expiration
- **CORS Protection** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Helmet.js** for security headers
- **Environment Variables** for sensitive data



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

---

<div align="center">

**Made with ❤️ for art lovers**

*चित्रालय - Where Colors Speak* 🎨


</div>
