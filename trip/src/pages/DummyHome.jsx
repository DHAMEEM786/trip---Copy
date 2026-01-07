import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import DummyNavbar from '../components/DummyNavbar';
import '../assets/css/style.css';
import { usePageTitle } from '../hooks';

import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const DummyHome = () => {
    const { t } = useTranslation();
    usePageTitle('Premium Travel & Tourism + Instagram Feed');

    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Locked action handler
    const handleLockedClick = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out error", error);
        }
        navigate('/login');
    };

    const events = [
        {
            id: 1,
            day: '14',
            month: 'JAN 2026',
            title: t('home.event_1_title'),
            desc: t('home.event_1_desc'),
            img: '/pongal_festival_tn_1767338347356.png',
            color: '#ff4e00',
            longDesc: 'Pongal is a four-day harvest festival celebrated by Tamil people globally. It is dedicated to the Sun God, Surya, and corresponds to Makar Sankranti. The festival marks the beginning of the sun\'s six-month long journey northwards (Uttarayana).'
        },
        {
            id: 2,
            day: '02',
            month: 'FEB 2026',
            title: t('home.event_4_title'),
            desc: t('home.event_4_desc'),
            img: '/thaipusam_festival_tn_1767338364844.png',
            color: '#ffc107',
            longDesc: 'Thaipusam is a Hindu festival celebrated by the Tamil community on the full moon in the Tamil month of Thai. It is dedicated to the Hindu god Murugan, the son of Shiva and Parvati.'
        },
        {
            id: 3,
            day: '01',
            month: 'MAR 2026',
            title: t('home.event_6_title'),
            desc: t('home.event_6_desc'),
            img: '/natyanjali_dance_tn_1767338382242.png',
            color: '#9c27b0',
            longDesc: 'Natyanjali is an annual classical dance festival in Chidambaram. It is dedicated to Nataraja, the Shiva deity who is the patron of the arts, particularly dance.'
        },
        {
            id: 4,
            day: '14',
            month: 'APR 2026',
            title: 'Puthandu',
            desc: 'Tamil New Year celebration with traditional feasts and festivities.',
            img: '/tn verse/src/tn-temple.png',
            color: '#4caf50',
            longDesc: 'Puthandu, also known as Puthuvarusham or Tamil New Year, is the first day of year on the Tamil calendar and is traditionally celebrated as a festival.'
        },
        {
            id: 5,
            day: '28',
            month: 'APR 2026',
            title: t('home.event_2_title'),
            desc: t('home.event_2_desc'),
            img: '/chithirai_thiruvizha_tn_1767338402401.png',
            color: '#f44336',
            longDesc: 'Chithirai Thiruvizha is a grand month-long celebration in Madurai, depicting the celestial wedding of Goddess Meenakshi to Lord Sundareswarar.'
        },
        {
            id: 6,
            day: '15',
            month: 'DEC 2026',
            title: t('home.event_3_title'),
            desc: t('home.event_3_desc'),
            img: '/margazhi_music_tn_1767338428632.png',
            color: '#2196f3',
            longDesc: 'The Margazhi festival of dance and music is a celebration of the arts in Chennai, attracting performers and enthusiasts from across the globe.'
        }
    ];

    const canvasRef = useRef(null);
    const sectionRef = useRef(null);

    // Particle Background System (Identical to Home.jsx)
    useEffect(() => {
        const canvas = canvasRef.current;
        const section = sectionRef.current;
        if (!canvas || !section) return;

        const ctx = canvas.getContext('2d');

        const updateSize = () => {
            canvas.width = section.offsetWidth;
            canvas.height = section.offsetHeight;
        };
        updateSize();

        let particles = [];
        const particleCount = 350;
        let animationFrameId;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.9;
                this.vy = (Math.random() - 0.5) * 0.9;
                this.size = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.fillStyle = 'rgba(128, 0, 32, 0.6)';
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

                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.strokeStyle = `rgba(128, 0, 32, ${0.1 - distance / 1200})`;
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
            updateSize();
            initParticles();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Cursor Glow Logic (Scoped to Section)
    useEffect(() => {
        const section = sectionRef.current;
        const cursorGlow = section?.querySelector('.cursor-glow');
        if (!section || !cursorGlow) return;

        const handleMouseMove = (e) => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            cursorGlow.style.left = x + 'px';
            cursorGlow.style.top = y + 'px';
            cursorGlow.style.opacity = '1';
        };

        const handleMouseLeave = () => {
            cursorGlow.style.opacity = '0';
        };

        section.addEventListener('mousemove', handleMouseMove);
        section.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            section.removeEventListener('mousemove', handleMouseMove);
            section.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        });

        const targets = document.querySelectorAll('.fade-in-section');
        targets.forEach(target => observer.observe(target));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="home-container">
            <DummyNavbar />

            {/* Hero Section */}
            <section id="hero">
                <div id="hero-content">
                    <img src="/tn verse/src/tropical_logo.png" alt="TN Verse Logo" className="circle-logo" />
                    <h1>{t('home.hero_title')}</h1>
                    <p>{t('home.hero_subtitle')}</p>
                    <div className="hero-buttons">
                        <button className="btn-vr" onClick={() => navigate('/preview/vr')}>
                            <i className="fa-solid fa-vr-cardboard"></i> {t('navbar.vr')}
                        </button>

                        <button className="btn-ar" onClick={() => navigate('/preview/ar')}>
                            <i className="fa-solid fa-cube"></i> {t('navbar.ar')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Wrapped Content with Unified Particle Background */}
            <main className="main-content-wrapper" ref={sectionRef}>
                <canvas ref={canvasRef} id="particleCanvas"></canvas>
                <div className="cursor-glow"></div>

                {/* Tamil Nadu Wonders Section */}
                <section id="tn-wonders">
                    <div className="tn-header">
                        <h2>{t('home.wonders_title')}</h2>
                        <p>{t('home.wonders_subtitle')}</p>
                    </div>
                    <div className="tn-cards-container">
                        {/* Card 1 */}
                        <div className="tn-card" onClick={() => navigate('/culinary')} style={{ cursor: 'pointer' }}>
                            <img src="/tn verse/src/memories-cuisine.png" alt="Culinary Tourism" />
                            <div className="tn-card-content">
                                <h3>{t('home.culinary_title')}</h3>
                                <p>{t('home.culinary_desc')}</p>
                                <button className="explore-btn-3d" style={{ marginTop: '10px', width: '100%' }}>Click Here</button>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="tn-card" onClick={() => navigate('/agri')} style={{ cursor: 'pointer' }}>
                            <img src="/tn verse/src/agri.png" alt="Agri & Rural Tourism" />
                            <div className="tn-card-content">
                                <h3>{t('home.agri_title')}</h3>
                                <p>{t('home.agri_desc')}</p>
                                <button className="explore-btn-3d" style={{ marginTop: '10px', width: '100%' }}>Click Here</button>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="tn-card" onClick={() => navigate('/medical')} style={{ cursor: 'pointer' }}>
                            <img src="/tn verse/src/medical.png" alt="Wellness & Medical Tourism" />
                            <div className="tn-card-content">
                                <h3>{t('home.wellness_title')}</h3>
                                <p>{t('home.wellness_desc')}</p>
                                <button className="explore-btn-3d" style={{ marginTop: '10px', width: '100%' }}>Click Here</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* AR Experience Section (Zig-Zag: Text Left, Image Right) */}
                <section className="zig-zag-section fade-in-section">
                    <div className="zig-zag-container">
                        <div className="zig-zag-row">
                            <div className="zig-zag-content">
                                <h2>{t('ar.title')}</h2>
                                <p>{t('ar.subtitle')}</p>
                                <button className="btn-premium" onClick={() => navigate('/preview/ar')}>
                                    {t('common.start_exploring')}
                                </button>
                            </div>
                            <div className="zig-zag-image">
                                <img src="/tn verse/src/ar_preview.png" alt="AR Experience Preview" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* VR Experience Section (Zig-Zag: Image Left, Text Right) */}
                <section className="zig-zag-section fade-in-section">
                    <div className="zig-zag-container">
                        <div className="zig-zag-row reverse">
                            <div className="zig-zag-content">
                                <h2>{t('vr.title')}</h2>
                                <p>{t('vr.select_desc')}</p>
                                <button className="btn-premium" onClick={() => navigate('/preview/vr')}>
                                    {t('common.explore_now')}
                                </button>
                            </div>
                            <div className="zig-zag-image">
                                <img src="/where-to-go/gangai_vr.jpg" alt="VR Experience Preview" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Upcoming Events Section with Carousel */}
                <section id="upcoming-events" className="fade-in-section">
                    <div className="section-header-centered">
                        <h2>{t('home.events_title')}</h2>
                        <p>{t('home.events_subtitle')}</p>
                    </div>

                    <div className="events-carousel-container">
                        <div className="carousel-track-wrapper">
                            <motion.div
                                className="events-carousel-track"
                                drag="x"
                                dragConstraints={{ left: -1400, right: 0 }}
                                whileTap={{ cursor: "grabbing" }}
                            >
                                {events.map((event, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="event-card-3d"
                                        whileHover={{ y: -20, rotateY: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="event-card-visual" style={{ '--accent-color': event.color }}>
                                            <div className="event-image-container">
                                                <img src={event.img} alt={event.title} />
                                                <div className="event-overlay-grad"></div>
                                            </div>
                                            <div className="event-content-3d">
                                                <div className="event-badge-3d">
                                                    <span className="day">{event.day}</span>
                                                    <span className="month">{event.month}</span>
                                                </div>
                                                <h3>{event.title}</h3>
                                                <p>{event.desc}</p>
                                                <button
                                                    className="explore-btn-3d"
                                                    onClick={handleLockedClick} // Locked
                                                >
                                                    <i className="fa-solid fa-lock"></i> Login to Explore
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                        <div className="carousel-hint">
                            <i className="fa-solid fa-hand-pointer"></i> {t('common.drag_to_explore')}
                        </div>
                    </div>
                </section>






                {/* Waterfall Timeline Section (Viewable but static) */}
                <section id="historical-timeline" className="fade-in-section">
                    <div className="section-header-centered">
                        <h2>{t('home.timeline_title')}</h2>
                        <p>{t('home.timeline_subtitle')}</p>
                    </div>

                    <div className="timeline-waterfall">
                        <div className="timeline-center-line"></div>

                        {[
                            { title: 'Sangam Era', desc: 'The golden age of Tamil literature and early civilization.', icon: '📜' },
                            { title: 'The Great Cholas', desc: 'The rise of the maritime empire and architectural marvels like Brihadisvara.', icon: '🏛️' },
                            { title: 'Modern Era', desc: "Tamil Nadu's growth as a technological and cultural hub of India.", icon: '🏙️' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={`timeline-item-wf ${idx % 2 === 0 ? 'left' : 'right'}`}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -100 : 100, y: 50 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: idx * 0.2, type: "spring" }}
                            >
                                <div className="timeline-dot-wf">
                                    <span className="dot-inner"></span>
                                </div>
                                <div className="timeline-card-wf">
                                    <div className="wf-card-icon">{item.icon}</div>
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* About Us Section */}
                <section id="about-us" className="fade-in-section">
                    <div className="about-container">
                        <div className="about-text">
                            <h2>{t('home.about_title')}</h2>
                            <p>{t('home.about_desc')}</p>
                            <motion.button
                                className="btn-plan-now"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/preview/plan-trip')}
                            >
                                {t('navbar.plan_trip')} <i className="fa-solid fa-arrow-right"></i>
                            </motion.button>
                        </div>
                        <div className="about-image">
                            <img src="/tn verse/src/tour.png" alt="Tamil Nadu Tourism" />
                            <div className="image-overlay-subtle"></div>
                        </div>
                    </div>
                </section>

                {/* Locked content notification mechanism could be added here if needed */}
                <Footer />
            </main>
        </div >
    );
};

export default DummyHome;
