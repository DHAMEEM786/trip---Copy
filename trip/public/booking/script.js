// Google Places API service
const GOOGLE_API_KEY = 'AIzaSyATew-TdTHzI9IZjizM8dOJxMBXPB6LRfE';

// Initialize Google Places Service
let placesService;
let geocoder;

// Initialize when Google Maps API loads
function initGoogleMaps() {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        // Create a hidden map for Places Service
        const mapElement = document.createElement('div');
        mapElement.style.display = 'none';
        document.body.appendChild(mapElement);

        const map = new google.maps.Map(mapElement, {
            center: { lat: 0, lng: 0 },
            zoom: 2
        });

        placesService = new google.maps.places.PlacesService(map);
        geocoder = new google.maps.Geocoder();
        console.log('Google Maps API initialized successfully');
    } else {
        console.error('Google Maps API not loaded properly');
    }
}

// Wait for Google Maps API to load
if (typeof google !== 'undefined' && google.maps) {
    initGoogleMaps();
} else {
    window.addEventListener('load', () => {
        setTimeout(initGoogleMaps, 1000);
    });
}

// Search hotels function
async function searchHotels() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const keyword = document.getElementById('keywordInput').value.trim();
    const radius = parseInt(document.getElementById('radiusSelect').value);

    if (!searchInput) {
        showError('Please enter a Tamil Nadu city name to search');
        return;
    }

    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('results').innerHTML = '';
    document.getElementById('locationInfo').style.display = 'none';

    try {
        // First, geocode the location to get coordinates
        const location = await geocodeLocation(searchInput);

        if (!location) {
            showError('Location not found in Tamil Nadu. Please try a different city name.');
            document.getElementById('loading').style.display = 'none';
            return;
        }

        // Show the resolved location
        const locationText = location.formattedAddress || searchInput;
        console.log('Searching hotels near:', locationText);

        // Display location info
        const locationInfo = document.getElementById('locationInfo');
        const currentLocation = document.getElementById('currentLocation');
        if (locationInfo && currentLocation) {
            currentLocation.textContent = locationText;
            locationInfo.style.display = 'block';
        }

        // Search for hotels using Places API
        await searchNearbyHotels(location, radius, keyword);

    } catch (error) {
        console.error('Error searching hotels:', error);
        showError('Error: ' + error + '. Please make sure you entered a valid Tamil Nadu city name.');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Tamil Nadu cities mapping
const TAMIL_NADU_CITIES = {
    'Salem': 'Salem, Tamil Nadu, India',
    'Chennai': 'Chennai, Tamil Nadu, India',
    'Coimbatore': 'Coimbatore, Tamil Nadu, India',
    'Madurai': 'Madurai, Tamil Nadu, India',
    'Trichy': 'Tiruchirappalli, Tamil Nadu, India',
    'Tirunelveli': 'Tirunelveli, Tamil Nadu, India',
    'Erode': 'Erode, Tamil Nadu, India',
    'Vellore': 'Vellore, Tamil Nadu, India',
    'Thanjavur': 'Thanjavur, Tamil Nadu, India',
    'Dindigul': 'Dindigul, Tamil Nadu, India',
    'Tuticorin': 'Thoothukudi, Tamil Nadu, India',
    'Kanchipuram': 'Kanchipuram, Tamil Nadu, India',
    'Nagercoil': 'Nagercoil, Tamil Nadu, India',
    'Karur': 'Karur, Tamil Nadu, India',
    'Hosur': 'Hosur, Tamil Nadu, India',
    'Krishnagiri': 'Krishnagiri, Tamil Nadu, India',
    'Namakkal': 'Namakkal, Tamil Nadu, India',
    'Dharmapuri': 'Dharmapuri, Tamil Nadu, India',
    'Cuddalore': 'Cuddalore, Tamil Nadu, India',
    'Pudukkottai': 'Pudukkottai, Tamil Nadu, India',
    'Kumbakonam': 'Kumbakonam, Tamil Nadu, India'
};

// Format address for Tamil Nadu search
function formatAddressForTamilNadu(address) {
    const trimmedAddress = address.trim();

    // Check if it's a known Tamil Nadu city
    if (TAMIL_NADU_CITIES[trimmedAddress]) {
        return TAMIL_NADU_CITIES[trimmedAddress];
    }

    // Check if address already contains "Tamil Nadu" or "India"
    if (trimmedAddress.toLowerCase().includes('tamil nadu') ||
        trimmedAddress.toLowerCase().includes('india')) {
        return trimmedAddress;
    }

    // Check if it matches any Tamil Nadu city name (case-insensitive)
    for (const [key, value] of Object.entries(TAMIL_NADU_CITIES)) {
        if (trimmedAddress.toLowerCase() === key.toLowerCase()) {
            return value;
        }
    }

    // Try to find if the address contains a Tamil Nadu city name
    for (const city of Object.keys(TAMIL_NADU_CITIES)) {
        if (trimmedAddress.toLowerCase().includes(city.toLowerCase())) {
            return TAMIL_NADU_CITIES[city];
        }
    }

    // If not found, append ", Tamil Nadu, India" to ensure we search in Tamil Nadu
    return trimmedAddress + ', Tamil Nadu, India';
}

// Geocode location to get coordinates
function geocodeLocation(address) {
    return new Promise((resolve, reject) => {
        if (!geocoder) {
            reject('Geocoder not initialized');
            return;
        }

        // Format address for Tamil Nadu
        const formattedAddress = formatAddressForTamilNadu(address);
        console.log('Searching for:', formattedAddress);

        // Geocode with formatted address (includes Tamil Nadu, India)
        geocoder.geocode({
            address: formattedAddress,
            region: 'IN' // Bias results towards India
        }, (results, status) => {
            if (status === 'OK' && results[0]) {
                // Verify it's in Tamil Nadu by checking address components
                const addressComponents = results[0].address_components || [];
                const isTamilNadu = addressComponents.some(component =>
                    (component.types.includes('administrative_area_level_1') ||
                        component.types.includes('administrative_area_level_2')) &&
                    (component.long_name.toLowerCase().includes('tamil nadu') ||
                        component.short_name.toLowerCase().includes('tn'))
                );

                // Also check if formatted address contains Tamil Nadu
                const addressText = (results[0].formatted_address || '').toLowerCase();
                const hasTamilNadu = addressText.includes('tamil nadu') ||
                    addressText.includes('tamilnadu') ||
                    formattedAddress.toLowerCase().includes('tamil nadu');

                if (isTamilNadu || hasTamilNadu) {
                    resolve({
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng(),
                        formattedAddress: results[0].formatted_address
                    });
                } else {
                    // Try again with explicit "Tamil Nadu, India" suffix
                    const retryAddress = address.trim() + ', Tamil Nadu, India';
                    geocoder.geocode({
                        address: retryAddress,
                        region: 'IN'
                    }, (results2, status2) => {
                        if (status2 === 'OK' && results2[0]) {
                            resolve({
                                lat: results2[0].geometry.location.lat(),
                                lng: results2[0].geometry.location.lng(),
                                formattedAddress: results2[0].formatted_address
                            });
                        } else {
                            // Even if we can't verify Tamil Nadu, return the result
                            // as the address was formatted to include Tamil Nadu
                            resolve({
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng(),
                                formattedAddress: results[0].formatted_address
                            });
                        }
                    });
                }
            } else {
                // If geocoding fails, reject
                reject('Location not found. Please check the city name and try again. Status: ' + status);
            }
        });
    });
}

// Search nearby hotels
function searchNearbyHotels(location, radius, keyword) {
    return new Promise((resolve, reject) => {
        if (!placesService) {
            reject('Places Service not initialized');
            return;
        }

        const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: radius,
            type: 'lodging', // Hotels and accommodations
            keyword: keyword || 'hotel'
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Get detailed information for each place
                getPlaceDetails(results);
                resolve(results);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                showError('No hotels found in this area. Try a different location or increase the radius.');
                resolve([]);
            } else {
                showError('Search failed: ' + status);
                reject(status);
            }
        });
    });
}

