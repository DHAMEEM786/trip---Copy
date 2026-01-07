import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import '../assets/css/style.css'; // Importing global styles

const DummyNavbar = () => {
    const { t, i18n } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

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

    const handleLockedClick = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    return (
        <>
            <header className={`tn-navbar ${scrolled ? 'scrolled' : ''}`} id="siteNavbar">
                <div className="tn-nav-inner">
                    <div className="tn-nav-brand" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        <span className="brand-tn" style={{ color: '#800020' }}>TN</span><span className="brand-verse">verse</span>
                    </div>

                    {/* Desktop Menu */}
                    <ul className="tn-nav-menu">
                        <li><Link className="tn-nav-link" to="/"><i className="fa-solid fa-house"></i>{t('navbar.home')}</Link></li>
                        <li><Link className="tn-nav-link" to="/preview/plan-trip"><i className="fa-solid fa-route"></i>{t('navbar.plan_trip')}</Link></li>
                        <li><Link className="tn-nav-link" to="/preview/ar"><i className="fa-solid fa-cube"></i>{t('navbar.ar')}</Link></li>
                        <li><Link className="tn-nav-link" to="/preview/vr"><i className="fa-solid fa-vr-cardboard"></i>{t('navbar.vr')}</Link></li>
                        <li><Link className="tn-nav-link" to="/where-to-go" style={{ color: '#800020', fontWeight: 'bold' }}><i className="fa-solid fa-map-location-dot"></i>{t('navbar.where_to_go') || 'Where to Go'}</Link></li>
                    </ul>

                    <div className="tn-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* Language Dropdown */}
                        <div className="language-dropdown-wrapper" style={{ position: 'relative' }}>
                            <select
                                onChange={(e) => changeLanguage(e.target.value)}
                                value={i18n.language.split('-')[0]}
                                style={{
                                    background: 'rgba(255, 69, 0, 0.1)',
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

                        {/* Desktop Auth Buttons */}
                        <div className="desktop-auth-buttons" style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-login"
                                onClick={async () => {
                                    try {
                                        await signOut(auth);
                                    } catch (error) {
                                        console.error("Sign out error", error);
                                    }
                                    navigate('/login');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #800020',
                                    color: '#800020',
                                    padding: '8px 20px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                Login
                            </button>

                            <button
                                className="btn-signup"
                                onClick={async () => {
                                    try {
                                        await signOut(auth);
                                    } catch (error) {
                                        console.error("Sign out error", error);
                                    }
                                    navigate('/signup');
                                }}
                                style={{
                                    background: '#800020',
                                    border: 'none',
                                    color: 'white',
                                    padding: '8px 20px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                Signup
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Slide-in panel for mobile */}
            <nav id="navPanel" className={`panel ${sidebarOpen ? 'open' : ''}`} aria-hidden={!sidebarOpen}
                style={{
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
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
                    <h3 style={{ color: 'white', fontSize: '1.1rem' }}>Guest Traveller</h3>
                </div>

                <div className="section-title" style={{ color: '#ecf0f1', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px' }}>Menu</div>

                <Link to="/" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-house"></i>{t('navbar.home')}</Link>
                <Link to="/preview/plan-trip" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-route"></i>{t('navbar.plan_trip')}</Link>
                <Link to="/preview/ar" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-cube"></i>{t('navbar.ar')}</Link>
                <Link to="/preview/vr" onClick={closeSidebar} style={{ color: 'white' }}><i className="fa-solid fa-vr-cardboard"></i>{t('navbar.vr')}</Link>
                <Link to="/where-to-go" onClick={closeSidebar} style={{ color: 'white', fontWeight: 'bold' }}><i className="fa-solid fa-map-location-dot"></i>{t('navbar.where_to_go') || 'Where to Go'}</Link>

                <div className="section-divider" style={{ margin: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>

                <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={() => { closeSidebar(); navigate('/login'); }}
                        style={{
                            padding: '12px',
                            background: 'transparent',
                            border: '1px solid #800020',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { closeSidebar(); navigate('/signup'); }}
                        style={{
                            padding: '12px',
                            background: '#800020',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Signup
                    </button>
                </div>
            </nav>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9997, background: 'rgba(0,0,0,0.3)' }}
                    onClick={closeSidebar}
                />
            )}
        </>
    );
};

export default DummyNavbar;
