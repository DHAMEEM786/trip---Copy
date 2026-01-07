import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle, usePageStyle } from '../hooks';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AR = () => {
    const { t } = useTranslation();
    usePageTitle('Explore by AR | MyTripPlaner');
    usePageStyle('/AR/style.css');
    usePageStyle('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

    const canvasRef = useRef(null);
    const [qrModalActive, setQrModalActive] = useState(false);
    const [qrImageSrc, setQrImageSrc] = useState('');

    const openQrModal = (src) => {
        setQrImageSrc(src);
        setQrModalActive(true);
    };

    const closeQrModal = () => {
        setQrModalActive(false);
    };

    // Canvas Particles
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        const particleCount = 50;
        let animationFrameId;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.fillStyle = 'rgba(255, 132, 0, 1)';
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
                        ctx.strokeStyle = `rgba(255, 132, 0, ${0.1 - distance / 1500})`;
                        ctx.lineWidth = 1;
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

    // 3D Tilt Effect and Cursor Glow
    useEffect(() => {
        // Cursor Glow
        const cursorGlow = document.querySelector('.cursor-glow');
        const handleMouseMove = (e) => {
            if (cursorGlow) {
                cursorGlow.style.left = e.clientX + 'px';
                cursorGlow.style.top = e.clientY + 'px';
                cursorGlow.style.opacity = '1';
            }
        };
        const handleMouseLeave = () => {
            if (cursorGlow) cursorGlow.style.opacity = '0';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        // Tilt Cards (Manual implementation since querySelectorAll inside effect is fine)
        const tiltCards = document.querySelectorAll('.ar-card');

        const attachTilt = (card) => {
            // Create glare if not exists
            let glare = card.querySelector('.card-glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.classList.add('card-glare');
                card.appendChild(glare);
            }

            const moveHandler = (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

                const glareX = ((x - centerX) / centerX) * 100;
                const glareY = ((y - centerY) / centerY) * 100;
                glare.style.transform = `translate(${glareX}%, ${glareY}%) scale(2)`;
                glare.style.opacity = '1';
            };

            const leaveHandler = () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                glare.style.opacity = '0';
            };

            card.addEventListener('mousemove', moveHandler);
            card.addEventListener('mouseleave', leaveHandler);

            // Store handlers to remove later if needed (hard to do cleanly without refs/memo, simple cleanup below)
            card.moveHandler = moveHandler;
            card.leaveHandler = leaveHandler;
        };

        tiltCards.forEach(card => attachTilt(card));

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            tiltCards.forEach(card => {
                if (card.moveHandler) card.removeEventListener('mousemove', card.moveHandler);
                if (card.leaveHandler) card.removeEventListener('mouseleave', card.leaveHandler);
            });
        };
    }, []);

    // Intersection Observer for Animation
    useEffect(() => {
        const cards = document.querySelectorAll('.ar-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="ar-page-wrapper" style={{ paddingTop: '80px' }}>
            <Navbar />
            <canvas ref={canvasRef} id="particleCanvas"></canvas>
            <div className="cursor-glow"></div>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content container">
                    <h1 className="display-1 fw-bold">{t('ar.title')}</h1>
                    <p className="lead">{t('ar.subtitle')}</p>
                    <a href="#explore" className="btn btn-primary btn-lg mt-4">{t('common.start_exploring')}</a>
                </div>
            </section>

            {/* Content Section */}
            <section id="explore" className="section-padding">
                <div className="container">
                    <div className="section-header text-center mb-5">
                        <h2>{t('ar.featured')}</h2>
                        <div className="divider mx-auto"></div>
                    </div>

                    <div className="row g-4">
                        {[
                            { title: t('ar.kannagi'), desc: t('ar.kannagi_desc'), img: "/AR/img/OIP.webp", marker: "/AR/img/silapathikaram new.png" },
                            { title: t('ar.chariot'), desc: t('ar.chariot_desc'), img: "/AR/img/temple chattroit1.jpg", marker: "/AR/img/temple chariot new.png" },
                            { title: t('ar.thiruvalluvar'), desc: t('ar.thiruvalluvar_desc'), img: "/AR/img/thiruvalluvar.webp", marker: "/AR/img/thiruvalluvar.png" },
                            { title: t('ar.murugan'), desc: t('ar.murugan_desc'), img: "/AR/img/murugan1.webp", marker: "/AR/img/murugan.png" },
                            { title: t('ar.nandhi'), desc: t('ar.nandhi_desc'), img: "/AR/img/nandhi1.webp", marker: "/AR/img/namdhi.png" },
                            { title: t('ar.kurinji'), desc: t('ar.kurinji_desc'), img: "/AR/img/kurinji flower1.webp", marker: "/AR/img/kurinji flowr.png", badge: t('common.rare') }
                        ].map((item, i) => (
                            <div key={i} className="col-md-6 col-lg-4">
                                <div className="ar-card">
                                    <div className="card-image">
                                        <img src={item.img} alt={item.title} />
                                        <div className="card-badge">{item.badge || t('common.ar_ready')}</div>
                                    </div>
                                    <div className="card-details">
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                        <div className="ar-action">
                                            <img src={item.marker} alt="AR Marker" className="ar-marker" />
                                            <button className="btn btn-outline-light btn-sm" onClick={() => openQrModal(item.marker)}>{t('common.view_in_ar')}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* QR Modal */}
            <div id="qrModal" className={`qr-modal ${qrModalActive ? 'active' : ''}`} onClick={(e) => { if (e.target.id === 'qrModal') closeQrModal() }}>
                <span className="close-modal" onClick={closeQrModal}>&times;</span>
                <div className="modal-content">
                    <img id="qrImage" src={qrImageSrc} alt="AR Marker Large" />
                    <p>{t('ar.scan_to_view')}</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AR;
