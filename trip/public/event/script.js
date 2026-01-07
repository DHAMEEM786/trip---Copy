// DOM Elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-search');
const gallery = document.getElementById('gallery');
const cityNameDisplay = document.getElementById('city-name');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const modal = document.getElementById('event-modal');
const closeModal = document.querySelector('.close-modal');
const filterBtns = document.querySelectorAll('.filter-btn');

// State
let currentCity = 'Tamil Nadu'; // Default
let currentCategory = 'all';
let placesService;

// Initialize
function initService() {
    placesService = new google.maps.places.PlacesService(document.createElement('div'));
}

// Event Listeners
searchBtn.addEventListener('click', () => handleSearch());
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update Active State
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update Query
        currentCategory = btn.dataset.category;
        if (cityInput.value.trim() !== '') {
            handleSearch();
        } else {
            // If no city entered, maybe suggest one or just do nothing? 
            // For now, let's just focus on when a city is present.
            // Or trigger search with currentCity if it was set.
            if (currentCity !== 'Tamil Nadu') handleSearch();
        }
    });
});

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;
    currentCity = city;

    // UI Updates
    cityNameDisplay.textContent = city;
    gallery.innerHTML = '';
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');

    if (!placesService) initService();

    try {
        let query = '';
        switch (currentCategory) {
            case 'festival': query = `festivals in ${city}`; break;
            case 'music': query = `music venues and concerts in ${city}`; break;
            case 'culture': query = `cultural centers and museums in ${city}`; break;
            case 'nightlife': query = `nightlife and clubs in ${city}`; break;
            default: query = `tourist attractions in ${city}`; break;
        }

        const places = await fetchPlaces(query);

        if (places.length === 0) {
            showError(`No ${currentCategory !== 'all' ? currentCategory : ''} events found in "${city}". Try another category.`);
        } else {
            renderGallery(places);
        }

    } catch (error) {
        console.error(error);
        showError('Something went wrong. Please try again.');
    } finally {
        loading.classList.add('hidden');
    }
}

function fetchPlaces(query) {
    return new Promise((resolve, reject) => {
        const request = {
            query: query,
            fields: ['name', 'photos', 'rating', 'formatted_address', 'place_id', 'types']
        };

        placesService.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                resolve([]);
            } else {
                resolve([]);
            }
        });
    });
}

function renderGallery(places) {
    gallery.innerHTML = '';

    // Staggered Animation Delay
    let delay = 0;

    places.forEach((place, index) => {
        let photoUrl;
        if (place.photos && place.photos.length > 0) {
            photoUrl = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
        } else {
            photoUrl = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000'; // Fallback
        }

        const rating = place.rating ? `<i class="fa-solid fa-star"></i> ${place.rating}` : '';
        const type = place.types ? place.types[0].replace(/_/g, ' ') : 'Event';

        const card = document.createElement('div');
        card.className = 'card';
        card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
        card.style.opacity = '0'; // Start hidden for animation

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${photoUrl}" alt="${place.name}" class="card-image">
                <div class="card-overlay">${type}</div>
            </div>
            <div class="card-content">
                <div>
                    <h3 class="card-title">${place.name}</h3>
                    <div class="card-meta">
                        <span class="card-rating">${rating}</span>
                    </div>
                </div>
                <!-- Optional: Add a button or small link here if needed -->
            </div>
        `;

        card.addEventListener('click', () => showDetails(place, photoUrl));
        gallery.appendChild(card);
    });
}

function showDetails(place, photoUrl) {
    document.getElementById('modal-image').src = photoUrl;
    document.getElementById('modal-title').textContent = place.name;

    // Rating
    const ratingEl = document.getElementById('modal-rating');
    if (place.rating) {
        ratingEl.innerHTML = `<i class="fa-solid fa-star"></i> ${place.rating}`;
        ratingEl.style.display = 'flex';
    } else {
        ratingEl.style.display = 'none';
    }

    // Category
    const type = place.types ? place.types[0].replace(/_/g, ' ') : 'Event';
    document.getElementById('modal-category').innerHTML = `<i class="fa-solid fa-tag"></i> ${type}`;

    document.getElementById('modal-address').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${place.formatted_address}`;
    document.getElementById('modal-description').textContent = "Experience the magic of this destination. Perfect for travelers seeking culture, excitement, and unforgettable memories.";

    const mapsLink = document.getElementById('maps-link');
    mapsLink.href = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;

    // Tags
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = '';
    if (place.types) {
        place.types.slice(0, 4).forEach(t => {
            const tag = document.createElement('span');
            tag.className = 'tag'; // You might need to add styling for .tag in CSS if I missed it, checking css... 
            // I removed .tag from CSS, let's fix that or rely on simple span.
            // Actually, I removed .tag styling in the rewrite. Let's add inline style or just simple text.
            // Better: Add semantic styling in JS or trust generic styling. 
            // I'll stick to a simple badge style if missing, but I should probably check CSS.
            // In my CSS rewrite I didn't explicitly include .tag. I'll rely on modal-meta for main info.
            // Let's skip tags in modal for now to keep it clean, the filtered category is enough.
        });
    }

    modal.classList.add('active');
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}

// Add keyframe for animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;
document.head.appendChild(styleSheet);