// Get detailed information for places
function getPlaceDetails(places) {
    if (!places || places.length === 0) {
        document.getElementById('results').innerHTML = '<div class="no-results">No hotels found</div>';
        return;
    }

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    places.forEach((place, index) => {
        // Get detailed information with all available fields
        const detailRequest = {
            placeId: place.place_id,
            fields: [
                'name',
                'formatted_address',
                'formatted_phone_number',
                'international_phone_number',
                'rating',
                'user_ratings_total',
                'types',
                'photos',
                'price_level',
                'geometry',
                'website',
                'url',
                'opening_hours',
                'vicinity',
                'plus_code',
                'editorial_summary',
                'reviews',
                'address_components',
                'place_id',
                'business_status'
            ]
        };

        placesService.getDetails(detailRequest, (placeDetails, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                if (placeDetails) {
                    // Merge basic place info with detailed info to ensure we have all data
                    const mergedPlace = { ...place, ...placeDetails };
                    displayHotelCard(mergedPlace);
                } else {
                    // If no details returned but status is OK, use basic place info
                    displayHotelCard(place);
                }
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.warn('No details found for place:', place.name);
                displayHotelCard(place);
            } else {
                // If details fail, display basic info with error handling
                console.warn('Failed to get details for place:', place.name, 'Status:', status);
                // Still display the card with available information
                displayHotelCard(place);
            }
        });
    });
}

