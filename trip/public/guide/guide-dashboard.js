// Mock Data (Same as script.js)
const guides = [
    {
        id: 1,
        name: "Arun Kumar",
        phone: "919876543210"
    },
    {
        id: 2,
        name: "Priya Sharma",
        phone: "919876543211"
    },
    {
        id: 3,
        name: "Ravi Menon",
        phone: "919876543212"
    },
    {
        id: 4,
        name: "Lakshmi Narayanan",
        phone: "919876543213"
    },
    {
        id: 5,
        name: "David John",
        phone: "919876543214"
    },
    {
        id: 6,
        name: "Meera Reddy",
        phone: "919876543215"
    }
];

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const guidePhoneInput = document.getElementById('guidePhone');
const loginError = document.getElementById('loginError');
const guideNameDisplay = document.getElementById('guideNameDisplay');
const bookingsList = document.getElementById('bookingsList');
const logoutBtn = document.getElementById('logoutBtn');

// Check if already logged in
const loggedInGuide = JSON.parse(localStorage.getItem('loggedInGuide'));
if (loggedInGuide) {
    showDashboard(loggedInGuide);
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = guidePhoneInput.value.trim();

    const guide = guides.find(g => g.phone === phone);

    if (guide) {
        // Login Success
        localStorage.setItem('loggedInGuide', JSON.stringify(guide));
        showDashboard(guide);
        loginError.classList.add('hidden');
        loginForm.reset();
    } else {
        // Login Failed
        loginError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInGuide');
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

function showDashboard(guide) {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    guideNameDisplay.textContent = `Welcome, ${guide.name}`;
    renderBookings(guide.id);
}

function renderBookings(guideId) {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    console.log('All Bookings:', allBookings); // Debug Log
    const guideBookings = allBookings.filter(b => b.guideId === guideId);
    console.log('Guide Bookings for ID ' + guideId + ':', guideBookings); // Debug Log

    bookingsList.innerHTML = '';

    if (guideBookings.length === 0) {
        bookingsList.innerHTML = `
            <div style="text-align: center; color: var(--text-light); padding: 2rem;">
                <i class="fa-regular fa-calendar-xmark" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No bookings found for you yet.</p>
            </div>
        `;
        return;
    }

    // Sort by most recent (assuming id is timestamp)
    guideBookings.sort((a, b) => b.id - a.id);

    guideBookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <div class="booking-info">
                <h4>${booking.userName}</h4>
                <div class="booking-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${booking.date}</span>
                    <span><i class="fa-regular fa-clock"></i> ${booking.time}</span>
                    <span><i class="fa-solid fa-user-group"></i> ${booking.guests} Guests</span>
                </div>
            </div>
            <div class="booking-contact">
                <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.25rem;">Contact</p>
                <a href="tel:${booking.userContact}"><i class="fa-solid fa-phone"></i> ${booking.userContact}</a>
            </div>
        `;
        bookingsList.appendChild(card);
    });
}
