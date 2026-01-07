import React, { useEffect, useState, useRef } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageTitle, usePageStyle } from '../hooks';
import DummyNavbar from '../components/DummyNavbar';
import Footer from '../components/Footer';

const DummyPlanTrip = () => {
    const { t } = useTranslation();
    usePageTitle('Tamil Nadu Travel Planner AI - Preview');
    usePageStyle('/ai api/style.css'); // Reusing existing styles
    const navigate = useNavigate();

    // Mock state for visual consistency
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [travelType, setTravelType] = useState('family');
    const [budget, setBudget] = useState('moderate');
    const [placeType, setPlaceType] = useState('mixed');
    const [customPrompt, setCustomPrompt] = useState('');

    const canvasRef = useRef(null);

    // Particle Background System (Reused for consistent look)
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
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
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

    const handleLockedGenerate = async () => {
        // Redirect to Login on click
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out error", error);
        }
        navigate('/login');
    };

    return (
        <div style={{ paddingTop: '80px' }}>
            <DummyNavbar />
            <canvas ref={canvasRef} id="particleCanvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}></canvas>
            <div className="app-container">
                <aside className="sidebar">
                    <div className="brand">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        <h1>TN Verse AI</h1>
                    </div>

                    <div className="controls">
                        {/* Inputs are functional visually but action is blocked at the end */}
                        <div className="control-group">
                            <label htmlFor="cityInput"><i className="fa-solid fa-earth-asia"></i> {t('plan_trip.dest_city')}</label>
                            <input type="text" id="cityInput" placeholder={t('plan_trip.placeholder')} value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>

                        <div className="control-row">
                            <div className="control-group">
                                <label htmlFor="startDate"><i className="fa-regular fa-calendar"></i> {t('plan_trip.start_date')}</label>
                                <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="control-group">
                                <label htmlFor="endDate"><i className="fa-regular fa-calendar-check"></i> {t('plan_trip.end_date')}</label>
                                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="control-group">
                            <label><i className="fa-solid fa-user-astronaut"></i> {t('plan_trip.traveler_profile')}</label>
                            <div className="select-grid">
                                {['solo', 'partner', 'family', 'friends'].map(type => (
                                    <button key={type} className={`select-btn ${travelType === type ? 'active' : ''}`} onClick={() => setTravelType(type)}>
                                        <i className={`fa-solid ${type === 'solo' ? 'fa-person' : type === 'partner' ? 'fa-heart' : type === 'family' ? 'fa-users' : 'fa-user-group'}`}></i> {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="control-group">
                            <label><i className="fa-solid fa-wallet"></i> {t('plan_trip.budget')}</label>
                            <div className="select-grid">
                                {[
                                    { val: 'cheap', label: 'Budget', icon: '$' },
                                    { val: 'moderate', label: 'Standard', icon: '$$' },
                                    { val: 'luxury', label: 'Luxury', icon: '$$$' }
                                ].map(item => (
                                    <button key={item.val} className={`select-btn ${budget === item.val ? 'active' : ''}`} onClick={() => setBudget(item.val)}>
                                        <span>{item.icon}</span> {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="control-group">
                            <label><i className="fa-solid fa-heart"></i> {t('plan_trip.vibe')}</label>
                            <div className="select-grid">
                                {[
                                    { val: 'mixed', label: 'Mixed' },
                                    { val: 'adventure', label: 'Adventure' },
                                    { val: 'waterfall', label: 'Nature' },
                                    { val: 'temple', label: 'Heritage' }
                                ].map(item => (
                                    <button key={item.val} className={`select-btn ${placeType === item.val ? 'active' : ''}`} onClick={() => setPlaceType(item.val)}>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="control-group">
                            <label htmlFor="customPrompt"><i className="fa-solid fa-comment-dots"></i> {t('plan_trip.special_req')}</label>
                            <textarea id="customPrompt" rows="3" placeholder="Any specific wishes?" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}></textarea>
                        </div>

                        {/* LOCKED GENERATE BUTTON */}
                        <button onClick={handleLockedGenerate} className="generate-btn" style={{ position: 'relative', overflow: 'hidden' }}>
                            <i className="fa-solid fa-lock" style={{ marginRight: '10px' }}></i> Login to Generate Plan
                        </button>
                    </div>
                </aside>

                <main className="main-content">
                    <div className="result-header">
                        <h2>{t('plan_trip.your_itinerary')}</h2>
                    </div>

                    <div id="output" className="output-area">
                        <div className="placeholder-state" style={{ opacity: 0.7 }}>
                            <i className="fa-solid fa-lock" style={{ fontSize: '3rem', marginBottom: '20px', color: '#800020' }}></i>
                            <h3 style={{ color: '#800020' }}>Premium Feature</h3>
                            <p>Plan your perfect trip with AI customization.</p>
                            <p>Please login to generate your itinerary.</p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default DummyPlanTrip;
