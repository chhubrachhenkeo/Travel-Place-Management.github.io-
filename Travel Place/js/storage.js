// Local Storage Operations for Travel Places
const STORAGE_KEY = 'travelPlaces';
const STATS_KEY = 'travelStats';

// Initialize sample data
const SAMPLE_PLACES = [
    {
        id: '1',
        name: 'Bali Paradise Beach',
        description: 'Beautiful white sand beach with crystal clear water. Perfect for surfing and relaxation.',
        category: 'beach',
        location: 'Bali, Indonesia',
        rating: 4.8,
        visitors: 15000,
        status: 'visited',
        priceRange: '$$$',
        bestTime: 'April - October',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
        amenities: ['WiFi', 'Restaurant', 'Parking', 'Beach Access', 'Spa'],
        dateAdded: '2024-01-15',
        lastUpdated: '2024-01-20'
    },
    {
        id: '2',
        name: 'Himalayan Trek',
        description: 'Challenging trek through the majestic Himalayas with breathtaking views.',
        category: 'mountain',
        location: 'Nepal',
        rating: 4.9,
        visitors: 8500,
        status: 'planned',
        priceRange: '$$',
        bestTime: 'March - May',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        amenities: ['Guide', 'Camping', 'First Aid', 'Transport'],
        dateAdded: '2024-02-10',
        lastUpdated: '2024-02-10'
    },
    {
        id: '3',
        name: 'Tokyo City Lights',
        description: 'Experience the vibrant city life, modern technology and traditional culture.',
        category: 'city',
        location: 'Tokyo, Japan',
        rating: 4.7,
        visitors: 25000,
        status: 'wishlist',
        priceRange: '$$$$',
        bestTime: 'All Year',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        amenities: ['WiFi', 'Hotels', 'Restaurants', 'Shopping', 'Transport'],
        dateAdded: '2024-01-20',
        lastUpdated: '2024-01-20'
    },
    {
        id: '4',
        name: 'Amazon Rainforest',
        description: 'Explore the world\'s largest tropical rainforest with diverse wildlife.',
        category: 'forest',
        location: 'Brazil',
        rating: 4.6,
        visitors: 5000,
        status: 'planned',
        priceRange: '$$$',
        bestTime: 'June - November',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b',
        amenities: ['Guide', 'Lodging', 'Meals', 'Transport'],
        dateAdded: '2024-03-05',
        lastUpdated: '2024-03-05'
    },
    {
        id: '5',
        name: 'Rome Historical Tour',
        description: 'Walk through ancient history with iconic monuments and architecture.',
        category: 'historical',
        location: 'Rome, Italy',
        rating: 4.9,
        visitors: 32000,
        status: 'visited',
        priceRange: '$$$',
        bestTime: 'April - June',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
        amenities: ['Guides', 'Audio Tours', 'Restaurants', 'Museums'],
        dateAdded: '2024-01-25',
        lastUpdated: '2024-02-15'
    }
];

// Initialize storage
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PLACES));
        updateStatistics();
    }
}

// Get all places
function getAllPlaces() {
    initializeStorage();
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error parsing places data:', error);
        // Reset corrupted data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STATS_KEY);
        initializeStorage();
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }
}

// Get place by ID
function getPlaceById(id) {
    const places = getAllPlaces();
    return places.find(place => place.id === id);
}

// Add new place
function addPlace(placeData) {
    const places = getAllPlaces();
    
    // Generate unique ID
    const newId = generateId();
    
    // Prepare place object
    const newPlace = {
        id: newId,
        ...placeData,
        dateAdded: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    places.push(newPlace);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    updateStatistics();
    
    return newId;
}

// Update existing place
function updatePlace(id, placeData) {
    const places = getAllPlaces();
    const index = places.findIndex(place => place.id === id);
    
    if (index === -1) {
        return false;
    }
    
    // Preserve original dateAdded
    const originalDateAdded = places[index].dateAdded;
    
    places[index] = {
        ...places[index],
        ...placeData,
        id: id,
        dateAdded: originalDateAdded,
        lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    updateStatistics();
    
    return true;
}

// Delete place from storage
function deletePlaceFromStorage(id) {
    const places = getAllPlaces();
    const filteredPlaces = places.filter(place => place.id !== id);
    
    if (filteredPlaces.length === places.length) {
        return false; // Place not found
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPlaces));
    updateStatistics();
    
    return true;
}

// Filter places by category
function filterPlacesByCategory(category, places = null) {
    const allPlaces = places || getAllPlaces();
    if (category === 'all') return allPlaces;
    return allPlaces.filter(place => place.category === category);
}

// Filter places by status
function filterPlacesByStatus(status, places = null) {
    const allPlaces = places || getAllPlaces();
    if (status === 'all') return allPlaces;
    return allPlaces.filter(place => place.status === status);
}

// Search places
function searchPlaces(query) {
    const places = getAllPlaces();
    if (!query.trim()) return places;
    
    const searchTerm = query.toLowerCase();
    return places.filter(place => 
        place.name.toLowerCase().includes(searchTerm) ||
        place.description.toLowerCase().includes(searchTerm) ||
        place.location.toLowerCase().includes(searchTerm) ||
        place.category.toLowerCase().includes(searchTerm)
    );
}

// Filter by price range
function filterByPriceRange(places, priceRange) {
    if (priceRange === 'all') return places;
    return places.filter(place => place.priceRange === priceRange);
}

// Sort places
function sortPlaces(places, sortBy) {
    return [...places].sort((a, b) => {
        switch(sortBy) {
            case 'rating':
                return b.rating - a.rating;
            case 'visitors':
                return b.visitors - a.visitors;
            case 'date':
                return new Date(b.dateAdded) - new Date(a.dateAdded);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Update statistics
function updateStatistics() {
    const places = getAllPlaces();

    const stats = {
        totalPlaces: places.length,
        categories: {},
        status: {},
        topRated: places.filter(p => p.rating >= 4).length,
        mostVisited: places.length > 0 ? Math.max(...places.map(p => p.visitors)) : 0,
        upcoming: places.filter(p => p.status === 'planned').length,
        totalVisitors: places.reduce((sum, p) => sum + p.visitors, 0),
        averageRating: places.length ?
            (places.reduce((sum, p) => sum + p.rating, 0) / places.length).toFixed(1) : 0,
        lastUpdated: new Date().toISOString()
    };
    
    // Count by category
    ['beach', 'mountain', 'city', 'historical', 'forest'].forEach(category => {
        stats.categories[category] = places.filter(p => p.category === category).length;
    });
    
    // Count by status
    ['visited', 'planned', 'wishlist'].forEach(status => {
        stats.status[status] = places.filter(p => p.status === status).length;
    });
    
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    
    return stats;
}

// Get statistics
function getStatistics() {
    try {
        if (!localStorage.getItem(STATS_KEY)) {
            return updateStatistics();
        }
        const data = localStorage.getItem(STATS_KEY);
        return data ? JSON.parse(data) : updateStatistics();
    } catch (error) {
        console.error('Error parsing statistics data:', error);
        // Reset corrupted stats
        localStorage.removeItem(STATS_KEY);
        return updateStatistics();
    }
}

// Get category count
function getCategoryCount(category) {
    const stats = getStatistics();
    return stats.categories[category] || 0;
}

// Get status count
function getStatusCount(status) {
    const stats = getStatistics();
    return stats.status[status] || 0;
}