// Display hotel card
function displayHotelCard(place) {
    const resultsContainer = document.getElementById('results');

    const card = document.createElement('div');
    card.className = 'hotel-card';

    // Photo (at top)
    if (place.photos && place.photos.length > 0) {
        const photo = place.photos[0];
        const photoUrl = photo.getUrl({ maxWidth: 400, maxHeight: 300 });

        const img = document.createElement('img');
        img.src = photoUrl;
        img.alt = place.name;
        card.appendChild(img);
    }

    // Create content wrapper
    const cardContent = document.createElement('div');
    cardContent.className = 'hotel-card-content';

    // Hotel name
    const name = document.createElement('div');
    name.className = 'hotel-name';
    name.textContent = place.name || 'Unknown Hotel';
    cardContent.appendChild(name);

    // Address
    const address = document.createElement('div');
    address.className = 'hotel-address';
    address.textContent = place.formatted_address || place.vicinity || 'Address not available';
    cardContent.appendChild(address);

    // Rating
    if (place.rating) {
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'hotel-rating';

        const stars = document.createElement('span');
        stars.className = 'rating-stars';
        stars.textContent = '⭐'.repeat(Math.round(place.rating));

        const ratingValue = document.createElement('span');
        ratingValue.className = 'rating-value';
        ratingValue.textContent = `${place.rating.toFixed(1)}`;

        if (place.user_ratings_total) {
            ratingValue.textContent += ` (${place.user_ratings_total} reviews)`;
        }

        ratingDiv.appendChild(stars);
        ratingDiv.appendChild(ratingValue);
        cardContent.appendChild(ratingDiv);
    }

    // Types
    if (place.types && place.types.length > 0) {
        const typesDiv = document.createElement('div');
        typesDiv.className = 'hotel-types';

        // Filter relevant types
        const relevantTypes = place.types
            .filter(type => !type.includes('point_of_interest') && !type.includes('establishment'))
            .slice(0, 3)
            .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

        relevantTypes.forEach(type => {
            const badge = document.createElement('span');
            badge.className = 'type-badge';
            badge.textContent = type;
            typesDiv.appendChild(badge);
        });

        cardContent.appendChild(typesDiv);
    }

    // Price level and info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'hotel-info';

    const priceInfo = document.createElement('div');
    priceInfo.className = 'price-info';

    if (place.price_level !== undefined && place.price_level !== null && place.price_level >= 0 && place.price_level <= 4) {
        const priceLevels = ['Free', '$', '$$', '$$$', '$$$$'];
        priceInfo.textContent = priceLevels[place.price_level] || 'Contact for pricing';
    } else {
        priceInfo.textContent = 'Contact for pricing';
    }

    infoDiv.appendChild(priceInfo);

    // View details button
    const viewBtn = document.createElement('button');
    viewBtn.className = 'view-details';
    viewBtn.textContent = 'View Details';
    viewBtn.onclick = () => showHotelDetails(place);
    infoDiv.appendChild(viewBtn);

    cardContent.appendChild(infoDiv);
    card.appendChild(cardContent);
    resultsContainer.appendChild(card);
}

