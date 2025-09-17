      // Ensure page loads at the top
      window.onload = function() {
        if (window.location.hash) {
          // Remove the hash from URL without scrolling
          history.replaceState(null, null, window.location.pathname);
        }
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Check user login status
        checkUserStatus();
        
        // Initialize cursor trail effect
        initCursorTrail();
        
        // Initialize email button
        initEmailButton();
        
        // Initialize product page functionality
        initProductPage();
        
        // Initialize lazy loading for images
        initLazyLoading();
        
        // Initialize performance monitoring
        initPerformanceMonitoring();
      };

      // Spotlight effect for banner
      function initCursorTrail() {
        const canvas = document.getElementById('spotlight');
        const banner = document.getElementById('home');
        if (!canvas || !banner) return;

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = banner.offsetWidth);
        let height = (canvas.height = banner.offsetHeight);
        let mouse = { x: 0, y: 0 };
        let isMouseInBanner = false;

        // Handle window resize
        window.addEventListener('resize', () => {
          width = canvas.width = banner.offsetWidth;
          height = canvas.height = banner.offsetHeight;
        });

        // Mouse enter banner
        banner.addEventListener('mouseenter', function() {
          isMouseInBanner = true;
        });

        // Mouse leave banner
        banner.addEventListener('mouseleave', function() {
          isMouseInBanner = false;
          // Clear the spotlight
          ctx.clearRect(0, 0, width, height);
        });

        // Track mouse movement
        banner.addEventListener('mousemove', function(e) {
          if (!isMouseInBanner) return;
          
          const rect = banner.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
          
          drawSpotlight();
        });

        function drawSpotlight() {
          // Clear canvas
          ctx.clearRect(0, 0, width, height);
          
          // Create larger, brighter radial gradient with changing colors
          const gradient = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,           // Center
            mouse.x, mouse.y, 300          // Much larger radius
          );
          
          // Get current color based on cursor position
          const currentColor = getCurrentColor(mouse.x, mouse.y);
          
          // Dynamic color with larger spread
          gradient.addColorStop(0, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0.25)`);    // Bright center
          gradient.addColorStop(0.3, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0.15)`);  // Bright medium
          gradient.addColorStop(0.6, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0.08)`);  // Medium brightness
          gradient.addColorStop(0.9, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0.03)`);  // Light edge
          gradient.addColorStop(1, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0)`);       // Transparent edge
          
          // Draw the dynamic color effect
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }

        function getCurrentColor(x, y) {
          // Color palette
          const colors = [
            { r: 254, g: 202, b: 87 },   // Yellow
            { r: 255, g: 107, b: 107 },  // Coral
            { r: 78, g: 205, b: 196 },   // Teal
            { r: 69, g: 183, b: 209 },   // Sky Blue
            { r: 150, g: 206, b: 180 },  // Mint
            { r: 255, g: 0, b: 255 }     // Magenta
          ];
          
          // Calculate smooth color transition based on cursor position
          const normalizedX = x / width;
          const normalizedY = y / height;
          const position = (normalizedX + normalizedY) * 0.5; // Slower transition
          const scaledPosition = position * colors.length;
          
          const colorIndex1 = Math.floor(scaledPosition) % colors.length;
          const colorIndex2 = (colorIndex1 + 1) % colors.length;
          const t = scaledPosition - Math.floor(scaledPosition); // Interpolation factor
          
          // Smooth interpolation between two colors
          const color1 = colors[colorIndex1];
          const color2 = colors[colorIndex2];
          
          return {
            r: Math.round(color1.r + (color2.r - color1.r) * t),
            g: Math.round(color1.g + (color2.g - color1.g) * t),
            b: Math.round(color1.b + (color2.b - color1.b) * t)
          };
        }
      }

      // Email button functionality
      function initEmailButton() {
        const emailButton = document.querySelector('a[href^="mailto:"]');
        if (emailButton) {
          emailButton.addEventListener('click', function(e) {
            // The mailto link will handle opening the email client
          });
        }
      }

      // Check if user is logged in and update UI accordingly
      async function checkUserStatus() {
        const token = localStorage.getItem('authToken');
        const userLink = document.getElementById('user-link');
        const userText = document.getElementById('user-text');
        
        console.log('Checking user status...', { token: token ? 'exists' : 'missing', apiUrl: window.API_BASE_URL });
        
        if (token) {
          try {
            // Verify token with server
            console.log('Making request to:', `${window.API_BASE_URL}/auth/profile`);
            const response = await fetch(`${window.API_BASE_URL}/auth/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
              const user = data.data.user;
              userText.textContent = `Hi, ${user.firstname}`;
              userLink.href = 'profile.html'; // Link to profile page
              userLink.onclick = null; // Remove onclick handler
              
              // Update localStorage with fresh user data
              localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');
              userText.textContent = 'Login';
              userLink.href = 'login.html';
              userLink.onclick = null;
            }
          } catch (error) {
            console.error('Error checking user status:', error);
            // Clear invalid token
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            userText.textContent = 'Login';
            userLink.href = 'login.html';
            userLink.onclick = null;
          }
        } else {
          userText.textContent = 'Login';
          userLink.href = 'login.html';
          userLink.onclick = null;
        }
      }

      // Product page functionality
      function initProductPage() {
        // Add cursor pointer to artwork items
        const artworkItems = document.querySelectorAll('.artwork-item');
        artworkItems.forEach(item => {
          item.style.cursor = 'pointer';
        });
      }

      // Open product page
      function openProduct(productId) {
        window.location.href = `product.html?id=${productId}`;
      }

      // Filter artwork by category
      function filterArtwork(category) {
        const artworkItems = document.querySelectorAll('.artwork-item');
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        event.target.classList.add('active');
        
        // Show/hide artwork based on category
        artworkItems.forEach(item => {
          const itemCategories = item.getAttribute('data-category').split(' ');
          
          if (category === 'all' || itemCategories.includes(category)) {
            item.classList.remove('hidden');
            item.style.display = 'block';
          } else {
            item.classList.add('hidden');
            item.style.display = 'none';
          }
        });
      }


      // Show user menu (logout option)
      async function showUserMenu() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userText = document.getElementById('user-text');
        
        if (confirm(`Welcome ${currentUser.firstname}! Do you want to logout?`)) {
          try {
            // Call logout API
            const token = localStorage.getItem('authToken');
            await fetch(`${window.API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            });
          } catch (error) {
            console.error('Logout API error:', error);
          } finally {
            // Clear local storage regardless of API call result
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            userText.textContent = 'Login';
            const userLink = document.getElementById('user-link');
            userLink.href = 'login.html';
            userLink.onclick = null;
            alert('You have been logged out successfully!');
        }
      }
    }

    // Update cart counter
    function updateCartCounter() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'flex' : 'none';
      });
    }

    // Update cart counter on page load
    document.addEventListener('DOMContentLoaded', function() {
      updateCartCounter();
    });

    // Also update immediately if DOM is already loaded
    if (document.readyState === 'loading') {
      // DOM is still loading, wait for DOMContentLoaded
    } else {
      // DOM is already loaded, update immediately
      updateCartCounter();
    }

    // Listen for cart changes
    window.addEventListener('storage', function(e) {
      if (e.key === 'cart') {
        updateCartCounter();
      }
    });

    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', function() {
      updateCartCounter();
    });
  }

  // Lazy loading for images
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }

  // Performance monitoring
  function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('LCP:', entry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Log page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log('Page load time:', loadTime + 'ms');
    });
  }

  // Error handling and reporting
  window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error reporting service
  });

  window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // In production, you might want to send this to an error reporting service
  });
 