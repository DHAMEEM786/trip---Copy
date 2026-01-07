import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './WhereToGo.css';

const categories = [
    { id: 'hills', name: 'Hills', emoji: '🏔️', title: 'Famous Hill Stations', img: '/where-to-go/hill.jpg' },
    { id: 'beaches', name: 'Beaches', emoji: '🏖️', title: 'Serene Coastal Escapes', img: '/where-to-go/beach.jpg' },
    { id: 'monuments', name: 'Monuments', emoji: '🏛️', title: 'Historical Marvels', img: '/where-to-go/mounments.jpg' },
    { id: 'religious', name: 'Religious Places', emoji: '🛕', title: 'Spiritual Destinations', img: '/where-to-go/religios.jpg' },
    { id: 'museums', name: 'Museums', emoji: '🖼️', title: 'Treasures of History', img: '/where-to-go/mesume.jpg' },
    { id: 'dams', name: 'Dams', emoji: '🌊', title: 'Engineering Wonders', img: '/where-to-go/dam.jpg' },
    { id: 'wildlife', name: 'Wildlife / Forest', emoji: '🌲', title: 'Nature & Wildlife', img: '/where-to-go/wild.jpg' },
    { id: 'adventure', name: 'Adventure Spots', emoji: '🧗', title: 'Thrill Seekers Zone', img: '/where-to-go/adventure.jpg' },
    { id: 'food', name: 'Local Dishes / Food', emoji: '🍲', title: 'Culinary Delights', img: '/where-to-go/foood.jpg' },
    { id: 'culture', name: 'Cultural & Festivals', emoji: '🎭', title: 'Heritage & Traditions', img: '/where-to-go/culture.jpg' },
];

