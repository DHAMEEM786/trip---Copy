import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle, usePageStyle } from '../hooks';
import Footer from '../components/Footer';

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

const GuideDashboard = () => {
    usePageTitle('Guide Dashboard - GuideConnect');
    usePageStyle('/guide/style.css');
    usePageStyle('/guide/guide-dashboard.css');

    const [loggedInGuide, setLoggedInGuide] = useState(null);
    const [loginPhone, setLoginPhone] = useState('');
    const [loginError, setLoginError] = useState(false);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const storedGuide = JSON.parse(localStorage.getItem('loggedInGuide'));
        if (storedGuide) {
            setLoggedInGuide(storedGuide);
            loadBookings(storedGuide.id);
        }
    }, []);

    const loadBookings = (guideId) => {
        const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const guideBookings = allBookings.filter(b => b.guideId === guideId);
        // Sort by id (assuming id is timestamp or incremental)
        guideBookings.sort((a, b) => b.id - a.id);
        setBookings(guideBookings);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const phone = loginPhone.trim();
        const guide = guides.find(g => g.phone === phone);

        if (guide) {
            localStorage.setItem('loggedInGuide', JSON.stringify(guide));
            setLoggedInGuide(guide);
            loadBookings(guide.id);
            setLoginError(false);
            setLoginPhone('');
        } else {
            setLoginError(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInGuide');
        setLoggedInGuide(null);
        setBookings([]);
    };

    return (
        <div className="dashboard-container">
            {!loggedInGuide ? (
                // Login Section
                <div id="loginSection" className="login-section">
                    <h2>Guide Login</h2>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                        Enter your registered phone number to view bookings.
                    </p>
                    <form id="loginForm" onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="tel"
                                id="guidePhone"
                                placeholder="Enter Phone Number (e.g., 919876543210)"
                                required
                                value={loginPhone}
                                onChange={(e) => setLoginPhone(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary btn-block">View Bookings</button>
                    </form>
                    <div className="registration-cta" style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Not registered as a guide yet?</p>
                        <Link to="/guide-registration" className="btn-secondary" style={{ display: 'inline-block', textDecoration: 'none', color: '#ff8c00', fontWeight: '700' }}>Join as a Guide</Link>
                    </div>
                    {loginError && (
                        <p id="loginError" style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem' }}>
                            Guide not found. Please check the number.
                        </p>
                    )}
                </div>
            ) : (
                // Dashboard Section
                <div id="dashboardSection">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 id="guideNameDisplay">Welcome, {loggedInGuide.name}</h2>
                        <button
                            id="logoutBtn"
                            className="btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>

                    <div id="bookingsList">
                        {bookings.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                                <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                                <p>No bookings found for you yet.</p>
                            </div>
                        ) : (
                            bookings.map(booking => (
                                <div key={booking.id} className="booking-card">
                                    <div className="booking-info">
                                        <h4>{booking.userName}</h4>
                                        <div className="booking-meta">
                                            <span><i className="fa-regular fa-calendar"></i> {booking.date}</span>
                                            <span><i className="fa-regular fa-clock"></i> {booking.time}</span>
                                            <span><i className="fa-solid fa-user-group"></i> {booking.guests} Guests</span>
                                        </div>
                                    </div>
                                    <div className="booking-contact">
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>Contact</p>
                                        <a href={`tel:${booking.userContact}`}><i className="fa-solid fa-phone"></i> {booking.userContact}</a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default GuideDashboard;
