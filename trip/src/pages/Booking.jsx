import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle, usePageStyle } from '../hooks';

const Booking = () => {
    usePageTitle('Hotel Booking - Tamil Nadu | Premium Hotel Search');
    usePageStyle('/booking/style.css');
    usePageStyle('/booking/colorful.css');

    const [searchInput, setSearchInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    const [radius, setRadius] = useState(10000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locationInfo, setLocationInfo] = useState(null);
    const [results, setResults] = useState([]);

    // Modal States
    const [hotelDetailsModal, setHotelDetailsModal] = useState(null);
    const [bookingModal, setBookingModal] = useState(null); // { placeId, name, rooms }
    const [bookingFormModal, setBookingFormModal] = useState(null); // { hotelId, roomNumber, hotelName }

    const placesService = useRef(null);
    const geocoder = useRef(null);
    const canvasRef = useRef(null);

    // Initialize Maps
    useEffect(() => {
        const initGoogleMaps = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                const mapElement = document.createElement('div');
                const map = new window.google.maps.Map(mapElement, {
                    center: { lat: 10.7905, lng: 78.7047 }, // Tamil Nadu center
                    zoom: 7
                });
                placesService.current = new window.google.maps.places.PlacesService(map);
                geocoder.current = new window.google.maps.Geocoder();
                console.log('Google Maps API initialized successfully');
            }
        };

        if (window.google && window.google.maps) {
            initGoogleMaps();
        } else {
            const interval = setInterval(() => {
                if (window.google && window.google.maps) {
                    initGoogleMaps();
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, []);

    // Canvas Particles
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        const particleCount = 40;
        let animationFrameId;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.fillStyle = 'rgba(255, 140, 0, 0.6)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(255, 140, 0, ${0.1 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animateParticles);
        };

        initParticles();
        animateParticles();
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Cursor Glow
    useEffect(() => {
        const handleMouseMove = (e) => {
            const glow = document.querySelector('.cursor-glow');
            if (glow) {
                glow.style.left = e.clientX + 'px';
                glow.style.top = e.clientY + 'px';
                glow.style.opacity = '1';
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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

    const formatAddressForTamilNadu = (address) => {
        const trimmedAddress = address.trim();
        if (TAMIL_NADU_CITIES[trimmedAddress]) return TAMIL_NADU_CITIES[trimmedAddress];
        if (trimmedAddress.toLowerCase().includes('tamil nadu') || trimmedAddress.toLowerCase().includes('india')) return trimmedAddress;
        // Search keys
        const foundKey = Object.keys(TAMIL_NADU_CITIES).find(k => k.toLowerCase() === trimmedAddress.toLowerCase());
        if (foundKey) return TAMIL_NADU_CITIES[foundKey];
        // Partial match
        const foundPartial = Object.keys(TAMIL_NADU_CITIES).find(k => trimmedAddress.toLowerCase().includes(k.toLowerCase()));
        if (foundPartial) return TAMIL_NADU_CITIES[foundPartial];

        return trimmedAddress + ', Tamil Nadu, India';
    };

    const geocodeLocation = (address) => {
        return new Promise((resolve, reject) => {
            if (!geocoder.current) {
                reject('Geocoder not initialized');
                return;
            }
            const formattedAddress = formatAddressForTamilNadu(address);

            geocoder.current.geocode({
                address: formattedAddress,
                region: 'IN'
            }, (results, status) => {
                const processResult = (res) => {
                    resolve({
                        lat: res.geometry.location.lat(),
                        lng: res.geometry.location.lng(),
                        formattedAddress: res.formatted_address
                    });
                };

                if (status === 'OK' && results[0]) {
                    // Optimistic check
                    processResult(results[0]);
                } else {
                    // Retry with suffix
                    const retryAddress = address.trim() + ', Tamil Nadu, India';
                    geocoder.current.geocode({ address: retryAddress, region: 'IN' }, (results2, status2) => {
                        if (status2 === 'OK' && results2[0]) {
                            processResult(results2[0]);
                        } else {
                            reject('Location not found. Status: ' + status);
                        }
                    })
                }
            });
        });
    };

    const searchNearbyHotels = (location, rad, kw) => {
        return new Promise((resolve, reject) => {
            if (!placesService.current) {
                reject('Places Service not initialized');
                return;
            }
            const request = {
                location: new window.google.maps.LatLng(location.lat, location.lng),
                radius: rad,
                type: 'lodging',
                keyword: kw || 'hotel'
            };
            placesService.current.nearbySearch(request, (res, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    // We need details for each. 
                    // IMPORTANT: getDetails is rate limited and async. Doing it for all might get throttled. 
                    // For 'exact output' I should do it, but maybe batching or just one by one?
                    // The original script calls `getPlaceDetails(results)` which iterates and calls `getDetails` for ALL.
                    // This often hits query limits. I will mimic it but be aware.
                    // I will resolve with the basic results mixed with details promises?
                    // Actually, the original script does not wait for details to resolve before showing cards?
                    // It calls `getPlaceDetails` which clears container and adds cards one by one as they arrive.
                    // I will emulate this by resolving the basic list, then fetching details in `setResults`.
                    resolve(res);
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve([]);
                } else {
                    reject(status);
                }
            });
        });
    };

    const getPlaceDetails = (place) => {
        return new Promise((resolve) => {
            const request = {
                placeId: place.place_id,
                fields: ['name', 'formatted_address', 'formatted_phone_number', 'international_phone_number', 'rating', 'user_ratings_total', 'types', 'photos', 'price_level', 'geometry', 'website', 'url', 'opening_hours', 'vicinity', 'plus_code', 'editorial_summary', 'reviews', 'address_components', 'place_id', 'business_status']
            };
            placesService.current.getDetails(request, (details, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
                    resolve({ ...place, ...details });
                } else {
                    resolve(place); // Fallback to basic info
                }
            });
        });
    };

    const handleSearch = async () => {
        if (!searchInput) {
            setError('Please enter a Tamil Nadu city name to search');
            return;
        }
        setLoading(true);
        setError('');
        setResults([]);
        setLocationInfo(null);

        try {
            const location = await geocodeLocation(searchInput);
            if (!location) {
                setError('Location not found in Tamil Nadu.');
                setLoading(false);
                return;
            }
            setLocationInfo(location.formattedAddress);

            const basicResults = await searchNearbyHotels(location, radius, keywordInput);

            if (basicResults.length === 0) {
                setError('No hotels found in this area.');
            } else {
                // Fetch details for all (parallel)
                // Note: logic in original script was fire-and-forget for displayHotelCard.
                // Here we want to update state.
                const detailedResults = await Promise.all(basicResults.map(p => getPlaceDetails(p)));
                setResults(detailedResults);
            }

        } catch (e) {
            console.error(e);
            setError('Error: ' + e);
        } finally {
            setLoading(false);
        }
    };

    // Room Manager Logic
    const initRooms = (place) => {
        const key = `rooms_${place.place_id}`;
        if (!localStorage.getItem(key)) {
            const rooms = [];
            for (let f = 1; f <= 3; f++) {
                for (let r = 1; r <= 4; r++) {
                    rooms.push({
                        number: `${f}0${r}`,
                        status: Math.random() > 0.7 ? 'booked' : 'available',
                        type: r % 2 === 0 ? 'Double' : 'Single',
                        price: 1000 + Math.random() * 2000
                    });
                }
            }
            localStorage.setItem(key, JSON.stringify(rooms));
        }
        return JSON.parse(localStorage.getItem(key));
    };

    const bookRoom = (e) => {
        e.preventDefault();
        const { hotelId, roomNumber } = bookingFormModal;

        const key = `rooms_${hotelId}`;
        let rooms = JSON.parse(localStorage.getItem(key));
        const idx = rooms.findIndex(r => r.number === roomNumber);
        if (idx !== -1) {
            rooms[idx].status = 'booked';
            localStorage.setItem(key, JSON.stringify(rooms));
            alert('Booking Confirmed for Room ' + roomNumber);
            setBookingFormModal(null);
            setBookingModal(null); // Close everything
        }
    };

    return (
        <div className="booking-page-wrapper">
            <Navbar />
            <canvas ref={canvasRef} id="particleCanvas"></canvas>
            <div className="cursor-glow"></div>

            <div className="booking-hero">
                <div className="header-content">
                    <h1>Hotel Booking <br /> <span className="brand-accent">Tamil Nadu</span></h1>
                    <p className="subtitle">Discover premium hotels across Tamil Nadu with our advanced search platform</p>
                </div>
            </div>

            <div className="container main-content">

                <div className="search-section">
                    <div className="search-header">
                        <h2>Find Your Perfect Stay</h2>
                        <p>Search for hotels in any Tamil Nadu city</p>
                    </div>
                    <div className="search-box">
                        <div className="input-wrapper">
                            <input type="text" id="searchInput" placeholder="Enter city name (e.g., Salem, Chennai)" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} />
                        </div>
                        <button id="searchBtn" onClick={handleSearch}>
                            Search
                        </button>
                    </div>
                    <div className="filters">
                        <div className="filter-group">
                            <label>Filter by Keyword</label>
                            <div className="input-wrapper">
                                <input type="text" id="keywordInput" placeholder="e.g., luxury, budget" className="filter-input" value={keywordInput} onChange={e => setKeywordInput(e.target.value)} />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>Search Radius</label>
                            <select className="filter-input" value={radius} onChange={e => setRadius(parseInt(e.target.value))}>
                                <option value="5000">5 km</option>
                                <option value="10000">10 km</option>
                                <option value="20000">20 km</option>
                                <option value="50000">50 km</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading && <div id="loading" className="loading" style={{ display: 'block' }}><div className="spinner"></div><p>Searching for hotels...</p></div>}

                {error && <div id="error" className="error" style={{ display: 'block' }}>{error}</div>}

                {locationInfo && (
                    <div id="locationInfo" className="location-info" style={{ display: 'block' }}>
                        <div className="location-badge">
                            <div className="location-text">
                                <span className="location-label">Searching in</span>
                                <span className="location-name">{locationInfo}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div id="results" className="results">
                    {results.map((place) => {
                        let photoUrl = '';
                        if (place.photos && place.photos.length > 0) {
                            photoUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
                        }
                        return (
                            <div key={place.place_id} className="hotel-card">
                                {photoUrl && <img src={photoUrl} alt={place.name} />}
                                <div className="hotel-card-content">
                                    <div className="hotel-name">{place.name}</div>
                                    <div className="hotel-address">{place.formatted_address || place.vicinity}</div>
                                    {place.rating && (
                                        <div className="hotel-rating">
                                            <span className="rating-value">{place.rating.toFixed(1)} ★ {place.user_ratings_total && `(${place.user_ratings_total} reviews)`}</span>
                                        </div>
                                    )}
                                    <div className="hotel-info">
                                        <div className="price-info">{place.price_level !== undefined ? ['Free', '$', '$$', '$$$', '$$$$'][place.price_level] : 'Contact for pricing'}</div>
                                        <button className="view-details" onClick={() => setHotelDetailsModal(place)}>View Details</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {results.length === 0 && !loading && !error && <div className="no-results"></div>}
                </div>

                {/* Hotel Details Modal */}
                {hotelDetailsModal && (
                    <div id="hotelDetailsModal" className="modal" style={{ display: 'block' }} onClick={(e) => { if (e.target.id === 'hotelDetailsModal') setHotelDetailsModal(null) }}>
                        <div className="modal-content booking-modal-content">
                            <div className="booking-header">
                                <h2>{hotelDetailsModal.name}</h2>
                                <span className="close-modal" onClick={() => setHotelDetailsModal(null)}>&times;</span>
                            </div>
                            <div className="booking-body">
                                {hotelDetailsModal.photos && (
                                    <div className="booking-section"><h3>Ambiance</h3><div className="image-gallery">
                                        {hotelDetailsModal.photos.slice(0, 6).map((p, i) => (
                                            <div key={i} className="gallery-item"><img src={p.getUrl({ maxWidth: 600 })} alt="Ambiance" /></div>
                                        ))}
                                    </div></div>
                                )}
                                <div className="detail-section"><strong>📍 Address:</strong><p>{hotelDetailsModal.formatted_address || hotelDetailsModal.vicinity}</p></div>
                                {hotelDetailsModal.website && <div className="detail-section"><strong>🌐 Website:</strong><p><a href={hotelDetailsModal.website} target="_blank" rel="noreferrer">Visit Website</a></p></div>}

                                <div style={{ marginTop: 30, textAlign: 'center' }}>
                                    <button className="book-room-btn" onClick={() => {
                                        setBookingModal({
                                            placeId: hotelDetailsModal.place_id,
                                            name: hotelDetailsModal.name,
                                            rooms: initRooms(hotelDetailsModal)
                                        });
                                        setHotelDetailsModal(null);
                                    }}>Book a Room ➜</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Room Selection Modal */}
                {bookingModal && (
                    <div id="bookingModal" className="modal" style={{ display: 'block' }} onClick={(e) => { if (e.target.id === 'bookingModal') setBookingModal(null) }}>
                        <div className="modal-content booking-modal-content">
                            <div className="booking-header">
                                <h2>Book Room at {bookingModal.name}</h2>
                                <span className="close-modal" onClick={() => setBookingModal(null)}>&times;</span>
                            </div>
                            <div className="booking-body">
                                <h3>Available Rooms</h3>
                                <div className="rooms-grid">
                                    {bookingModal.rooms.filter(r => r.status === 'available').map((room) => (
                                        <div key={room.number} className="room-card available"
                                            onClick={() => {
                                                setBookingFormModal({
                                                    hotelId: bookingModal.placeId,
                                                    roomNumber: room.number,
                                                    hotelName: bookingModal.name,
                                                    price: room.price
                                                });
                                                setBookingModal(null);
                                            }}
                                        >
                                            <div className="room-info-top">
                                                <span className="room-status-tag">Available</span>
                                                <span className="room-type-tag">{room.type}</span>
                                            </div>
                                            <div className="room-number-display">Room {room.number}</div>
                                            <div className="room-price-display">₹{Math.floor(room.price)}<span>/night</span></div>
                                            <button className="book-btn-mini">Select Unit</button>
                                        </div>
                                    ))}
                                </div>
                                <h3>Commonly Booked</h3>
                                <div className="rooms-grid">
                                    {bookingModal.rooms.filter(r => r.status === 'booked').map((room) => (
                                        <div key={room.number} className="room-card booked">
                                            <div className="room-number-display">Room {room.number}</div>
                                            <div className="room-status-tag">Currently Occupied</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Form Modal */}
                {bookingFormModal && (
                    <div id="bookingFormModal" className="modal" style={{ display: 'block' }} onClick={(e) => { if (e.target.id === 'bookingFormModal') setBookingFormModal(null) }}>
                        <div className="modal-content booking-modal-content" style={{ maxWidth: 600 }}>
                            <div className="booking-header">
                                <h2>Complete Booking</h2>
                                <span className="close-modal" onClick={() => setBookingFormModal(null)}>&times;</span>
                            </div>
                            <div className="booking-body">
                                <div className="booking-summary-box">
                                    <p>Confirming <strong>Room {bookingFormModal.roomNumber}</strong> at <strong>{bookingFormModal.hotelName}</strong></p>
                                    <p className="summary-price">Rate: ₹{Math.floor(bookingFormModal.price)}/night</p>
                                </div>
                                <form onSubmit={bookRoom} className="booking-form-premium">
                                    <div className="form-group-modern">
                                        <label>Full Guest Name</label>
                                        <input type="text" placeholder="John Doe" required />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Contact Number</label>
                                        <input type="tel" placeholder="+91 98765 43210" required />
                                    </div>
                                    <div className="form-row-modern">
                                        <div className="form-group-modern">
                                            <label>Check-in Date</label>
                                            <input type="date" required />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Check-out Date</label>
                                            <input type="date" required />
                                        </div>
                                    </div>
                                    <button type="submit" className="confirm-btn-premium">Confirm Secure Booking</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Booking;