// Show hotel details in modal
// Show hotel details in modal
function showHotelDetails(place) {
    // Create or get modal
    let modal = document.getElementById('hotelDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hotelDetailsModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    // Build modal content
    let content = `
        <div class="modal-content booking-modal-content">
            <div class="booking-header">
                <h2>${place.name || 'Unknown Hotel'}</h2>
                <span class="close-modal" onclick="closeHotelDetails()">&times;</span>
            </div>
            <div class="booking-body">
    `;

    // Ambiance / Image Gallery
    if (place.photos && place.photos.length > 0) {
        content += '<div class="booking-section"><h3>✨ Ambiance & Views</h3><div class="image-gallery">';
        // Take up to 6 photos
        const photosToShow = place.photos.slice(0, 6);
        photosToShow.forEach(photo => {
            const photoUrl = photo.getUrl({ maxWidth: 600, maxHeight: 400 });
            content += `
                <div class="gallery-item">
                    <img src="${photoUrl}" alt="Hotel Ambiance" loading="lazy">
                </div>
            `;
        });
        content += '</div></div>';
    }

    // Address
    if (place.formatted_address || place.vicinity) {
        content += `<div class="detail-section"><strong>📍 Address:</strong><p>${place.formatted_address || place.vicinity}</p></div>`;
    }

    // Rating
    if (place.rating !== undefined) {
        const stars = '⭐'.repeat(Math.round(place.rating));
        content += `<div class="detail-section"><strong>⭐ Rating:</strong><p>${stars} ${place.rating.toFixed(1)}`;
        if (place.user_ratings_total) {
            content += ` (${place.user_ratings_total.toLocaleString()} reviews)`;
        }
        content += '</p></div>';
    }

    // Phone
    if (place.formatted_phone_number || place.international_phone_number) {
        const phone = place.formatted_phone_number || place.international_phone_number;
        content += `<div class="detail-section"><strong>📞 Phone:</strong><p><a href="tel:${phone}">${phone}</a></p></div>`;
    }

    // Website
    if (place.website) {
        content += `<div class="detail-section"><strong>🌐 Website:</strong><p><a href="${place.website}" target="_blank" rel="noopener">Visit Website</a></p></div>`;
    }

    // Google Maps URL
    if (place.url || place.place_id) {
        const mapsUrl = place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
        content += `<div class="detail-section"><strong>🗺️ Google Maps:</strong><p><a href="${mapsUrl}" target="_blank" rel="noopener">View on Google Maps</a></p></div>`;
    }

    // Price level
    if (place.price_level !== undefined && place.price_level !== null) {
        const priceLevels = ['Free', '$', '$$', '$$$', '$$$$'];
        content += `<div class="detail-section"><strong>💰 Price Level:</strong><p>${priceLevels[place.price_level] || 'Contact for pricing'}</p></div>`;
    }

    // Business status
    if (place.business_status) {
        const statusColors = {
            'OPERATIONAL': '#4caf50',
            'CLOSED_TEMPORARILY': '#ff9800',
            'CLOSED_PERMANENTLY': '#f44336'
        };
        const statusText = place.business_status.replace(/_/g, ' ');
        const statusColor = statusColors[place.business_status] || '#666';
        content += `<div class="detail-section"><strong>Status:</strong><p style="color: ${statusColor};">${statusText}</p></div>`;
    }

    // Opening hours
    if (place.opening_hours && place.opening_hours.weekday_text) {
        content += '<div class="detail-section"><strong>🕐 Opening Hours:</strong><ul class="hours-list">';
        place.opening_hours.weekday_text.forEach(day => {
            content += `<li>${day}</li>`;
        });
        content += '</ul></div>';
    }

    // Types/Categories
    if (place.types && place.types.length > 0) {
        const relevantTypes = place.types
            .filter(type => !type.includes('point_of_interest') && type !== 'establishment')
            .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

        if (relevantTypes.length > 0) {
            content += '<div class="detail-section"><strong>🏷️ Categories:</strong><div class="types-container">';
            relevantTypes.forEach(type => {
                content += `<span class="type-badge-large">${type}</span>`;
            });
            content += '</div></div>';
        }
    }

    // Reviews
    if (place.reviews && place.reviews.length > 0) {
        content += '<div class="detail-section"><strong>💬 Recent Reviews:</strong>';
        place.reviews.slice(0, 3).forEach(review => {
            const reviewStars = '⭐'.repeat(Math.round(review.rating));
            content += `
                <div class="review-item">
                    <div class="review-header">
                        ${review.author_name} <span style="margin-left: 8px;">${reviewStars}</span>
                    </div>
                    <p class="review-text">"${review.text}"</p>
                    <div class="review-time">${review.relative_time_description}</div>
                </div>
            `;
        });
        content += '</div>';
    }

    // Book Room Button
    content += `
        <div style="margin-top: 30px; text-align: center;">
            <button class="book-room-btn" onclick="showBookingInterface({
                place_id: '${place.place_id}',
                name: '${place.name.replace(/'/g, "\\'")}'
            })">
                Book a Room ➜
            </button>
        </div>
    `;

    content += `
            </div> <!-- End booking-body -->
        </div> <!-- End modal-content -->
    `;

    modal.innerHTML = content;
    modal.style.display = 'block';

    // Close modal when clicking outside
    window.onclick = function (event) {
        if (event.target === modal) {
            closeHotelDetails();
        }
    };
}

// Close hotel details modal
function closeHotelDetails() {
    const modal = document.getElementById('hotelDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const keywordInput = document.getElementById('keywordInput');

    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchHotels();
            }
        });
    }

    if (keywordInput) {
        keywordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchHotels();
            }
        });
    }
});


