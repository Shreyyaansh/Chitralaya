// Authentication JavaScript
// API Configuration (loaded from config.js)

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const switchToLogin = document.getElementById('switch-to-login');
    const switchToSignup = document.getElementById('switch-to-signup');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const successMessage = document.getElementById('success-message');
    const loginSuccess = document.getElementById('login-success');

    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token with server
        verifyTokenAndRedirect();
        return;
    }

    // Switch to login form
    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        switchToLoginForm();
    });

    // Switch to signup form
    switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        switchToSignupForm();
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignup();
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    function switchToLoginForm() {
        // Hide signup form and show login form
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        
        // Update header text
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Login to continue exploring our art collection';
        
        // Add animation
        loginForm.classList.add('show');
        
        // Clear any previous messages
        hideAllMessages();
    }

    function switchToSignupForm() {
        // Hide login form and show signup form
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        
        // Update header text
        authTitle.textContent = 'Welcome to Chitralaya';
        authSubtitle.textContent = 'Sign up to explore our beautiful art collection';
        
        // Add animation
        signupForm.classList.add('show');
        
        // Clear any previous messages
        hideAllMessages();
    }

    async function handleSignup() {
        const firstname = document.getElementById('signup-firstname').value.trim();
        const lastname = document.getElementById('signup-lastname').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        // Validate form
        if (!validateSignupForm(firstname, lastname, email, password)) {
            return;
        }

        try {
            const response = await fetch(`${window.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.data.user));
                
                // Show success message
                showSignupSuccess();
                
                // Redirect to main page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 2000);
            } else {
                // Handle registration errors
                if (data.message.includes('already exists')) {
                    showError('signup-email', 'This email is already registered. Please login instead.');
                } else if (data.errors) {
                    // Handle validation errors
                    data.errors.forEach(error => {
                        const fieldName = error.path || error.param;
                        const fieldId = `signup-${fieldName}`;
                        showError(fieldId, error.msg);
                    });
                } else {
                    showError('signup-email', data.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('signup-email', 'Network error. Please check your connection and try again.');
        }
    }

    async function handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Validate form
        if (!validateLoginForm(email, password)) {
            return;
        }

        try {
            console.log('Login - API_BASE_URL:', window.API_BASE_URL);
            console.log('Login - Making request to:', `${window.API_BASE_URL}/auth/login`);
            const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.data.user));
                
                // Show success message
                showLoginSuccess();
                
                // Redirect to main page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 2000);
            } else {
                // Handle login errors
                if (data.errors) {
                    // Handle validation errors
                    data.errors.forEach(error => {
                        const fieldName = error.path || error.param;
                        const fieldId = `login-${fieldName}`;
                        showError(fieldId, error.msg);
                    });
                } else {
                    showError('login-email', data.message || 'Login failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('login-email', 'Network error. Please check your connection and try again.');
        }
    }

    function validateSignupForm(firstname, lastname, email, password) {
        let isValid = true;

        // Clear previous errors
        clearErrors();

        // Validate first name
        if (!firstname) {
            showError('signup-firstname', 'First name is required');
            isValid = false;
        }

        // Validate last name
        if (!lastname) {
            showError('signup-lastname', 'Last name is required');
            isValid = false;
        }

        // Validate email
        if (!email) {
            showError('signup-email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('signup-email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError('signup-password', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showError('signup-password', 'Password must be at least 6 characters long');
            isValid = false;
        }

        return isValid;
    }

    function validateLoginForm(email, password) {
        let isValid = true;

        // Clear previous errors
        clearErrors();

        // Validate email
        if (!email) {
            showError('login-email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('login-email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError('login-password', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('span');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function clearErrors() {
        // Remove error classes
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        
        // Remove error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(message => message.remove());
    }

    function showSignupSuccess() {
        hideAllMessages();
        successMessage.style.display = 'block';
        signupForm.style.display = 'none';
    }

    function showLoginSuccess() {
        hideAllMessages();
        loginSuccess.style.display = 'block';
        loginForm.style.display = 'none';
    }

    function hideAllMessages() {
        successMessage.style.display = 'none';
        loginSuccess.style.display = 'none';
    }

    // Add real-time validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() && this.classList.contains('error')) {
                this.classList.remove('error');
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
    });

    // Verify token and redirect if valid
    async function verifyTokenAndRedirect() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${window.API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                // Token is valid, redirect to main page
                showLoginSuccess();
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 1000);
            } else {
                // Token is invalid, remove it
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            // Remove invalid token
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        }
    }
});
