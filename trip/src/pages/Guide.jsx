import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle, usePageStyle } from '../hooks';

const Guide = () => {
    const { t } = useTranslation();
    usePageTitle('Travel Guide Booking | TN Verse');
    usePageStyle('/guide/style.css');

    const [searchTerm, setSearchTerm] = useState('');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [currentGuide, setCurrentGuide] = useState(null);
    const [confirmationData, setConfirmationData] = useState(null);
    const canvasRef = useRef(null);

    // Particle Background System
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
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.fillStyle = 'rgba(255, 132, 0, 0.6)';
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

                // Draw lines
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.strokeStyle = `rgba(255, 132, 0, ${0.12 - distance / 1250})`;
                        ctx.lineWidth = 0.8;
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

    // Form state
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingGuests, setBookingGuests] = useState(1);
    const [bookingName, setBookingName] = useState('');
    const [bookingContact, setBookingContact] = useState('');

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
            phone: "919876543210",
            specialty: "Historical Sites"
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
            phone: "919876543211",
            specialty: "Cultural Heritage"
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
            phone: "919876543212",
            specialty: "Nature & Trekking"
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
            phone: "919876543213",
            specialty: "Local Markets"
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
            phone: "919876543214",
            specialty: "Urban Exploration"
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
            phone: "919876543215",
            specialty: "Wildlife Photography"
        }
    ];

    const filteredGuides = guides.filter(guide =>
        guide.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openBookingModal = (guide) => {
        setCurrentGuide(guide);
        setIsBookingModalOpen(true);
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        const booking = {
            guideName: currentGuide.name,
            date: bookingDate,
            time: bookingTime,
            guests: bookingGuests,
            userName: bookingName
        };
        setIsBookingModalOpen(false);
        setConfirmationData(booking);
        setIsConfirmationModalOpen(true);
        // Reset form
        setBookingDate('');
        setBookingTime('');
        setBookingGuests(1);
        setBookingName('');
        setBookingContact('');
    }

    const initiateCall = (name) => {
        alert(`Connecting to ${name}...`);
    };

    return (
        <div className="guide-page-wrapper">
            <Navbar />
            <canvas ref={canvasRef} id="particleCanvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}></canvas>

            <div className="guide-hero">
                <div className="hero-content">
                    <h1>{t('guide.title')} <br /></h1>
                    <p className="subtitle">{t('guide.subtitle')}</p>
                    <div className="hero-cta-group">
                        <Link to="/guide-registration" className="btn-hero-secondary">{t('guide.join_as_guide')}</Link>
                    </div>
                </div>
            </div>

            <main className="container main-content">
                <div className="search-overlay-section">
                    <div className="search-bar-modern">
                        <i className="fa-solid fa-location-dot"></i>
                        <input
                            type="text"
                            placeholder={t('guide.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-btn-premium">{t('common.search')}</button>
                    </div>
                </div>

                <section className="guides-section">
                    <div className="section-header">
                        <h2>{t('guide.top_rated')}</h2>
                        <div className="dashboard-link">
                            {t('guide.are_you_guide')} <Link to="/guide-registration">{t('guide.register_now')}</Link>
                        </div>
                    </div>

                    <div id="guidesContainer" className="guides-grid">
                        {filteredGuides.length > 0 ? (
                            filteredGuides.map(guide => (
                                <div key={guide.id} className="guide-card">
                                    <Link to={`/guide/${guide.id}`} className="card-link-wrapper">
                                        <div className="guide-img-wrapper">
                                            <img src={guide.image} alt={guide.name} className="guide-img" />
                                            <div className="guide-price-tag">{guide.price}</div>
                                        </div>
                                        <div className="guide-info-premium">
                                            <div className="guide-header-row">
                                                <h3 className="guide-name">{guide.name}</h3>
                                                <div className="guide-rating-badge">
                                                    <i className="fa-solid fa-star"></i>
                                                    <span>{guide.rating}</span>
                                                </div>
                                            </div>
                                            <div className="guide-location-row">
                                                <i className="fa-solid fa-location-dot"></i>
                                                <span>{guide.location}</span>
                                            </div>
                                            <div className="guide-specialty">
                                                <span className="specialty-label">Expertise:</span> {guide.specialty}
                                            </div>
                                            <div className="guide-languages">
                                                {guide.languages.map(lang => <span key={lang} className="lang-tag">{lang}</span>)}
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="guide-info-premium" style={{ paddingTop: 0 }}>
                                        <div className="guide-actions-premium">
                                            <a href={`https://wa.me/${guide.phone}`} target="_blank" rel="noreferrer" className="btn-action-outline whatsapp">
                                                <i className="fa-brands fa-whatsapp"></i> Chat
                                            </a>
                                            <button className="btn-action-outline call" onClick={() => initiateCall(guide.name)}>
                                                <i className="fa-solid fa-phone"></i> Call
                                            </button>
                                        </div>
                                        <Link to={`/guide/${guide.id}`} className="btn-book-premium" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                            {t('guide.view_profile')}
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-guides">
                                <i className="fa-solid fa-user-slash"></i>
                                <p>No guides match your search criteria.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Booking Modal */}
                {isBookingModalOpen && currentGuide && (
                    <div id="bookingModal" className="modal-overlay-premium" onClick={(e) => { if (e.target.id === 'bookingModal') setIsBookingModalOpen(false) }}>
                        <div className="modal-content-premium">
                            <div className="modal-header-premium">
                                <h2>{t('guide.reserve_title')}</h2>
                                <span className="close-btn" onClick={() => setIsBookingModalOpen(false)}>&times;</span>
                            </div>
                            <div className="modal-body-premium">
                                <div className="guide-summary-small">
                                    <img src={currentGuide.image} alt={currentGuide.name} />
                                    <div>
                                        <h4>{currentGuide.name}</h4>
                                        <p>{currentGuide.location} • {currentGuide.price}</p>
                                    </div>
                                </div>
                                <form id="bookingForm" className="booking-form-modern" onSubmit={handleBookingSubmit}>
                                    <div className="form-row-modern">
                                        <div className="form-group-modern">
                                            <label>Preferred Date</label>
                                            <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Time Slot</label>
                                            <select required value={bookingTime} onChange={(e) => setBookingTime(e.target.value)}>
                                                <option value="">Select a slot</option>
                                                <option value="Morning (9AM - 1PM)">Morning (9AM - 1PM)</option>
                                                <option value="Afternoon (2PM - 6PM)">Afternoon (2PM - 6PM)</option>
                                                <option value="Full Day (9AM - 6PM)">Full Day (9AM - 6PM)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Number of Guests</label>
                                        <input type="number" min="1" max="20" required value={bookingGuests} onChange={(e) => setBookingGuests(e.target.value)} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Full Name</label>
                                        <input type="text" placeholder="Your name" required value={bookingName} onChange={(e) => setBookingName(e.target.value)} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Mobile Number</label>
                                        <input type="tel" placeholder="Your mobile number" required value={bookingContact} onChange={(e) => setBookingContact(e.target.value)} />
                                    </div>
                                    <div className="form-actions-premium">
                                        <button type="submit" className="confirm-booking-btn">Confirm Reservation</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {isConfirmationModalOpen && confirmationData && (
                    <div id="confirmationModal" className="modal-overlay-premium" onClick={() => setIsConfirmationModalOpen(false)}>
                        <div className="modal-content-premium success-modal">
                            <div className="success-lottie">
                                <i className="fa-solid fa-circle-check"></i>
                            </div>
                            <h2>Booking Confirmed!</h2>
                            <p className="success-text">Your local expert is ready for you.</p>
                            <div className="booking-details-box">
                                <div className="detail-item"><strong>Expert:</strong> {confirmationData.guideName}</div>
                                <div className="detail-item"><strong>Date:</strong> {confirmationData.date}</div>
                                <div className="detail-item"><strong>Slot:</strong> {confirmationData.time}</div>
                                <div className="detail-item"><strong>Guests:</strong> {confirmationData.guests}</div>
                            </div>
                            <button className="btn-close-success" onClick={() => setIsConfirmationModalOpen(false)}>Back to Guides</button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}

export default Guide;