// Room Booking Manager
const RoomManager = {
    // Generate random rooms for a hotel if not exists
    // Now accepts 'place' object to save metadata
    initRooms(place) {
        const hotelId = place.place_id;
        const storageKey = `rooms_${hotelId}`;

        if (!localStorage.getItem(storageKey)) {
            const rooms = [];
            const floors = 3;
            const roomsPerFloor = 4;

            for (let f = 1; f <= floors; f++) {
                for (let r = 1; r <= roomsPerFloor; r++) {
                    rooms.push({
                        number: `${f}0${r}`,
                        status: Math.random() > 0.7 ? 'booked' : 'available', // 30% chance of being booked
                        type: r % 2 === 0 ? 'Double' : 'Single',
                        price: 1000 + (Math.random() * 2000),
                        bookingDetails: null
                    });
                }
            }
            localStorage.setItem(storageKey, JSON.stringify(rooms));
        }
        return JSON.parse(localStorage.getItem(storageKey));
    },

    // Get rooms for a hotel
    getRooms(hotelId) {
        // Just return existing rooms, we assume initRooms was called when opening modal
        const storageKey = `rooms_${hotelId}`;
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    },

    // Book a specific room
    bookRoom(hotelId, roomNumber, details = {}) {
        const storageKey = `rooms_${hotelId}`;
        const rooms = this.getRooms(hotelId);
        const roomIndex = rooms.findIndex(r => r.number === roomNumber);

        if (roomIndex !== -1 && rooms[roomIndex].status === 'available') {
            rooms[roomIndex].status = 'booked';
            rooms[roomIndex].bookingDetails = {
                ...details,
                bookingDate: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(rooms));
            return true;
        }
        return false;
    }
};

