// Form Handling for Add/Edit
document.addEventListener('DOMContentLoaded', function() {
    // Check if editing or adding
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id');
    
    if (placeId) {
        // Edit mode
        loadPlaceForEdit(placeId);
    }
    
    // Setup form submission
    setupFormSubmission();
    
    // Setup real-time validation
    setupFormValidation();
});

function loadPlaceForEdit(id) {
    const place = getPlaceById(id);
    
    if (!place) {
        showToast('Place not found!', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        return;
    }
    
    // Update form title
    document.getElementById('formTitle').innerHTML = `
        <i class="fas fa-edit me-2"></i>Edit ${place.name}
    `;
    document.getElementById('submitBtn').innerHTML = `
        <i class="fas fa-sync-alt me-1"></i>Update Place
    `;
    
    // Fill form fields
    document.getElementById('placeId').value = place.id;
    document.getElementById('name').value = place.name;
    document.getElementById('description').value = place.description;
    document.getElementById('category').value = place.category;
    document.getElementById('location').value = place.location;
    document.getElementById('image').value = place.image;
    document.getElementById('rating').value = place.rating;
    document.getElementById('visitors').value = place.visitors;
    document.getElementById('status').value = place.status;
    document.getElementById('priceRange').value = place.priceRange;
    document.getElementById('bestTime').value = place.bestTime;
    
    // Check amenities checkboxes
    place.amenities.forEach(amenity => {
        const checkbox = document.querySelector(`input[value="${amenity}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    // Mark all fields as valid
    markAllFieldsValid();
}

function setupFormSubmission() {
    const form = document.getElementById('placeForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Collect form data
        const formData = collectFormData();
        
        const placeId = document.getElementById('placeId').value;
        
        try {
            if (placeId) {
                // Update existing place
                if (updatePlace(placeId, formData)) {
                    showToast('Place updated successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = `details.html?id=${placeId}`;
                    }, 1000);
                } else {
                    showToast('Error updating place. Please try again.', 'error');
                }
            } else {
                // Add new place
                const newId = addPlace(formData);
                showToast('Place added successfully!', 'success');
                setTimeout(() => {
                    window.location.href = `details.html?id=${newId}`;
                }, 1000);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showToast('An error occurred. Please try again.', 'error');
        }
    });
}

function collectFormData() {
    // Get selected amenities
    const amenities = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        amenities.push(checkbox.value);
    });
    
    return {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        location: document.getElementById('location').value.trim(),
        image: document.getElementById('image').value.trim(),
        rating: parseFloat(document.getElementById('rating').value),
        visitors: parseInt(document.getElementById('visitors').value),
        status: document.getElementById('status').value,
        priceRange: document.getElementById('priceRange').value,
        bestTime: document.getElementById('bestTime').value.trim(),
        amenities: amenities
    };
}

function validateForm() {
    let isValid = true;
    
    // Required fields validation
    const requiredFields = [
        'name', 'description', 'category', 'location', 
        'image', 'rating', 'visitors', 'status', 
        'priceRange', 'bestTime'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        if (!value) {
            markInvalid(fieldId, `Please provide ${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            isValid = false;
        } else {
            markValid(fieldId);
        }
    });
    
    // Special validations
    const rating = parseFloat(document.getElementById('rating').value);
    if (rating < 1 || rating > 5) {
        markInvalid('rating', 'Rating must be between 1 and 5');
        isValid = false;
    }
    
    const visitors = parseInt(document.getElementById('visitors').value);
    if (visitors < 0) {
        markInvalid('visitors', 'Visitors count cannot be negative');
        isValid = false;
    }
    
    // Image URL validation
    const imageUrl = document.getElementById('image').value.trim();
    if (imageUrl && !isValidUrl(imageUrl)) {
        markInvalid('image', 'Please enter a valid URL');
        isValid = false;
    }
    
    return isValid;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function setupFormValidation() {
    // Real-time validation for fields
    const fieldsToValidate = [
        'name', 'description', 'location', 'image', 
        'rating', 'visitors', 'bestTime'
    ];
    
    fieldsToValidate.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                validateField(fieldId);
            });
            
            field.addEventListener('blur', function() {
                validateField(fieldId);
            });
        }
    });
    
    // Select fields validation on change
    ['category', 'status', 'priceRange'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', function() {
                validateField(fieldId);
            });
        }
    });
}

function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    
    if (!value) {
        markInvalid(fieldId, `Please provide ${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
    }
    
    // Special validations
    switch(fieldId) {
        case 'rating':
            const rating = parseFloat(value);
            if (rating < 1 || rating > 5) {
                markInvalid(fieldId, 'Rating must be between 1 and 5');
                return false;
            }
            break;
            
        case 'visitors':
            const visitors = parseInt(value);
            if (visitors < 0) {
                markInvalid(fieldId, 'Visitors count cannot be negative');
                return false;
            }
            break;
            
        case 'image':
            if (!isValidUrl(value)) {
                markInvalid(fieldId, 'Please enter a valid URL');
                return false;
            }
            break;
    }
    
    markValid(fieldId);
    return true;
}

function markInvalid(fieldId, message) {
    const field = document.getElementById(fieldId);
    const feedback = field.nextElementSibling;
    
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
}

function markValid(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
}

function markAllFieldsValid() {
    const fields = document.querySelectorAll('.form-control, .form-select');
    fields.forEach(field => {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    });
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-container');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast-container position-fixed top-0 end-0 p-3`;
    toast.innerHTML = `
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
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}