const placesData = {
    hills: [
        { id: 'ooty', name: 'Ooty', tag: 'Cool Climate', image: '/where-to-go/ooty.jpg', location: 'Tamil Nadu', bestTime: 'March - June', occasions: 'Family / Honeymoon', budget: '₹6k - ₹15k+' },
        { id: 'kodaikanal', name: 'Kodaikanal', tag: 'Honeymoon Choice', image: '/where-to-go/kodaikanal.jpg', location: 'Tamil Nadu', bestTime: 'April - June', occasions: 'Nature / Couples', budget: '₹5k - ₹13k+' },
        { id: 'yercaud', name: 'Yercaud', tag: 'Family Favorite', image: '/where-to-go/yercaud.jpg', location: 'Salem', bestTime: 'May - June', occasions: 'Weekend Trip', budget: '₹4k - ₹10k+' },
        { id: 'coonoor', name: 'Coonoor', tag: 'Tea Gardens', image: '/where-to-go/yercaud.jpg', location: 'Tamil Nadu', bestTime: 'Oct - March', occasions: 'Tea Tours', budget: '₹6k - ₹18k+' },
        { id: 'valparai', name: 'Valparai', tag: 'Nature Retreat', image: '/where-to-go/valparai.jpg', location: 'Tamil Nadu', bestTime: 'Jan - May', occasions: 'Wildlife', budget: '₹5k - ₹12k+' },
        { id: 'kotagiri', name: 'Kotagiri', tag: 'Quiet Hills', image: '/where-to-go/kotagiri.jpg', location: 'Nilgiris', bestTime: 'Dec - May', occasions: 'Trekking', budget: '₹4k - ₹9k+' },
        { id: 'meghamalai', name: 'Meghamalai', tag: 'High Waves', image: '/where-to-go/meghamalai.jpg', location: 'Theni', bestTime: 'Sept - May', occasions: 'Nature Lovers', budget: '₹3k - ₹8k+' },
        { id: 'kolli-hills', name: 'Kolli Hills', tag: '70 Hairpin Bends', image: '/where-to-go/kolli-hills.jpg', location: 'Namakkal', bestTime: 'All Year', occasions: 'Biking / Adventure', budget: '₹2k - ₹6k+' }
    ],
    beaches: [
        { id: 'marina', name: 'Marina Beach', tag: 'Urban Shore', image: '/where-to-go/marina.jpg', location: 'Chennai', bestTime: 'Nov - Feb', occasions: 'Evening Walk', budget: '₹500 - ₹5k+' },
        { id: 'elliots', name: 'Elliot\'s Beach', tag: 'Calm Vibes', image: '/where-to-go/elliot beach.webp', location: 'Besant Nagar', bestTime: 'Dec - March', occasions: 'Hangouts', budget: '₹500 - ₹3k+' },
        { id: 'mahals-beach', name: 'Mahabalipuram', tag: 'Sculpted Coast', image: '/where-to-go/mahabalipuram.jpg', location: 'Kancheepuram', bestTime: 'Dec - Feb', occasions: 'History', budget: '₹3k - ₹10k+' },
        { id: 'kovalam', name: 'Kovalam Beach', tag: 'Surf & Sand', image: '/where-to-go/kovlam beach.webp', location: 'Chennai Outskirts', bestTime: 'Nov - March', occasions: 'Surfing', budget: '₹2k - ₹8k+' },
        { id: 'rameswaram-beach', name: 'Rameswaram', tag: 'Spiritual Shore', image: '/where-to-go/rameswaram.webp', location: 'Rameswaram', bestTime: 'All Year', occasions: 'Religious Dip', budget: '₹3k - ₹9k+' },
        { id: 'dhanushkodi', name: 'Dhanushkodi', tag: 'Ghost Town', image: '/where-to-go/Dhanushkodi.jpeg', location: 'Island End', bestTime: 'Oct - Feb', occasions: 'Offbeat Explore', budget: '₹2k - ₹5k' },
        { id: 'kanyakumari', name: 'Kanyakumari', tag: 'Ocean Meeting', image: '/where-to-go/kanyakumari.webp', location: 'Cape Comorin', bestTime: 'Nov - Jan', occasions: 'Sunrise / Sunset', budget: '₹4k - ₹12k+' },
        { id: 'thiruchendur', name: 'Thiruchendur', tag: 'Divine Coast', image: '/where-to-go/tiruchendur.jpg', location: 'Tuticorin', bestTime: 'Oct - March', occasions: 'Spiritual', budget: '₹2k - ₹7k' }
    ],
    monuments: [
        { id: 'brihadeeswarar', name: 'Big Temple', tag: 'UNESCO Peak', image: '/where-to-go/big_temple.jpg', location: 'Thanjavur', bestTime: 'Oct - March', occasions: 'Spiritual', budget: '₹2k - ₹8k+' },
        { id: 'shore-temple', name: 'Shore Temple', tag: 'Pallava Pride', image: '/where-to-go/shore temple.jpg', location: 'Mamallapuram', bestTime: 'Dec - Feb', occasions: 'Sculptures', budget: '₹2k - ₹7k+' },
        { id: 'gangaikonda', name: 'Gangaikonda', tag: 'Chola Capital', image: '/where-to-go/Gangai-Konda-Cholapuram.jpg', location: 'Ariyalur', bestTime: 'Winter', occasions: 'History', budget: '₹1k - ₹4k' },
        { id: 'fort-st-george', name: 'Fort St. George', tag: 'British Roots', image: '/where-to-go/fort st george.jpg', location: 'Chennai', bestTime: 'Nov - Feb', occasions: 'Colonial History', budget: '₹500 - ₹2k' },
        { id: 'gingee-fort', name: 'Gingee Fort', tag: 'Troy of East', image: '/where-to-go/gingee.jpg', location: 'Villupuram', bestTime: 'Winter', occasions: 'Trekking', budget: '₹1k - ₹3k' },
        { id: 'vellore-fort', name: 'Vellore Fort', tag: 'Military Marvel', image: '/where-to-go/vellore_fort.jpg', location: 'Vellore', bestTime: 'Oct - Feb', occasions: 'Family / History', budget: '₹1k - ₹4k' },
        { id: 'thirumalai-palace', name: 'Nayakkar Palace', tag: 'Royal Glow', image: '/where-to-go/nayakkar palave.jpg', location: 'Madurai', bestTime: 'Any Day', occasions: 'Royal Walk', budget: '₹200 - ₹1k' },
        { id: 'chettinad-mansions', name: 'Chettinad Mansions', tag: 'Grand Heritage', image: '/where-to-go/chettinad mansion2.jpg', location: 'Karaikudi', bestTime: 'Winter', occasions: 'Culture / Food', budget: '₹5k - ₹15k+' }
    ],
    religious: [
        { id: 'meenakshi-temple', name: 'Meenakshi Amman', tag: 'Divine Energy', image: '/where-to-go/meenakshi.jpg', location: 'Madurai', bestTime: 'Winter', occasions: 'Spiritual', budget: '₹3k - ₹10k+' },
        { id: 'palani', name: 'Palani Murugan', tag: 'Hill Shrine', image: '/where-to-go/palaani.jpg', location: 'Palani', bestTime: 'All Year', occasions: 'Vows / Devotion', budget: '₹2k - ₹6k' },
        { id: 'chidambaram', name: 'Nataraja Temple', tag: 'Cosmic Dance', image: '/where-to-go/nataraja temple.avif', location: 'Chidambaram', bestTime: 'Winter', occasions: 'Arts / Prayer', budget: '₹2k - ₹6k' },
        { id: 'velankanni', name: 'Velankanni', tag: 'Lady of Health', image: '/where-to-go/velankanni.jpg', location: 'Nagapattinam', bestTime: 'Sept - May', occasions: 'Faith Healing', budget: '₹3k - ₹8k' },
        { id: 'nagore', name: 'Nagore Dargah', tag: 'Unity Soul', image: '/where-to-go/nagore dargah.jpg', location: 'Nagore', bestTime: 'All Year', occasions: 'Peace', budget: '₹2k - ₹5k' },
        { id: 'golden-temple', name: 'Sripuram', tag: 'Golden Glory', image: '/where-to-go/sripuram.webp', location: 'Vellore', bestTime: 'Best in Eve', occasions: 'Spiritual', budget: '₹1k - ₹4k' },
        { id: 'srirangam', name: 'Srirangam Temple', tag: 'World Large Temple', image: '/where-to-go/srirangam.jpg', location: 'Trichy', bestTime: 'All Year', occasions: 'Vaishnavism', budget: '₹2k - ₹7k' },
        { id: 'iskcon', name: 'ISKCON Chennai', tag: 'Radha Krishna', image: '/where-to-go/iSKCON.jpg', location: 'ECR Chennai', bestTime: 'Eve', occasions: 'Meditation', budget: '₹200 - ₹2k' }
    ],
    museums: [
        { id: 'govt-museum', name: 'Govt Museum', tag: 'Heritage Treasure', image: '/where-to-go/govtmuseum.jpg', location: 'Chennai', bestTime: 'Any Day', occasions: 'Knowledge', budget: '₹200' },
        { id: 'dakshinachitra', name: 'DakshinaChitra', tag: 'Living History', image: '/where-to-go/culture.jpg', location: 'ECR', bestTime: 'Winter', occasions: 'Art / Culture', budget: '₹500 - ₹1k' },
        { id: 'gandhi-museum', name: 'Gandhi Museum', tag: 'Freedom Stride', image: '/where-to-go/gandhi_musueum.jpg', location: 'Madurai', bestTime: 'Any Day', occasions: 'History', budget: '₹100' },
        { id: 'rail-museum', name: 'Rail Museum', tag: 'Old Tracks', image: '/where-to-go/rail museuem.jpg', location: 'Chennai', bestTime: 'Kids Fav', occasions: 'Educational', budget: '₹100' }
    ],
    dams: [
        { id: 'mettur-dam', name: 'Mettur Dam', tag: 'Stanley Resrv', image: '/where-to-go/mettur.jpg', location: 'Salem', bestTime: 'Monsoon', occasions: 'Picnic', budget: '₹1k - ₹3k' },
        { id: 'vaigai-dam', name: 'Vaigai Dam', tag: 'Madurai Life', image: '/where-to-go/vaigai.jpg', location: 'Theni', bestTime: 'Winter', occasions: 'Gardens', budget: '₹1k - ₹3k' },
        { id: 'kallanai', name: 'Kallanai', tag: 'Grand Anicut', image: '/where-to-go/kalanai.jpg', location: 'Trichy', bestTime: 'Monsoon', occasions: '2000yrs Legacy', budget: '₹1k' }
    ],
    wildlife: [
        { id: 'mudumalai-res', name: 'Mudumalai', tag: 'Tiger Habitat', image: '/where-to-go/mudhumalai.jpg', location: 'Nilgiris', bestTime: 'Oct - May', occasions: 'Safari', budget: '₹5k - ₹12k' },
        { id: 'vedanthangal', name: 'Vedanthangal', tag: 'Bird Haven', image: '/where-to-go/vedanthangal.jpg', location: 'Chengalpattu', bestTime: 'Nov - Feb', occasions: 'Bird Watching', budget: '₹500 - ₹2k' },
        { id: 'anamalai-wild', name: 'Anamalai', tag: 'Wild Trails', image: '/where-to-go/anaimalai.jpg', location: 'Coimbatore', bestTime: 'Winter', occasions: 'Nature Safari', budget: '₹6k - ₹15k+' }
    ],
    adventure: [
        { id: 'yelagiri-para', name: 'Yelagiri Para', tag: 'Fly High', image: '/where-to-go/yelagiri.jpg', location: 'Vellore', bestTime: 'Feb - Mar', occasions: 'Adventure', budget: '₹5k - ₹12k' },
        { id: 'kolukkumalai', name: 'Kolukkumalai', tag: 'Highest Tea', image: '/where-to-go/kolukumalai.jpg', location: 'Theni Border', bestTime: 'Eve / Morn', occasions: 'Sunrise Trek', budget: '₹3k - ₹8k' },
        { id: 'rameswaram-scuba', name: 'Scuba Diving', tag: 'Deep Sea', image: '/where-to-go/rameshawaram.jpg', location: 'Rameswaram', bestTime: 'Summer', occasions: 'Underwater', budget: '₹6k - ₹15k' }
    ],
    food: [
        { id: 'dindigul-bir', name: 'Dindigul Biryani', tag: 'Legendary Style', image: '/where-to-go/briyani.jpg', location: 'Dindigul', bestTime: 'All Year', occasions: 'Foodies', budget: '₹300 - ₹1k' },
        { id: 'madurai-jig', name: 'Jigarthanda', tag: 'Madurai Special', image: '/where-to-go/jigarthanda.jpg', location: 'Madurai', bestTime: 'Summer', occasions: 'Refreshing', budget: '₹100 - ₹500' },
        { id: 'filter-coffee', name: 'Filter Coffee', tag: 'Kumbakonam Fav', image: '/where-to-go/cofeee.jpg', location: 'TN Homes', bestTime: 'Morning', occasions: 'Daily Energy', budget: '₹50 - ₹150' }
    ],
    culture: [
        { id: 'pongal-fest', name: 'Pongal', tag: 'Traditional', image: '/where-to-go/pongal.jpg', location: 'Villages', bestTime: 'Jan 14-17', occasions: 'Harvest', budget: 'N/A' },
        { id: 'jallikattu', name: 'Jallikattu', tag: 'Brave Sport', image: '/where-to-go/jallikatu.jpg', location: 'Alanganallur', bestTime: 'January', occasions: 'Courage', budget: 'N/A' },
        { id: 'bharatanatyam', name: 'Classical Dance', tag: 'Divine Art', image: '/where-to-go/bharathanattiyam.jpg', location: 'Chidambaram', bestTime: 'March', occasions: 'Tradition', budget: 'N/A' }
    ]
};