// Show Booking Interface
function showBookingInterface(place) {
    // Create or get modal
    let modal = document.getElementById('bookingModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'bookingModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const rooms = RoomManager.initRooms(place);
    const availableRooms = rooms.filter(r => r.status === 'available');
    const bookedRooms = rooms.filter(r => r.status === 'booked');

    let content = `
        <div class="modal-content booking-modal-content">
            <div class="booking-header">
                <h2>Book a Room at ${place.name}</h2>
                <span class="close-modal" onclick="closeBookingModal()">&times;</span>
            </div>
            
            <div class="booking-body">
                <div class="booking-section">
                    <h3>Available Rooms (${availableRooms.length})</h3>
                    <div class="rooms-grid">
                        ${availableRooms.map((room, index) => {
        // Get a random photo from the place photos, or use a placeholder
        let roomBg = '';
        if (place.photos && place.photos.length > 0) {
            // Cycle through photos based on room index
            const photoIndex = index % Math.min(place.photos.length, 5);
            const photoUrl = place.photos[photoIndex].getUrl({ maxWidth: 400, maxHeight: 300 });
            roomBg = `background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${photoUrl}'); background-size: cover; background-position: center;`;
        } else {
            // Fallback gradient if no photos
            roomBg = 'background: linear-gradient(135deg, #10b981 0%, #059669 100%);';
        }

        return `
                            <div class="room-card available" style="${roomBg}" onclick="handleRoomBooking('${place.place_id}', '${room.number}', '${place.name.replace(/'/g, "\\'")}')">
                                <div class="room-header">
                                    <span class="room-number">${room.number}</span>
                                    <span class="room-price">₹${Math.floor(room.price)}</span>
                                </div>
                                <span class="room-type">${room.type} Bed</span>
                                <div class="room-action">Select Room</div>
                            </div>
                        `}).join('')}
                        ${availableRooms.length === 0 ? '<p>No rooms available.</p>' : ''}
                    </div>
                </div>

                <div class="booking-section">
                    <h3>Booked Rooms (${bookedRooms.length})</h3>
                    <div class="rooms-grid">
                        ${bookedRooms.map((room, index) => {
            let roomBg = '';
            if (place.photos && place.photos.length > 0) {
                const photoIndex = (index + 2) % Math.min(place.photos.length, 5);
                const photoUrl = place.photos[photoIndex].getUrl({ maxWidth: 400, maxHeight: 300 });
                roomBg = `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${photoUrl}'); background-size: cover; background-position: center;`;
            } else {
                roomBg = 'background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);';
            }

            return `
                            <div class="room-card booked" style="${roomBg}">
                                <div class="room-header">
                                    <span class="room-number">${room.number}</span>
                                    <span class="room-price">₹${Math.floor(room.price)}</span>
                                </div>
                                <span class="room-type">${room.type} Bed</span>
                                <div class="room-action">Booked</div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.innerHTML = content;
    modal.style.display = 'block';

    // Close modal when clicking outside
    window.onclick = function (event) {
        if (event.target === modal) {
            closeBookingModal();
        }
    };
}

// Show Booking Form
function showBookingForm(hotelId, roomNumber, hotelName) {
    let modal = document.getElementById('bookingFormModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'bookingFormModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const content = `
        <div class="modal-content booking-modal-content" style="max-width: 600px;">
            <div class="booking-header">
                <h2>Complete Your Booking</h2>
                <span class="close-modal" onclick="closeBookingForm()">&times;</span>
            </div>
            
            <div class="booking-body">
                <p style="margin-bottom: 24px; color: #831843; font-size: 1.2rem; font-weight: 600;">
                    Booking <strong>Room ${roomNumber}</strong> at <strong>${hotelName}</strong>
                </p>
                
                <form id="bookingForm" onsubmit="submitBooking(event, '${hotelId}', '${roomNumber}', '${hotelName.replace(/'/g, "\\'")}')" class="booking-form">
                    <div class="form-group">
                        <label for="guestName">Full Name</label>
                        <input type="text" id="guestName" class="form-input" required placeholder="Enter your full name">
                    </div>

                    <div class="form-group">
                        <label for="guestContact">Mobile Number or Email</label>
                        <input type="text" id="guestContact" class="form-input" required placeholder="e.g., +91 9876543210">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="checkIn">Check-in Date</label>
                            <input type="date" id="checkIn" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="checkOut">Check-out Date</label>
                            <input type="date" id="checkOut" class="form-input" required>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="closeBookingForm()">Cancel</button>
                        <button type="submit" class="btn-confirm">Confirm Booking</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    modal.innerHTML = content;
    modal.style.display = 'block';

    // Set min date for check-in to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').min = today;

    // Update check-out min date when check-in changes
    document.getElementById('checkIn').addEventListener('change', function () {
        document.getElementById('checkOut').min = this.value;
    });
}

function closeBookingForm() {
    const modal = document.getElementById('bookingFormModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Submit Booking
function submitBooking(event, hotelId, roomNumber, hotelName) {
    event.preventDefault();

    const name = document.getElementById('guestName').value;
    const contact = document.getElementById('guestContact').value;
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;

    if (new Date(checkOut) <= new Date(checkIn)) {
        alert('Check-out date must be after check-in date');
        return;
    }

    const bookingDetails = {
        guestName: name,
        contact: contact,
        checkIn: checkIn,
        checkOut: checkOut,
        bookedAt: new Date().toISOString()
    };

    const success = RoomManager.bookRoom(hotelId, roomNumber, bookingDetails);

    if (success) {
        closeBookingForm();
        // Show success message
        const confirmation = document.createElement('div');
        confirmation.className = 'booking-confirmation';
        confirmation.innerHTML = `
            <span>✅</span>
            <div>
                <strong>Booking Confirmed!</strong>
                <div>Room ${roomNumber} booked for ${name}</div>
            </div>
        `;
        document.body.appendChild(confirmation);

        setTimeout(() => {
            confirmation.remove();
        }, 3000);

        // Refresh the booking interface
        const place = { place_id: hotelId, name: hotelName, photos: [] }; // Mock photos required by function but optional
        showBookingInterface(place);
    } else {
        alert('Sorry, this room is no longer available.');
    }
}

// Handle Room Booking (Updated to show form)
function handleRoomBooking(hotelId, roomNumber, hotelName) {
    showBookingForm(hotelId, roomNumber, hotelName);
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
