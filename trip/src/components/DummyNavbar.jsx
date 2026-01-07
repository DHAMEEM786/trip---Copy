import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import '../assets/css/style.css'; // Importing global styles

const DummyNavbar = () => {
    const { t, i18n } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
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

    const handleLockedClick = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    return (
        <header className={`tn-navbar ${scrolled ? 'scrolled' : ''}`} id="siteNavbar">
            <div className="tn-nav-inner">
                <div className="tn-nav-brand" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <span className="brand-tn" style={{ color: '#800020' }}>TN</span><span className="brand-verse">verse</span>
                </div>

                {/* Reintroduced Menu Items to match Home Page look, but pointing to Preview Pages */}
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
        </header>
    );
};

export default DummyNavbar;
