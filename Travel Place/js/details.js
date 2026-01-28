// Details View Logic
document.addEventListener('DOMContentLoaded', function() {
    // Get place ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id');
    
    if (!placeId) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load place details
    loadPlaceDetails(placeId);
    
    // Setup event listeners
    document.getElementById('deleteBtn').addEventListener('click', function() {
        deletePlaceConfirmation(placeId);
    });
    
    // Update edit button href
    document.getElementById('editBtn').href = `form.html?id=${placeId}`;
});

function loadPlaceDetails(id) {
    const place = getPlaceById(id);
    const container = document.getElementById('detailsContainer');
    
    if (!place) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-3">
                    <i class="fas fa-exclamation-triangle fa-4x text-warning"></i>
                </div>
                <h2 class="mb-3">Place Not Found</h2>
                <p class="text-muted mb-4">The requested travel place could not be found.</p>
                <a href="dashboard.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
                </a>
            </div>
        `;
        return;
    }
    
    // Create details HTML
    const detailsHTML = createDetailsHTML(place);
    container.innerHTML = detailsHTML;
    
    // Setup image error handling
    setupImageErrorHandling();
}

function createDetailsHTML(place) {
    const statusColors = {
        visited: 'success',
        planned: 'primary',
        wishlist: 'secondary'
    };
    
    const statusIcons = {
        visited: 'fa-check-circle',
        planned: 'fa-calendar-check',
        wishlist: 'fa-heart'
    };
    
    const categoryIcons = {
        beach: 'fa-umbrella-beach',
        mountain: 'fa-mountain',
        city: 'fa-city',
        historical: 'fa-landmark',
        forest: 'fa-tree'
    };
    
    // Generate amenities badges
    const amenitiesHTML = place.amenities.map(amenity => 
        `<span class="badge amenity-badge me-1 mb-1">${amenity}</span>`
    ).join('');
    
    // Generate star rating
    const starRating = generateStarRating(place.rating);
    
    return `
        <div class="row g-4">
            <!-- Hero Image -->
            <div class="col-12">
                <div class="position-relative">
                    <img src="${place.image}" 
                         class="img-fluid detail-hero w-100" 
                         alt="${place.name}"
                         onerror="this.src='https://via.placeholder.com/1200x400?text=Travel+Place'">
                    <div class="position-absolute bottom-0 start-0 m-4">
                        <h1 class="text-white mb-2">${place.name}</h1>
                        <div class="d-flex align-items-center">
                            <span class="badge bg-${statusColors[place.status]} me-2">
                                <i class="fas ${statusIcons[place.status]} me-1"></i>
                                ${place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                            </span>
                            <span class="badge bg-light text-dark">
                                <i class="fas ${categoryIcons[place.category]} me-1"></i>
                                ${place.category.charAt(0).toUpperCase() + place.category.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <!-- Rating and Visitors -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="rating-stars fs-4 mb-2">
                                    ${starRating}
                                    <span class="ms-2">${place.rating.toFixed(1)}/5.0</span>
                                </div>
                                <p class="text-muted mb-0">
                                    Based on ${place.visitors.toLocaleString()} visitors
                                </p>
                            </div>
                            <div class="col-md-6 text-md-end">
                                <div class="h4 mb-2 price-tag">${place.priceRange}</div>
                                <p class="text-muted mb-0">Price Range</p>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div class="mb-4">
                            <h4 class="mb-3">
                                <i class="fas fa-info-circle text-primary me-2"></i>Description
                            </h4>
                            <p class="lead">${place.description}</p>
                        </div>
                        
                        <!-- Location and Best Time -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="card border-0 bg-light">
                                    <div class="card-body">
                                        <h5>
                                            <i class="fas fa-map-marker-alt text-primary me-2"></i>
                                            Location
                                        </h5>
                                        <p class="mb-0">${place.location}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card border-0 bg-light">
                                    <div class="card-body">
                                        <h5>
                                            <i class="fas fa-calendar-alt text-primary me-2"></i>
                                            Best Time to Visit
                                        </h5>
                                        <p class="mb-0">${place.bestTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Amenities -->
                        <div class="mb-4">
                            <h4 class="mb-3">
                                <i class="fas fa-check-circle text-primary me-2"></i>
                                Amenities & Facilities
                            </h4>
                            <div>${amenitiesHTML}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Sidebar -->
            <div class="col-lg-4">
                <!-- Quick Stats -->
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-chart-bar me-2"></i>Quick Stats
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span>Total Visitors</span>
                            <span class="fw-bold">${place.visitors.toLocaleString()}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span>Rating</span>
                            <span class="fw-bold">${place.rating.toFixed(1)}/5.0</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span>Status</span>
                            <span class="fw-bold text-${statusColors[place.status]}">
                                ${place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Category</span>
                            <span class="fw-bold">${place.category.charAt(0).toUpperCase() + place.category.slice(1)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Additional Info -->
                <div class="card shadow-sm">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">
                            <i class="fas fa-info-circle me-2"></i>Additional Information
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <small class="text-muted">Date Added</small>
                            <p class="mb-0">${formatDate(place.dateAdded)}</p>
                        </div>
                        <div class="mb-3">
                            <small class="text-muted">Last Updated</small>
                            <p class="mb-0">${formatDate(place.lastUpdated)}</p>
                        </div>
                        <div>
                            <small class="text-muted">ID</small>
                            <p class="mb-0">
                                <code>${place.id}</code>
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="mt-4">
                    <div class="d-grid gap-2">
                        <a href="form.html?id=${place.id}" class="btn btn-warning">
                            <i class="fas fa-edit me-1"></i>Edit This Place
                        </a>
                        <a href="dashboard.html" class="btn btn-outline-secondary">
                            <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function deletePlaceConfirmation(id) {
    if (confirm('Are you sure you want to delete this place? This action cannot be undone.')) {
        if (deletePlaceFromStorage(id)) {
            showToast('Place deleted successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showToast('Error deleting place. Please try again.', 'error');
        }
    }
}

function showToast(message, type = 'info') {
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

function setupImageErrorHandling() {
    const images = document.querySelectorAll('img[onerror]');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/1200x400?text=Travel+Place';
        });
    });
}