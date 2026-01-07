import React, { useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageTitle, usePageStyle } from '../hooks';
import DummyNavbar from '../components/DummyNavbar';
import Footer from '../components/Footer';


const DummyVR = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    usePageTitle('Immersive VR Experiences | Preview');
    usePageStyle('/VR/style.css'); // Reuse styles

    const sectionRef = useRef(null);
    const canvasRef = useRef(null);

    // ... (particle logic) ...

    const handleLockedClick = async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out error", error);
        }
        navigate('/login');
    };
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        updateSize();

        let particles = [];
        let animationFrame;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = `rgba(128, 0, 32, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < 50; i++) particles.push(new Particle());
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            animationFrame = requestAnimationFrame(animate);
        };

        init();
        animate();
        window.addEventListener('resize', () => { updateSize(); init(); });

        return () => cancelAnimationFrame(animationFrame);
    }, []);



    return (
        <div className="vr-page-wrapper" style={{ paddingTop: '80px' }}>
            <DummyNavbar />
            <header className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-subtitle">{t('vr.subtitle')}</span>
                    <h1>{t('vr.title')}</h1>
                    <p>{t('vr.select_desc')}</p>
                    <div className="hero-btns">
                        <button onClick={handleLockedClick} className="cta-button primary">
                            <i className="fa-solid fa-lock"></i> {t('common.explore_now')}
                        </button>
                    </div>
                </div>
            </header>

            <main id="experiences" ref={sectionRef} style={{ position: 'relative', backgroundColor: '#ffffff', minHeight: '80vh' }}>
                <canvas id="particleCanvas" ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}></canvas>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="section-header">
                        <span className="section-subtitle">{t('vr.choose_dest')}</span>
                        <h2 style={{ color: '#000000' }}>{t('vr.immersive')}</h2>
                        <div className="divider"></div>
                        <p className="section-desc" style={{ color: '#444444' }}>{t('vr.select_desc')}</p>
                    </div>

                    <div className="card-grid">
                        {/* Thanjavur */}
                        <div onClick={handleLockedClick} className="place-card" style={{ cursor: 'pointer' }}>
                            <div className="card-inner">
                                <div className="card-image">
                                    <img src="/VR/img/raja.jpg" alt="Thanjavur Big Temple" />
                                    <div className="card-overlay">
                                        <span className="view-btn"><i className="fas fa-lock"></i> Login to Enter VR</span>
                                    </div>
                                    <div className="card-badge">{t('common.popular')}</div>
                                </div>
                                <div className="card-info">
                                    <div className="card-meta">
                                        <span><i className="fas fa-map-marker-alt"></i> Tamil Nadu</span>
                                        <span><i className="fas fa-star"></i> 4.9</span>
                                    </div>
                                    <h3>Thanjavur</h3>
                                    <p className="card-detail">{t('vr.thanjavur_desc')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Mamallapuram */}
                        <div onClick={handleLockedClick} className="place-card" style={{ cursor: 'pointer' }}>
                            <div className="card-inner">
                                <div className="card-image">
                                    <img src="/VR/pexels-logalongwithme-24246710.jpg" alt="Mamallapuram" />
                                    <div className="card-overlay">
                                        <span className="view-btn"><i className="fas fa-lock"></i> Login to Enter VR</span>
                                    </div>
                                </div>
                                <div className="card-info">
                                    <div className="card-meta">
                                        <span><i className="fas fa-map-marker-alt"></i> Tamil Nadu</span>
                                        <span><i className="fas fa-star"></i> 4.8</span>
                                    </div>
                                    <h3>Mamallapuram</h3>
                                    <p className="card-detail">{t('vr.mamallapuram_desc')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Darasuram */}
                        <div onClick={handleLockedClick} className="place-card" style={{ cursor: 'pointer' }}>
                            <div className="card-inner">
                                <div className="card-image">
                                    <img src="/VR/pexels-logalongwithme-24246710.jpg" alt="Darasuram" />
                                    <div className="card-overlay">
                                        <span className="view-btn"><i className="fas fa-lock"></i> Login to Enter VR</span>
                                    </div>
                                </div>
                                <div className="card-info">
                                    <div className="card-meta">
                                        <span><i className="fas fa-map-marker-alt"></i> Tamil Nadu</span>
                                        <span><i className="fas fa-star"></i> 4.7</span>
                                    </div>
                                    <h3>Darasuram</h3>
                                    <p className="card-detail">{t('vr.darasuram_desc')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Gangai Konda Cholapuram */}
                        <div onClick={handleLockedClick} className="place-card" style={{ cursor: 'pointer' }}>
                            <div className="card-inner">
                                <div className="card-image">
                                    <img src="/where-to-go/gangai_vr.jpg" alt="Gangai Konda Cholapuram" />
                                    <div className="card-overlay">
                                        <span className="view-btn"><i className="fas fa-lock"></i> Login to Enter VR</span>
                                    </div>
                                </div>
                                <div className="card-info">
                                    <div className="card-meta">
                                        <span><i className="fas fa-map-marker-alt"></i> Tamil Nadu</span>
                                        <span><i className="fas fa-star"></i> 4.9</span>
                                    </div>
                                    <h3>Gangai Konda Cholapuram</h3>
                                    <p className="card-detail">Explore the Great Living Chola Temple, a masterpiece of Dravidian architecture.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DummyVR;
