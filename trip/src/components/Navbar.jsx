import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTripContext } from '../context/TripContext';
import '../assets/css/style.css'; // Importing global styles

import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { isDarkMode, toggleTheme } = useTripContext();
    const [scrolled, setScrolled] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let unsubscribeProfile = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            // Clean up previous profile listener if it exists
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            if (currentUser) {
                // Set up real-time listener for the user's profile
                unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
                    if (snapshot.exists()) {
                        setProfile(snapshot.data());
                    }
                });
            } else {
                setProfile(null);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            closeSidebar();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'ml', name: 'മലയാളം' },
        { code: 'kn', name: 'ಕನ್ನಡ' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'te', name: 'తెలుగు' }
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        document.body.style.overflow = !sidebarOpen ? 'hidden' : 'auto';
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        document.body.style.overflow = 'auto';
    };

    return (
        <>
            <header className={`tn-navbar ${scrolled ? 'scrolled' : ''}`} id="siteNavbar">
                <div className="tn-nav-inner">
                    <div className="tn-nav-brand" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        <span className="brand-tn" style={{ color: '#800020' }}>TN</span><span className="brand-verse">verse</span>
                    </div>
                    <ul className="tn-nav-menu">
                        <li><Link className="tn-nav-link" to="/home"><i className="fa-solid fa-house"></i>{t('navbar.home')}</Link></li>
                        <li><Link className="tn-nav-link" to="/plan-trip"><i className="fa-solid fa-route"></i>{t('navbar.plan_trip')}</Link></li>
                        <li><Link className="tn-nav-link" to="/ar"><i className="fa-solid fa-cube"></i>{t('navbar.ar')}</Link></li>
                        <li><Link className="tn-nav-link" to="/vr"><i className="fa-solid fa-vr-cardboard"></i>{t('navbar.vr')}</Link></li>
                        <li><Link className="tn-nav-link" to="/where-to-go" style={{ color: '#800020', fontWeight: 'bold' }}><i className="fa-solid fa-map-location-dot"></i>{t('navbar.where_to_go') || 'Where to Go'}</Link></li>
                    </ul>

                    <div className="tn-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* Language Dropdown */}
                        <div className="language-dropdown-wrapper" style={{ position: 'relative' }}>
                            <select
                                onChange={(e) => changeLanguage(e.target.value)}
                                value={i18n.language.split('-')[0]}
                                style={{
                                    background: 'rgba(128, 0, 32, 0.1)',
                                    border: '1px solid #800020',
                                    borderRadius: '20px',
                                    padding: '5px 15px',
                                    paddingRight: '30px',
                                    color: '#800020',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    appearance: 'none',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                            <i className="fa-solid fa-chevron-down" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#800020', pointerEvents: 'none', fontSize: '0.8rem' }}></i>
                        </div>
                        {/* Hamburger Menu Icon */}
                        <button
                            className={`mobile-nav-toggle ${sidebarOpen ? 'open' : ''}`}
                            onClick={toggleSidebar}
                            aria-label="Toggle navigation"
                        >
                            <div className="hamburger-bar"></div>
                            <div className="hamburger-bar"></div>
                            <div className="hamburger-bar"></div>
                        </button>

                        {/* Profile Icon Button */}
                        <button
                            id="profileBtn"
                            className={`profile-btn ${sidebarOpen ? 'open' : ''}`}
                            aria-expanded={sidebarOpen}
                            onClick={toggleSidebar}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#800020' }}
                        >
                            <i className="fa-solid fa-circle-user"></i>
                        </button>
                    </div>
                </div>
            </header>

            {/* Slide-in panel with Glassmorphism */}
            <nav id="navPanel" className={`panel ${sidebarOpen ? 'open' : ''}`} aria-hidden={!sidebarOpen}
                style={{
                    background: 'rgba(0, 0, 0, 0.65)', // Semi-transparent dark for glass effect
                    backdropFilter: 'blur(15px)', // Blur effect
                    WebkitBackdropFilter: 'blur(15px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white' // Ensure white text
                }}
            >
                <div className="sidebar-header" style={{ padding: '30px 20px 20px', textAlign: 'center' }}>
                    <div className="profile-icon-large" style={{
                        width: '70px', height: '70px', background: 'rgba(128, 0, 32, 0.1)',
                        borderRadius: '50%', margin: '0 auto 15px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                        color: '#800020', border: '1px solid rgba(128, 0, 32, 0.2)'
                    }}>
                        <i className="fa-solid fa-user"></i>
                    </div>
                    {user ? (
                        <>
                            <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '4px' }}>{profile?.name || 'User'}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>@{profile?.username || 'username'}</p>
                            {profile?.location && (
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '5px' }}>
                                    <i className="fa-solid fa-location-dot" style={{ marginRight: '5px' }}></i>
                                    {profile.location}
                                </p>
                            )}
                        </>
                    ) : (
                        <h3 style={{ color: 'white', fontSize: '1.1rem' }}>Guest Traveller</h3>
                    )}
                </div>
                <div className="section-title" style={{ color: '#ecf0f1', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px' }}>{t('navbar.menu')}</div>

                <Link to="/home" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-house"></i>{t('navbar.home')}</Link>
                <Link to="/plan-trip" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-route"></i>{t('navbar.plan_trip')}</Link>
                <Link to="/booking" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-hotel"></i>{t('navbar.hotel_booking')}</Link>
                <Link to="/guide" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-user-tie"></i>{t('navbar.guide_booking')}</Link>

                <div className="section-divider" style={{ margin: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>

                <Link to="/trip-history" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-clock-rotate-left"></i>Trip History</Link>
                <Link to="/wallet" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-wallet"></i>Travel Wallet</Link>

                {user ? (
                    <button
                        onClick={handleLogout}
                        style={{
                            marginTop: 'auto',
                            padding: '15px',
                            background: 'rgba(128, 0, 32, 0.2)',
                            border: '1px solid #800020',
                            borderRadius: '10px',
                            color: '#800020',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '20px'
                        }}
                    >
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                ) : (
                    <Link to="/login" onClick={closeSidebar} style={{ color: '#800020', fontWeight: 'bold' }}>
                        <i className="fa-solid fa-right-to-bracket"></i> Login / Signup
                    </Link>
                )}

            </nav>

            {/* Overlay to close sidebar when clicking outside */}
            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9997 }}
                    onClick={closeSidebar}
                />
            )}
        </>
    );
};

export default Navbar;
