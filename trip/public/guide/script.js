// Mock Data for Guides
const guides = [
    {
        id: 1,
        name: "Arun Kumar",
        location: "Salem",
        rating: 4.8,
        reviews: 120,
        languages: ["English", "Tamil"],
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "₹500/hr",
        phone: "919876543210" // Mock phone number
    },
    {
        id: 2,
        name: "Priya Sharma",
        location: "Chennai",
        rating: 4.9,
        reviews: 215,
        languages: ["English", "Hindi", "Tamil"],
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "₹800/hr",
        phone: "919876543211"
    },
    {
        id: 3,
        name: "Ravi Menon",
        location: "Munnar",
        rating: 4.7,
        reviews: 95,
        languages: ["English", "Malayalam"],
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "₹600/hr",
        phone: "919876543212"
    },
    {
        id: 4,
        name: "Lakshmi Narayanan",
        location: "Salem",
        rating: 4.6,
        reviews: 80,
        languages: ["Tamil", "Telugu"],
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "₹450/hr",
        phone: "919876543213"
    },
    {
        id: 5,
        name: "David John",
        location: "Chennai",
        rating: 4.5,
        reviews: 150,
        languages: ["English", "Tamil"],
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "₹700/hr",
        phone: "919876543214"
    },
    {
        id: 6,
        name: "Anjali Nair",
        location: "Munnar",
        rating: 4.9,
        reviews: 180,
        languages: ["English", "Malayalam", "Tamil"],
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "₹750/hr",
        phone: "919876543215"
    }
];

// DOM Elements
const guidesContainer = document.getElementById('guidesContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const bookingModal = document.getElementById('bookingModal');
const confirmationModal = document.getElementById('confirmationModal');
const closeModalBtn = document.querySelector('.close-modal');
const closeConfirmationBtn = document.getElementById('closeConfirmationBtn');
const bookingForm = document.getElementById('bookingForm');
const bookingGuideInfo = document.getElementById('bookingGuideInfo');
const confirmationDetails = document.getElementById('confirmationDetails');

// Initial Render
renderGuides(guides);

// Search Functionality
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderGuides(guides);
        return;
    }

    const filteredGuides = guides.filter(guide =>
        guide.location.toLowerCase().includes(query) ||
        guide.name.toLowerCase().includes(query)
    );
    renderGuides(filteredGuides);
}

// Render Guides
function renderGuides(guidesData) {
    guidesContainer.innerHTML = '';

    if (guidesData.length === 0) {
        guidesContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #6b7280;">No guides found for this location.</p>';
        return;
    }

    guidesData.forEach(guide => {
        const card = document.createElement('div');
        card.className = 'guide-card';
        // WhatsApp Link Construction
        const waLink = `https://wa.me/${guide.phone}?text=Hi ${guide.name}, I found your profile on GuideConnect and would like to know more about your services.`;

        card.innerHTML = `
            <img src="${guide.image}" alt="${guide.name}" class="guide-img">
            <div class="guide-info">
                <div class="guide-header">
                    <h3 class="guide-name">${guide.name}</h3>
                    <div class="guide-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${guide.rating}</span>
                    </div>
                </div>
                <div class="guide-location">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${guide.location}</span>
                </div>
                <div class="guide-tags">
                    ${guide.languages.map(lang => `<span class="tag">${lang}</span>`).join('')}
                </div>
                <div class="guide-actions">
                    <a href="${waLink}" target="_blank" class="btn-message" style="text-decoration: none;">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </a>
                    <button class="btn-call" onclick="initiateCall('${guide.name}')">
                        <i class="fa-solid fa-phone"></i> Call
                    </button>
                </div>
                <button class="btn-book" onclick="openBookingModal(${guide.id})">
                    <i class="fa-solid fa-calendar-check"></i> Book Now
                </button>
            </div>
        `;
        guidesContainer.appendChild(card);
    });
}

// Call Functionality
window.initiateCall = function (name) {
    alert(`Calling ${name}... (This is a demo feature)`);
};

// Booking Functionality
let currentGuide = null;

window.openBookingModal = function (guideId) {
    currentGuide = guides.find(g => g.id === guideId);
    if (!currentGuide) return;

    // Populate Guide Info in Modal
    bookingGuideInfo.innerHTML = `
        <img src="${currentGuide.image}" alt="${currentGuide.name}" class="booking-guide-img">
        <div class="booking-guide-details">
            <h3>${currentGuide.name}</h3>
            <p>${currentGuide.location} • ${currentGuide.price}</p>
        </div>
    `;

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;

    bookingModal.classList.remove('hidden');
};

// Close Modals
closeModalBtn.addEventListener('click', () => {
    bookingModal.classList.add('hidden');
});

document.getElementById('cancelBookingBtn').addEventListener('click', () => {
    bookingModal.classList.add('hidden');
});

closeConfirmationBtn.addEventListener('click', () => {
    confirmationModal.classList.add('hidden');
});

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.classList.add('hidden');
    }
    if (e.target === confirmationModal) {
        confirmationModal.classList.add('hidden');
    }
});

// Handle Booking Submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentGuide) return;

    // Get Form Values
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const guests = document.getElementById('bookingGuests').value;
    const name = document.getElementById('bookingName').value;
    const contact = document.getElementById('bookingContact').value;

    // Simulate API Call / Storage
    const booking = {
        id: Date.now(),
        guideId: currentGuide.id,
        guideName: currentGuide.name,
        date,
        time,
        guests,
        userName: name,
        userContact: contact,
        status: 'confirmed'
    };

    // Store in localStorage (for demo)
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Show Confirmation
    bookingModal.classList.add('hidden');
    showConfirmation(booking);

    // Reset Form
    bookingForm.reset();
});

function showConfirmation(booking) {
    confirmationDetails.innerHTML = `
        <p><strong>Guide:</strong> ${booking.guideName}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Name:</strong> ${booking.userName}</p>
    `;
    confirmationModal.classList.remove('hidden');
}
