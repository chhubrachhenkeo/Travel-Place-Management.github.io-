// Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Load initial data
    loadDashboardData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update last updated time
    updateLastUpdated();
});

function initializeDashboard() {
    // Check authentication
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize storage
    if (typeof initializeStorage === 'function') {
        initializeStorage();
    }
}

function loadDashboardData(filter = 'all', status = 'all', search = '', sort = 'name', price = 'all') {
    try {
        let places = [];

        // Get base places data
        if (search) {
            places = searchPlaces(search);
        } else if (filter !== 'all') {
            places = filterPlacesByCategory(filter);
        } else {
            places = getAllPlaces();
        }

        // Ensure places is always an array
        if (!Array.isArray(places)) {
            places = [];
        }

        // Apply status filter
        if (status !== 'all') {
            places = filterPlacesByStatus(status, places);
        }

        // Apply price filter
        if (price !== 'all') {
            places = filterByPriceRange(places, price);
        }

        // Apply sorting
        places = sortPlaces(places, sort);

        // Update UI
        displayStatistics();
        updateCategoryCounts();
        displayPlaces(places);
        updatePlacesTitle(filter, status, search, places.length);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show error state
        const container = document.getElementById('placesGrid');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="mb-3">
                        <i class="fas fa-exclamation-triangle fa-4x text-warning"></i>
                    </div>
                    <h4 class="text-muted">Error loading places</h4>
                    <p class="text-muted mb-2">Error: ${error.message}</p>
                    <p class="text-muted">Please try refreshing the page or clearing data</p>
                    <button class="btn btn-primary me-2" onclick="loadDashboardData()">Retry</button>
                    <button class="btn btn-outline-secondary" onclick="clearAllData()">Clear Data</button>
                </div>
            `;
        }
    }
}

function displayStatistics() {
    const stats = getStatistics();

    if (stats) {
        document.getElementById('totalPlaces').textContent = stats.totalPlaces;
        document.getElementById('topRated').textContent = stats.topRated;
        document.getElementById('mostVisited').textContent = stats.mostVisited.toLocaleString();
        document.getElementById('upcomingPlaces').textContent = stats.upcoming;
        document.getElementById('totalChange').textContent = `+${Math.floor(Math.random() * 10)}`;
    }
}

function updateCategoryCounts() {
    const categories = ['beach', 'mountain', 'city', 'historical', 'forest'];
    
    categories.forEach(category => {
        const count = getCategoryCount(category);
        const element = document.getElementById(`${category}Count`);
        if (element) {
            element.textContent = count;
        }
    });
    
    // Update "All Places" count
    const allCount = getAllPlaces().length;
    document.getElementById('allCount').textContent = allCount;
}

function displayPlaces(places) {
    const container = document.getElementById('placesGrid');
    const noResults = document.getElementById('noResults');
    const paginationContainer = document.getElementById('paginationContainer');

    if (!container) {
        console.error('placesGrid container not found');
        return;
    }

    if (places.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        paginationContainer.style.display = 'none';
        // Hide delete button when no places
        updateDeleteButtonVisibility();
        return;
    }

    noResults.style.display = 'none';

    let html = '';

    places.forEach(place => {
        html += createPlaceCard(place);
    });

    container.innerHTML = html;

    // Setup place card interactions
    setupPlaceCardInteractions();

    // Reset delete button visibility
    updateDeleteButtonVisibility();

    // Show pagination if needed
    if (places.length > 6) {
        setupPagination(places);
        paginationContainer.style.display = 'block';
    } else {
        paginationContainer.style.display = 'none';
    }
}

function createPlaceCard(place) {
    const statusColors = {
        visited: 'success',
        planned: 'primary',
        wishlist: 'secondary'
    };
    
    const categoryColors = {
        beach: 'info',
        mountain: 'success',
        city: 'warning',
        historical: 'secondary',
        forest: 'success'
    };
    
    const statusIcon = {
        visited: 'fa-check-circle',
        planned: 'fa-calendar-check',
        wishlist: 'fa-heart'
    };
    
    const categoryIcon = {
        beach: 'fa-umbrella-beach',
        mountain: 'fa-mountain',
        city: 'fa-city',
        historical: 'fa-landmark',
        forest: 'fa-tree'
    };
    
    return `
        <div class="col-md-6 col-lg-4 fade-in">
            <div class="card place-card h-100">
                <div class="position-relative overflow-hidden">
                    <img src="${place.image}"
                         class="card-img-top place-image"
                         alt="${place.name}"
                         onerror="this.src='https://via.placeholder.com/400x200?text=Travel+Place'">
                    <div class="position-absolute top-0 start-0 m-3">
                        <div class="form-check">
                            <input class="form-check-input place-checkbox" type="checkbox" value="${place.id}" id="check-${place.id}">
                        </div>
                    </div>
                    <div class="position-absolute top-0 end-0 m-3">
                        <span class="badge bg-${statusColors[place.status]}">
                            <i class="fas ${statusIcon[place.status]} me-1"></i>
                            ${place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                        </span>
                    </div>
                    <div class="position-absolute bottom-0 start-0 m-3">
                        <span class="badge bg-${categoryColors[place.category]}">
                            <i class="fas ${categoryIcon[place.category]} me-1"></i>
                            ${place.category.charAt(0).toUpperCase() + place.category.slice(1)}
                        </span>
                    </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${place.name}</h5>
                        <span class="price-tag">${place.priceRange}</span>
                    </div>
                    
                    <p class="card-text text-muted small flex-grow-1 text-truncate-2">
                        ${place.description}
                    </p>
                    
                    <div class="mb-3">
                        <div class="rating-stars mb-1">
                            ${generateStarRating(place.rating)}
                            <small class="text-muted ms-1">${place.rating.toFixed(1)}</small>
                        </div>
                        <small class="text-muted">
                            <i class="fas fa-users me-1"></i>
                            ${place.visitors.toLocaleString()} visitors
                        </small>
                    </div>
                    
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-map-marker-alt text-muted me-1"></i>
                                <small class="text-muted">${place.location}</small>
                            </div>
                            <div>
                                <a href="details.html?id=${place.id}" 
                                   class="btn btn-sm btn-outline-primary me-1">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="form.html?id=${place.id}" 
                                   class="btn btn-sm btn-outline-success me-1">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-danger delete-place-btn" 
                                        data-id="${place.id}" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top">
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>
                        Added: ${formatDate(place.dateAdded)}
                    </small>
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
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function setupEventListeners() {
    // Category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Clear status filter
            document.querySelectorAll('.filter-status').forEach(b => {
                b.classList.remove('active');
            });
            
            const filter = this.dataset.filter;
            const search = document.getElementById('searchInput').value;
            const sort = document.getElementById('sortSelect').value;
            const price = document.getElementById('priceFilter').value;
            
            loadDashboardData(filter, 'all', search, sort, price);
        });
    });
    
    // Status filter buttons
    document.querySelectorAll('.filter-status').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            document.querySelectorAll('.filter-status').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            const status = this.dataset.status;
            const search = document.getElementById('searchInput').value;
            const sort = document.getElementById('sortSelect').value;
            const price = document.getElementById('priceFilter').value;
            
            loadDashboardData('all', status, search, sort, price);
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
                const status = document.querySelector('.filter-status.active')?.dataset.status || 'all';
                const sort = document.getElementById('sortSelect').value;
                const price = document.getElementById('priceFilter').value;
                
                loadDashboardData(filter, status, this.value, sort, price);
            }, 300);
        });
    }
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            const status = document.querySelector('.filter-status.active')?.dataset.status || 'all';
            const search = document.getElementById('searchInput').value;
            const price = document.getElementById('priceFilter').value;
            
            loadDashboardData(filter, status, search, this.value, price);
        });
    }
    
    // Price filter
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', function() {
            const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            const status = document.querySelector('.filter-status.active')?.dataset.status || 'all';
            const search = document.getElementById('searchInput').value;
            const sort = document.getElementById('sortSelect').value;
            
            loadDashboardData(filter, status, search, sort, this.value);
        });
    }
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Clear all filters
            document.querySelectorAll('.filter-btn, .filter-status').forEach(btn => {
                btn.classList.remove('active');
            });

            // Set "All Places" as active
            document.querySelector('[data-filter="all"]').classList.add('active');
            document.querySelector('[data-status="all"]').classList.add('active');

            // Clear search and reset selects
            document.getElementById('searchInput').value = '';
            document.getElementById('sortSelect').value = 'name';
            document.getElementById('priceFilter').value = 'all';

            // Reload data
            loadDashboardData('all', 'all', '', 'name', 'all');
        });
    }

    // Delete selected button
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            deleteSelectedPlaces();
        });
    }
}

