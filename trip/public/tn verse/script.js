// ===== Navbar & Panel JS =====
const MAIN = [
  { label: 'Home', icon: 'fa-house', href: '#' },
  { label: 'Plan Trip', icon: 'fa-route', href: './ai api/index.html' },
  { label: 'Experience', icon: 'fa-compass', href: '#Experience' },
  { label: 'Where to Go', icon: 'fa-map-marker-alt', href: '#' }
];
const EXTRA = [
  { label: 'Hotel Booking', icon: 'fa-hotel', href: './booking/index.html' },
  { label: 'Guide', icon: 'fa-user-tie', href: './guide/index.html' },
  { label: 'Event', icon: 'fa-calendar-days', href: './event/index.html' }
];
const hamburgerBtn = document.getElementById('hamburgerBtn');
const panel = document.getElementById('navPanel');
const navbar = document.getElementById('siteNavbar');

function buildPanel() {
  let html = '';
  if (window.innerWidth >= 768) {
    html += '<div class="section-title">Extras</div>';
    EXTRA.forEach(it => { html += `<a href="${it.href}"><i class="fa-solid ${it.icon}"></i>${it.label}</a>`; });
  } else {
    html += '<div class="section-title">Menu</div>';
    MAIN.forEach(it => { html += `<a href="${it.href}"><i class="fa-solid ${it.icon}"></i>${it.label}</a>`; });
    html += '<div class="section-title">Extras</div>';
    EXTRA.forEach(it => { html += `<a href="${it.href}"><i class="fa-solid ${it.icon}"></i>${it.label}</a>`; });
  }
  return html;
}

function updatePanelContents() { panel.innerHTML = buildPanel(); }
function openPanel() { updatePanelContents(); panel.classList.add('open'); hamburgerBtn.classList.add('open'); hamburgerBtn.setAttribute('aria-expanded', 'true'); panel.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden'; }
function closePanel() { panel.classList.remove('open'); hamburgerBtn.classList.remove('open'); hamburgerBtn.setAttribute('aria-expanded', 'false'); panel.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = ''; }

hamburgerBtn.addEventListener('click', () => { panel.classList.contains('open') ? closePanel() : openPanel(); });
document.addEventListener('click', (e) => { if (!panel.classList.contains('open')) return; if (!panel.contains(e.target) && !hamburgerBtn.contains(e.target)) closePanel(); });
window.addEventListener('resize', () => { if (panel.classList.contains('open')) updatePanelContents(); });
window.addEventListener('scroll', () => { if (window.scrollY > 50) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled'); });

// ===== Instagram Feed JS =====
const places = ['Marina Beach, Chennai', 'Meenakshi Amman Temple, Madurai', 'Valparai Tea Estate, Tamil Nadu', 'Ooty Botanical Gardens', 'Coimbatore City Center', 'Hogenakkal Falls, Tamil Nadu'];
const gallery = document.getElementById('gallery');
let modal = document.getElementById('modal');
let modalImg = document.getElementById('modalImg');
let currentImages = [], currentIndex = 0;

function initMap() {
  const service = new google.maps.places.PlacesService(document.createElement('div'));
  places.forEach(placeName => {
    const request = { query: placeName, fields: ['name', 'formatted_address', 'geometry', 'photos', 'rating', 'user_ratings_total', 'types'] };
    service.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const place = results[0];
        const photos = place.photos ? place.photos.map(p => p.getUrl({ maxWidth: 400 })) : ['https://via.placeholder.com/400x300?text=No+Image'];
        const rating = Math.round(place.rating || 0);
        const commentsCount = place.user_ratings_total || 0;
        const location = place.formatted_address || 'Unknown location';
        const types = place.types || [];
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-carousel">
            <img src="${photos[0]}" alt="${place.name}">
          </div>
          <div class="card-body">
            <div class="card-title">${place.name}</div>
            <div class="card-location" data-lat="${place.geometry.location.lat()}" data-lng="${place.geometry.location.lng()}">📍 ${location}</div>
            <div class="tags">${types.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}</div>
            <div class="card-desc">Popular destination in Tamil Nadu.</div>
            <div class="card-stats"><span class="heart">❤ ${Math.floor(Math.random() * 1500 + 500)}</span><span>${commentsCount} comments</span></div>
            <div class="stars">${[1, 2, 3, 4, 5].map(i => `<span class="star ${i > rating ? 'inactive' : ''}" data-star="${i}">★</span>`).join('')}</div>
          </div>
        `;
        let imgIndex = 0;
        const imgElement = card.querySelector('.card-carousel img');
        card.addEventListener('click', () => { currentImages = photos; currentIndex = imgIndex; modalImg.src = currentImages[currentIndex]; modal.style.display = 'flex'; });
        const heart = card.querySelector('.heart'); let liked = false;
        heart.addEventListener('click', (e) => { e.stopPropagation(); liked = !liked; let count = liked ? parseInt(heart.textContent.replace(/\D/g, '')) + 1 : parseInt(heart.textContent.replace(/\D/g, '')) - 1; heart.textContent = `❤ ${count}`; });
        const stars = card.querySelectorAll('.star');
        stars.forEach(star => { star.addEventListener('click', (e) => { e.stopPropagation(); const newRating = parseInt(star.getAttribute('data-star')); stars.forEach((s, i) => { s.classList.toggle('inactive', i >= newRating); }); }); });
        const locationDiv = card.querySelector('.card-location');
        locationDiv.addEventListener('click', (e) => { e.stopPropagation(); if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(pos => { const userLat = pos.coords.latitude; const userLng = pos.coords.longitude; const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${place.geometry.location.lat()},${place.geometry.location.lng()}`; window.open(mapsUrl, '_blank'); }, () => { alert('Geolocation not allowed'); }); } else { alert('Geolocation not supported'); } });
        gallery.appendChild(card);
      }
    });
  });
}

document.getElementById('modalClose').addEventListener('click', () => { modal.style.display = 'none'; });
document.getElementById('modalPrev').addEventListener('click', () => { currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length; modalImg.src = currentImages[currentIndex]; });
document.getElementById('modalNext').addEventListener('click', () => { currentIndex = (currentIndex + 1) % currentImages.length; modalImg.src = currentImages[currentIndex]; });
modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });




// Scroll Animation for Tamil Nadu Section
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('.tn-header, .tn-card');
  targets.forEach((target, index) => {
    target.classList.add('fade-in-section');
    // Add slight delay for staggered effect on cards
    if (target.classList.contains('tn-card')) {
      // Reset index for each section roughly by checking offset or just mod
      target.style.transitionDelay = `${(index % 3) * 100}ms`;
    }
    observer.observe(target);
  });
});