const WhereToGo = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(1);
    const scrollRef = useRef(null);
    const resultsRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleScroll = () => {
            if (scrollRef.current) {
                const scrollLeft = scrollRef.current.scrollLeft;
                const cardWidth = 285; // Card width + gap
                const index = Math.round(scrollLeft / cardWidth) + 1;
                setCurrentIndex(Math.min(Math.max(index, 1), 10));
            }
        };

        const slider = scrollRef.current;
        if (slider) {
            slider.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (slider) slider.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleCategoryClick = (catId) => {
        setActiveCategory(catId);
        // We only scroll if the category results weren't already visible to avoid confusion
        if (!activeCategory) {
            setTimeout(() => {
                if (resultsRef.current) {
                    resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    const handlePlanTrip = (placeName) => {
        // Navigate to PlanTrip page with the destination pre-filled if possible
        // For now, simple navigation to the tool
        navigate('/plan-trip');
    };

    const handleNext = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    return (
        <div className="where-to-go-redesign">
            <Navbar />

            {/* Fullscreen Hero Section */}
            <section className="wtg-hero-fullscreen">
                <div className="hero-overlay"></div>

                <div className="wtg-hero-content-wrapper">
                    {/* Left Side: Content */}
                    <div className="hero-left-sidebar">
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="hero-tag">Travel Website</span>
                            <h1>NEVER STOP <br /> EXPLORING THE <br /> WORLD.</h1>
                            <p>Discover the hidden gems of Tamil Nadu. Immersive travel experiences at your fingertips.</p>
                            <button className="hero-cta-btn">LEARN MORE</button>
                        </motion.div>
                    </div>

                    {/* Right Side: Embedded Horizontal Slider */}
                    <div className="hero-right-slider">
                        <div className="slider-container" ref={scrollRef}>
                            <div className="slider-track">
                                {categories.map((cat, index) => (
                                    <motion.div
                                        key={cat.id}
                                        className={`cat-card-item ${activeCategory === cat.id ? 'active' : ''}`}
                                        whileHover={{ y: -15, scale: 1.05 }}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="cat-card-inner">
                                            <img
                                                src={cat.img}
                                                alt={cat.name}
                                                crossOrigin="anonymous"
                                                onError={(e) => e.target.src = `https://via.placeholder.com/400x600/333/fff?text=${cat.name}`}
                                            />
                                            <div className="cat-card-overlay">
                                                <h3>{cat.name}</h3>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="slider-controls">
                            <button className="ctrl-btn prev" onClick={handlePrev}>
                                <i className="fa-solid fa-arrow-left"></i>
                            </button>
                            <div className="slider-line">
                                <div className="line-progress" style={{ width: `${(currentIndex / 10) * 100}%` }}></div>
                            </div>
                            <button className="ctrl-btn next" onClick={handleNext}>
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>
                            <span className="slider-count">{currentIndex.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Results Section */}
            <main className="wtg-main-exploration" ref={resultsRef}>
                <AnimatePresence mode="wait">
                    {activeCategory ? (
                        <motion.section
                            key={activeCategory}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="category-detail-section"
                        >
                            {(() => {
                                const cat = categories.find(c => c.id === activeCategory);
                                return (
                                    <>
                                        <div className="section-header-flat">
                                            <h2>{cat.emoji} {cat.title}</h2>
                                            <p>Showing exclusive destinations for {cat.name}.</p>
                                        </div>

                                        <div className="places-grid-premium">
                                            {(placesData[activeCategory] || []).map((place) => (
                                                <div key={place.id} className="premium-place-card" onClick={() => setSelectedPlace(place)}>
                                                    <div className="card-top">
                                                        <img src={place.image} alt={place.name} />
                                                        <span className="p-tag">{place.tag}</span>
                                                    </div>
                                                    <div className="card-bottom">
                                                        <h3>{place.name}</h3>
                                                        <i className="fa-solid fa-chevron-right"></i>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.section>
                    ) : (
                        <div className="empty-state-wtg">
                            <div className="empty-icon">📍</div>
                            <h3>Start Your Exploration</h3>
                            <p>Click on any category in the slider above to discover amazing places.</p>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Place Detail Modal */}
            <AnimatePresence>
                {selectedPlace && (
                    <motion.div
                        className="wtg-modal-overlay"
                        onClick={() => setSelectedPlace(null)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="wtg-modal-content premium-styled-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header-main">
                                <div className="header-left">
                                    <i className="fa-solid fa-map-location-dot"></i>
                                    <h2>Destination Details</h2>
                                </div>
                                <button className="close-modal-btn" onClick={() => setSelectedPlace(null)}>&times;</button>
                            </div>

                            <div className="modal-body-scrollable">
                                {/* Top Image Section */}
                                <div className="modal-hero-image">
                                    <img src={selectedPlace.image} alt={selectedPlace.name} />
                                    <div className="image-info-overlay">
                                        <h1>{selectedPlace.name}</h1>
                                        <span><i className="fa-solid fa-location-dot"></i> {selectedPlace.location || 'Tamil Nadu'}</span>
                                    </div>
                                </div>

                                <div className="modal-grid-sections">
                                    {/* Basic Info Section */}
                                    <div className="modal-info-block">
                                        <h3><i className="fa-solid fa-thumbtack"></i> Basic Info</h3>
                                        <div className="info-fields-grid">
                                            <div className="field-item">
                                                <label>CATEGORY</label>
                                                <p>{categories.find(c => c.id === activeCategory)?.name || 'Destination'}</p>
                                            </div>
                                            <div className="field-item">
                                                <label>BEST TIME TO VISIT</label>
                                                <p>{selectedPlace.bestTime || 'Oct - March'}</p>
                                            </div>
                                            <div className="field-item">
                                                <label>LOCATION</label>
                                                <p>{selectedPlace.location || 'Tamil Nadu'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Travel Specs Section */}
                                    <div className="modal-info-block">
                                        <h3><i className="fa-solid fa-rocket"></i> Travel Specs</h3>
                                        <div className="info-fields-grid">
                                            <div className="field-item">
                                                <label>SPECIAL OCCASION</label>
                                                <p>{selectedPlace.occasions || 'Family / Honeymoon'}</p>
                                            </div>
                                            <div className="field-item">
                                                <label>TRAVEL VIBE</label>
                                                <p>{selectedPlace.tag || 'Relaxing'}</p>
                                            </div>
                                            <div className="field-item">
                                                <label>TRANSPORT MODE</label>
                                                <p>Car / Train / Bus</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Budget Section */}
                                <div className="modal-info-block budget-full-width">
                                    <h3><i className="fa-solid fa-sack-dollar"></i> Estimated Budget Breakdown</h3>
                                    <div className="budget-cards-row">
                                        <div className="budget-mini-card">
                                            <label>MIN BUDGET (₹)</label>
                                            <div className="budget-val">₹{selectedPlace.budget?.split('-')[0]?.replace('₹', '')?.trim() || '2000'}</div>
                                        </div>
                                        <div className="budget-mini-card">
                                            <label>AVG BUDGET (₹)</label>
                                            <div className="budget-val">₹{selectedPlace.budget?.split('-')[1]?.split('+')[0]?.replace('₹', '')?.trim() || '8000'}</div>
                                        </div>
                                        <div className="budget-mini-card">
                                            <label>LUXURY (₹)</label>
                                            <div className="budget-val">₹15,000+</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Section */}
                                <div className="modal-info-block map-full-width">
                                    <h3><i className="fa-solid fa-map"></i> Interactive Guide Map</h3>
                                    <div className="map-embed-container">
                                        <iframe
                                            title="Destination Map"
                                            width="100%"
                                            height="350"
                                            frameBorder="0"
                                            style={{ border: 0, borderRadius: '15px' }}
                                            src={`https://www.google.com/maps?q=${encodeURIComponent(selectedPlace.name + ', ' + (selectedPlace.location || 'Tamil Nadu'))}&output=embed`}
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer-actions">
                                <button className="modal-action-btn cancel" onClick={() => setSelectedPlace(null)}>Close</button>
                                <button className="modal-action-btn primary" onClick={() => handlePlanTrip(selectedPlace.name)}>Plan This Trip</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default WhereToGo;