function setupPlaceCardInteractions() {
    // Add hover effects and click handlers
    document.querySelectorAll('.place-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a, button, .form-check-input')) {
                const viewBtn = this.querySelector('a[href*="details.html"]');
                if (viewBtn) {
                    window.location.href = viewBtn.getAttribute('href');
                }
            }
        });
    });

    // Add delete button handlers
    document.querySelectorAll('.delete-place-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const placeId = this.getAttribute('data-id');
            confirmDeletePlace(placeId);
        });
    });

    // Add checkbox handlers
    document.querySelectorAll('.place-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateDeleteButtonVisibility();
        });
    });
}

function confirmDeletePlace(placeId) {
    if (confirm('Are you sure you want to delete this place?')) {
        // Call the storage delete function
        deletePlaceFromStorage(placeId);
        // Reload dashboard data
        loadDashboardData();
    }
}

function updateDeleteButtonVisibility() {
    const checkedBoxes = document.querySelectorAll('.place-checkbox:checked');
    const deleteBtn = document.getElementById('deleteBtn');

    if (checkedBoxes.length > 0) {
        deleteBtn.style.display = 'inline-block';
    } else {
        deleteBtn.style.display = 'none';
    }
}

function deleteSelectedPlaces() {
    const checkedBoxes = document.querySelectorAll('.place-checkbox:checked');
    const placeIds = Array.from(checkedBoxes).map(checkbox => checkbox.value);

    if (placeIds.length === 0) {
        alert('Please select places to delete.');
        return;
    }

    const confirmMessage = placeIds.length === 1
        ? 'Are you sure you want to delete this place?'
        : `Are you sure you want to delete ${placeIds.length} places?`;

    if (confirm(confirmMessage)) {
        placeIds.forEach(id => {
            deletePlaceFromStorage(id);
        });
        // Reload dashboard data
        loadDashboardData();
    }
}

