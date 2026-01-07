import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle, usePageStyle } from '../hooks';

const GuideDetail = () => {
    const { id } = useParams();
    usePageTitle('Guide Profile | TN Verse');
    usePageStyle('/guide/style.css');
    usePageStyle('/guide/detail.css');

    // Mock detailed data based on previously defined guides
    const guidesData = {
        "1": {
            name: "Arun Kumar",
            location: "Salem",
            rating: 4.8,
            reviewsCount: 124,
            experience: 8,
            bookings: 450,
            happyTourists: 98,
            cancellationRate: 2,
            languages: ["English", "Tamil"],
            price: 500,
            priceType: "hr",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            bio: "Certified historical guide with deep knowledge of Salem's ancient architecture and heritage. I specialize in storytelling and making history come alive.",
            expertise: ["Temple Architecture", "Ancient History", "Local Food Trails"],
            places: ["Meenakshi Temple", "Local Museums", "Agraharam Streets"],
            status: "Available Today"
        },
        "2": {
            name: "Priya Sharma",
            location: "Chennai",
            rating: 4.9,
            reviewsCount: 215,
            experience: 6,
            bookings: 820,
            happyTourists: 99,
            cancellationRate: 1,
            languages: ["English", "Hindi", "Tamil"],
            price: 800,
            priceType: "hr",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            bio: "Lively and energetic guide focusing on Chennai's urban culture, markets, and hidden coastal spots. Best for foodies and street photography enthusiasts.",
            expertise: ["Street Food", "Urban Photography", "Coastal Traditions"],
            places: ["Marina Beach", "Mylapore Markets", "Santhome Cathedral"],
            status: "Busy"
        }
        // ... more can be added
    };

    const guide = guidesData[id] || guidesData["1"]; // Default to 1 if not found

    return (
        <div className="guide-detail-wrapper">
            <Navbar />

            <main className="detail-container">
                <div className="profile-hero-section">
                    <div className="hero-profile-card animate-pop-in">
                        <div className="hero-img-box">
                            <img src={guide.image} alt={guide.name} className="main-profile-img" />
                            <div className={`status-pill ${guide.status.includes('Available') ? 'online' : 'busy'}`}>
                                {guide.status}
                            </div>
                        </div>
                        <div className="hero-info-box">
                            <div className="top-header">
                                <h1>{guide.name} <i className="fa-solid fa-circle-check verified-icon"></i></h1>
                                <div className="rating-summary">
                                    <i className="fa-solid fa-star"></i>
                                    <strong>{guide.rating}</strong>
                                    <span>({guide.reviewsCount} Reviews)</span>
                                </div>
                            </div>
                            <div className="meta-list">
                                <span><i className="fa-solid fa-location-dot"></i> {guide.location}</span>
                                <span><i className="fa-solid fa-briefcase"></i> {guide.experience} Years Exp.</span>
                            </div>
                            <div className="languages-box">
                                {guide.languages.map(lang => <span key={lang} className="lang-chip">{lang}</span>)}
                            </div>
                            <div className="action-buttons-hero">
                                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="btn-detail-whatsapp">
                                    <i className="fa-brands fa-whatsapp"></i> WhatsApp
                                </a>
                                <button className="btn-detail-call">
                                    <i className="fa-solid fa-phone"></i> Call
                                </button>
                                <button className="btn-detail-save">
                                    <i className="fa-regular fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-layout">
                    <div className="detail-main-content">
                        {/* Stats Section */}
                        <section className="stats-grid-premium">
                            <div className="stat-card">
                                <div className="stat-val">{guide.bookings}+</div>
                                <div className="stat-lbl">Bookings</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-val">{guide.experience}</div>
                                <div className="stat-lbl">Years</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-val">{guide.happyTourists}%</div>
                                <div className="stat-lbl">Happy Trips</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-val">{guide.cancellationRate}%</div>
                                <div className="stat-lbl">Cancellation</div>
                            </div>
                        </section>

                        <section className="about-section-premium">
                            <h2>About {guide.name.split(' ')[0]}</h2>
                            <p className="bio-text">{guide.bio}</p>

                            <div className="expertise-tags">
                                {guide.expertise.map(item => (
                                    <div key={item} className="expertise-item">
                                        <i className="fa-solid fa-circle-check"></i> {item}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="places-section">
                            <h2>Iconic Places Covered</h2>
                            <div className="places-list">
                                {guide.places.map(place => (
                                    <div key={place} className="place-chip">
                                        <i className="fa-solid fa-camera"></i> {place}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="detail-sidebar">
                        <div className="pricing-card-premium sticky-card">
                            <div className="price-header">
                                <div className="price-tag">
                                    <span>Starts from</span>
                                    <h3>₹{guide.price} <small>/{guide.priceType}</small></h3>
                                </div>
                            </div>
                            <div className="booking-checklist">
                                <div className="check-item"><i className="fa-solid fa-check"></i> Certified Guide Service</div>
                                <div className="check-item"><i className="fa-solid fa-check"></i> Local Hidden Spots assisting</div>
                                <div className="check-item"><i className="fa-solid fa-check"></i> 24/7 Emergency Support</div>
                                <div className="check-item"><i className="fa-solid fa-xmark no"></i> Transportation / Food</div>
                            </div>
                            <button className="btn-book-now-premium">Book Now & Confirm</button>
                            <p className="secure-p"><i className="fa-solid fa-shield-halved"></i> Verified & Secure Booking</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Bar */}
            <div className="mobile-book-bar">
                <div className="mobile-price">₹{guide.price}/{guide.priceType}</div>
                <button className="btn-mobile-book">Book Now</button>
            </div>
            <Footer />
        </div>
    );
};

export default GuideDetail;
