import React, { useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageTitle, usePageStyle } from '../hooks';
import DummyNavbar from '../components/DummyNavbar';
import Footer from '../components/Footer';


const DummyAR = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    usePageTitle('Explore by AR | Preview');
    usePageStyle('/AR/style.css');
    usePageStyle('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

    const canvasRef = useRef(null);

    // ... (particle logic) ...


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
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animateParticles);
        };

        initParticles();
        animateParticles();
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Locked Handler
    const handleLockedClick = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out error", error);
        }
        navigate('/login');
    };
    return (
        <div className="ar-page-wrapper" style={{ paddingTop: '80px' }}>
            <DummyNavbar />
            <canvas ref={canvasRef} id="particleCanvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}></canvas>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content container">
                    <h1 className="display-1 fw-bold">{t('ar.title')}</h1>
                    <p className="lead">{t('ar.subtitle')}</p>
                    <button onClick={handleLockedClick} className="btn btn-primary btn-lg mt-4">
                        <i className="fa-solid fa-lock"></i> {t('common.start_exploring')}
                    </button>
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
                            { title: t('ar.kannagi'), desc: t('ar.kannagi_desc'), img: "/AR/img/OIP.webp" },
                            { title: t('ar.chariot'), desc: t('ar.chariot_desc'), img: "/AR/img/temple chattroit1.jpg" },
                            { title: t('ar.thiruvalluvar'), desc: t('ar.thiruvalluvar_desc'), img: "/AR/img/thiruvalluvar.webp" },
                            { title: t('ar.murugan'), desc: t('ar.murugan_desc'), img: "/AR/img/murugan1.webp" },
                            { title: t('ar.nandhi'), desc: t('ar.nandhi_desc'), img: "/AR/img/nandhi1.webp" },
                            { title: t('ar.kurinji'), desc: t('ar.kurinji_desc'), img: "/AR/img/kurinji flower1.webp", badge: t('common.rare') }
                        ].map((item, i) => (
                            <div key={i} className="col-md-6 col-lg-4">
                                <div className="ar-card" style={{ opacity: 1, transform: 'none' }}>
                                    <div className="card-image">
                                        <img src={item.img} alt={item.title} />
                                        <div className="card-badge">{item.badge || t('common.ar_ready')}</div>
                                    </div>
                                    <div className="card-details">
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                        <div className="ar-action">
                                            {/* Locked Button */}
                                            <button className="btn btn-outline-danger btn-sm" onClick={handleLockedClick} style={{ width: '100%', fontWeight: 'bold' }}>
                                                <i className="fa-solid fa-lock"></i> Login to View AR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default DummyAR;