function clearAllData() {
    if (confirm('This will clear all travel places data and reset to sample data. Continue?')) {
        localStorage.removeItem('travelPlaces');
        localStorage.removeItem('travelStats');
        location.reload();
    }
}

function setupPagination(places) {
    const itemsPerPage = 6;
    const totalPages = Math.ceil(places.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    let html = `
        <li class="page-item">
            <a class="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === 1 ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    html += `
        <li class="page-item">
            <a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    pagination.innerHTML = html;
    
    // Add pagination event listeners
    setupPaginationListeners(places, itemsPerPage);
}

function setupPaginationListeners(places, itemsPerPage) {
    document.querySelectorAll('#pagination .page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.dataset.page;
            if (page) {
                // Update active page
                document.querySelectorAll('#pagination .page-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.parentElement.classList.add('active');
                
                // Display page items
                displayPageItems(places, parseInt(page), itemsPerPage);
            }
        });
    });
}

function displayPageItems(places, page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = places.slice(start, end);
    
    const container = document.getElementById('placesGrid');
    let html = '';
    
    pageItems.forEach(place => {
        html += createPlaceCard(place);
    });
    
    container.innerHTML = html;
    setupPlaceCardInteractions();
}

function updatePlacesTitle(filter, status, search, count) {
    const titleElement = document.getElementById('placesTitle');
    let title = '';
    
    if (search) {
        title = `Search Results: "${search}" (${count})`;
    } else if (filter !== 'all') {
        const filterNames = {
            beach: 'Beaches',
            mountain: 'Mountains',
            city: 'Cities',
            historical: 'Historical Sites',
            forest: 'Forests'
        };
        title = `${filterNames[filter]} (${count})`;
    } else if (status !== 'all') {
        const statusNames = {
            visited: 'Visited Places',
            planned: 'Planned Trips',
            wishlist: 'Wishlist'
        };
        title = `${statusNames[status]} (${count})`;
    } else {
        title = `All Travel Places (${count})`;
    }
    
    titleElement.textContent = title;
}

function updateLastUpdated() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        const now = new Date();
        const options = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        };
        lastUpdateElement.textContent = `Last updated: ${now.toLocaleTimeString('en-US', options)}`;
    }
}

// Refresh data every 5 minutes
setInterval(updateLastUpdated, 300000);