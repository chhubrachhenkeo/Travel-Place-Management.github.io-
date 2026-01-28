// Authentication System
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkLoginStatus();
    
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        setupLoginForm();
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Display username if available
    displayUsername();
});

function checkLoginStatus() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const protectedPages = ['dashboard.html', 'details.html', 'form.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
    }
    
    if (currentPage === 'index.html' && currentUser) {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    // Set default credentials
    const DEFAULT_CREDENTIALS = {
        username: 'admin',
        password: 'admin123'
    };
    
    // Initialize users in localStorage if not exists
    if (!localStorage.getItem('travelUsers')) {
        localStorage.setItem('travelUsers', JSON.stringify([DEFAULT_CREDENTIALS]));
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate form
        if (!validateLoginForm(username, password)) {
            return;
        }
        
        // Check credentials
        if (authenticateUser(username, password)) {
            // Create user session
            createUserSession(username);
            
            // Show success message
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showToast('Invalid username or password', 'error');
        }
    });
}

function validateLoginForm(username, password) {
    let isValid = true;
    
    if (!username) {
        markInvalid('username', 'Please enter username');
        isValid = false;
    } else {
        markValid('username');
    }
    
    if (!password) {
        markInvalid('password', 'Please enter password');
        isValid = false;
    } else {
        markValid('password');
    }
    
    return isValid;
}

function authenticateUser(username, password) {
    const users = JSON.parse(localStorage.getItem('travelUsers')) || [];
    return users.some(user => user.username === username && user.password === password);
}

function createUserSession(username) {
    const sessionData = {
        username: username,
        loggedIn: true,
        loginTime: new Date().toISOString(),
        token: generateToken()
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
    sessionStorage.setItem('userToken', sessionData.token);
}

function generateToken() {
    return 'travel_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}

function handleLogout(e) {
    e.preventDefault();
    
    // Clear session
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('userToken');
    
    // Redirect to login
    window.location.href = 'index.html';
}

function displayUsername() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser) {
            usernameDisplay.textContent = currentUser.username;
        }
    }
}

function markInvalid(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('is-invalid');
    
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
}

function markValid(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-container');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    
    // Create toast
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0 show" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.innerHTML = toastHtml;
    document.body.appendChild(toastContainer);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toastContainer.remove();
    }, 3000);
}