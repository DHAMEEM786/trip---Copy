import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle, usePageStyle } from '../hooks';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const VR = () => {
    const { t } = useTranslation();
    usePageTitle('Immersive VR Experiences | Stay Selector');
    usePageStyle('/VR/style.css');

    const sectionRef = useRef(null);
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);

    useEffect(() => {
        const interactiveElements = document.querySelectorAll('a, button, .place-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });

        // Particle System Logic (Scoped)
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrame;

        const updateCanvasSize = () => {
            if (sectionRef.current) {
                canvas.width = sectionRef.current.offsetWidth;
                canvas.height = sectionRef.current.offsetHeight;
            }
        };

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
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
                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }
            draw() {
                ctx.fillStyle = `rgba(128, 0, 32, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            updateCanvasSize();
            particles = [];
            for (let i = 0; i < 50; i++) particles.push(new Particle());
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw connecting lines
            ctx.strokeStyle = 'rgba(255, 132, 0, 0.1)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrame = requestAnimationFrame(animate);
        };

        init();
        animate();

        // Cursor Glow Logic (Scoped)
        const handleMouseMove = (e) => {
            if (cursorRef.current && sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
                cursorRef.current.style.opacity = '1';
            }
        };

        const handleMouseLeave = () => {
            if (cursorRef.current) cursorRef.current.style.opacity = '0';
        };

        const section = sectionRef.current;
        if (section) {
            section.addEventListener('mousemove', handleMouseMove);
            section.addEventListener('mouseleave', handleMouseLeave);
        }

        window.addEventListener('resize', updateCanvasSize);

        return () => {
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', () => document.body.classList.add('hovering'));
                el.removeEventListener('mouseleave', () => document.body.classList.remove('hovering'));
            });
            document.body.classList.remove('hovering');
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', updateCanvasSize);
            if (section) {
                section.removeEventListener('mousemove', handleMouseMove);
                section.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    return (
        <div className="vr-page-wrapper" style={{ paddingTop: '80px' }}>
            <Navbar />
            {/* Hero Section */}
            <header className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-subtitle">{t('vr.subtitle')}</span>
                    <h1>{t('vr.title')}</h1>
                    <p>{t('vr.select_desc')}</p>
                    <div className="hero-btns">
                        <a href="#experiences" className="cta-button primary">{t('common.explore_now')} <i className="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main id="experiences" ref={sectionRef} style={{ position: 'relative', backgroundColor: '#ffffff', overflow: 'hidden', width: '100%' }}>
                <canvas id="particleCanvas" ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}></canvas>
                <div className="cursor-glow" ref={cursorRef} style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 140, 0, 0.15) 0%, rgba(255, 255, 255, 0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1, transform: 'translate(-50%, -50%)', opacity: 0, transition: 'opacity 0.5s ease' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="section-header">
                        <span className="section-subtitle" style={{ color: '#ff8c00' }}>{t('vr.choose_dest')}</span>
                        <h2 style={{ color: '#000000' }}>{t('vr.immersive')}</h2>
                        <div className="divider" style={{ backgroundColor: '#ff8c00' }}></div>
                        <p className="section-desc" style={{ color: '#444444' }}>{t('vr.select_desc')}</p>
                    </div>

                    <div className="card-grid">
                        {/* Thanjavur */}
                        <a href="/VR/html/indexdup.html" className="place-card">
                            <div className="card-inner">
                                <div className="card-image">
                                    <img src="/VR/img/raja.jpg" alt="Thanjavur Big Temple" loading="lazy" decoding="async" />
                                    <div className="card-overlay">
                                        <span className="view-btn"><i className="fas fa-vr-cardboard"></i> {t('common.enter_vr')}</span>
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
                                    <div className="card-footer">
                                        <span>{t('common.explore_details')}</span>
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                            </div>
                        </a>

                        {/* Mamallapuram */}
                        <a href="/VR/mamallapuram/indexdup.html" className="place-card">
                            <div className="card-inner">
                                <div className="card-image">
                                    <img src="/VR/pexels-logalongwithme-24246710.jpg" alt="Mamallapuram" loading="lazy" decoding="async" />
                                    <div className="card-overlay">
                                        <span className="view-btn"><i className="fas fa-vr-cardboard"></i> {t('common.enter_vr')}</span>
                                    </div>
                                </div>
                                <div className="card-info">
                                    <div className="card-meta">
                                        <span><i className="fas fa-map-marker-alt"></i> Tamil Nadu</span>
                                        <span><i className="fas fa-star"></i> 4.8</span>
                                    </div>
                                    <h3>Mamallapuram</h3>
                                    <p className="card-detail">{t('vr.mamallapuram_desc')}</p>
                                    <div className="card-footer">
                                        <span>{t('common.explore_details')}</span>
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                            </div>
                        </a>

                        {/* Gangai Konda Cholapuram */}
                        <a href="/VR/gangaikondacholapuram/indexdup.html" className="place-card">
                            <div className="card-inner">
                                <div className="card-image">
                                    <img src="/where-to-go/gangai_vr.jpg" alt="Gangai Konda Cholapuram" loading="lazy" decoding="async" />
                                    <div className="card-overlay">
                                        <span className="view-btn"><i className="fas fa-vr-cardboard"></i> {t('common.enter_vr')}</span>
                                    </div>
                                    <div className="card-badge">New</div>
                                </div>
                                <div className="card-info">
                                    <div className="card-meta">
                                        <span><i className="fas fa-map-marker-alt"></i> Tamil Nadu</span>
                                        <span><i className="fas fa-star"></i> 4.9</span>
                                    </div>
                                    <h3>Gangai Konda Cholapuram</h3>
                                    <p className="card-detail">Explore the Great Living Chola Temple, a masterpiece of Dravidian architecture.</p>
                                    <div className="card-footer">
                                        <span>{t('common.explore_details')}</span>
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default VR;
