import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import './Agri.css';

// Import images from assets
import nilgirisTeaImg from '../../../assets/agri/nilgiris_tea.png';
import valparaiCoffeeImg from '../../../assets/agri/valparai_coffee.png';
import pollachiCoconutImg from '../../../assets/agri/pollachi_coconut.png';
import kodaikanalOrganicImg from '../../../assets/agri/kodaikanal_organic.png';
import villageHomeImg from '../../../assets/agri/village_home.png';
import villageLifeHeroImg from '../../../assets/agri/village_life_hero.png';
import villageActivityImg from '../../../assets/agri/village_activity.png';
import natureBgImg from '../../../assets/agri/nature_bg.png';

// Reuse API Key logic
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const agriData = {
    plantations: [
        { id: 1, name: "Nilgiris Tea Estate", location: "Ooty & Coonoor", season: "Year-round", activities: "Tea Tasting, Factory Tour", image: nilgirisTeaImg },
        { id: 2, name: "Valparai Coffee", location: "Anamalai Hills", season: "Oct - Mar", activities: "Coffee Picking, Trekking", image: valparaiCoffeeImg },
        { id: 3, name: "Pollachi Coconut", location: "Coimbatore Dist", season: "Year-round", activities: "Tender Coconut, Bull Cart", image: pollachiCoconutImg },
        { id: 4, name: "Kodaikanal Organic", location: "Palani Hills", season: "Aug - Dec", activities: "Farm to Table, Planting", image: kodaikanalOrganicImg }

    ],

    // Village Life Data
    villageActivities: [
        { id: 1, category: "Arts", title: "Pottery Making Workshop", price: "₹500", duration: "2 Hours", image: villageActivityImg, desc: "Learn to mold clay with Master Potter Kumaran in his traditional studio." },
        { id: 2, category: "Farming", title: "Morning Milking & Feeding", price: "₹200", duration: "1 Hour", image: villageActivityImg, desc: "Start your day by connecting with our gentle cows and learning dairy farming." },
        { id: 3, category: "Culture", title: "Folk Dance performance", price: "₹800", duration: "1.5 Hours", image: villageActivityImg, desc: "Enjoy a vibrant evening of Karagattam and Oyilattam by the village troupe." },
        { id: 4, category: "Food", title: "Traditional Mud Pot Cooking", price: "₹1200", duration: "3 Hours", image: villageActivityImg, desc: "Cook a full Chettinad meal using earthen pots and firewood stoves." },
        { id: 5, category: "Arts", title: "Handloom Weaving Demo", price: "₹300", duration: "1 Hour", image: villageActivityImg, desc: "Watch the intricate process of sari weaving on a traditional handloom." }
    ],

    villageHosts: [
        { id: 1, name: "Lakshmi Amma", role: "Culinary Host", image: villageActivityImg, tags: ["Tamil", "English", "Cooking"] },
        { id: 2, name: "Kumar & Family", role: "Farm Owner", image: villageActivityImg, tags: ["Farming", "Storyteller"] },
        { id: 3, name: "Raja", role: "Artisan Weaver", image: villageActivityImg, tags: ["Weaving", "History"] }
    ]
};

export default function Agri() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeSection = searchParams.get('section'); // 'plantation', 'stay', 'village', 'support'

    // --- Search Logic State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // --- Village State ---
    const [activeCategory, setActiveCategory] = useState('All');

    const servicesRef = useRef({ places: null, map: null });

    // Load Google Maps Script (Only when in plantation, stay, or village view)
    useEffect(() => {
        if (!activeSection || activeSection === 'support') return; // Don't load for support or dashboard

        const loadScript = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                setScriptLoaded(true);
                return;
            }
            if (document.querySelector(`script[src*="${GOOGLE_API_KEY}"]`)) {
                // Script might be loading from another page
                const timer = setInterval(() => {
                    if (window.google && window.google.maps) {
                        setScriptLoaded(true);
                        clearInterval(timer);
                    }
                }, 500);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setScriptLoaded(true);
            document.head.appendChild(script);
        };

        if (GOOGLE_API_KEY) loadScript();
    }, [activeSection]);

    // Init Services
    useEffect(() => {
        if (scriptLoaded && !servicesRef.current.places) {
            const mapDiv = document.createElement('div');
            // Center on Tamil Nadu
            const map = new window.google.maps.Map(mapDiv, { center: { lat: 11.1271, lng: 78.6569 }, zoom: 7 });
            servicesRef.current.map = map;
            servicesRef.current.places = new window.google.maps.places.PlacesService(map);
        }
    }, [scriptLoaded]);

    // Handle Search
    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        if (!servicesRef.current.places) {
            setError('Maps service loading...');
            return;
        }

        setLoading(true);
        setError('');
        setPlaces([]);

        let query = '';
        if (activeSection === 'stay') {
            query = searchTerm.includes('Tamil Nadu') ? `${searchTerm} farm stay resort` : `${searchTerm} farm stay resort in Tamil Nadu`;
        } else if (activeSection === 'village') {
            // COMBINE FILTER + LOCATION
            let categoryTerm = '';
            switch (activeCategory) {
                case 'Arts': categoryTerm = 'Arts and Crafts'; break;
                case 'Farming': categoryTerm = 'Farm visits'; break;
                case 'Culture': categoryTerm = 'Cultural centers temples'; break;
                case 'Food': categoryTerm = 'Traditional food'; break;
                default: categoryTerm = 'Village tourism';
            }
            query = searchTerm.includes('Tamil Nadu') ? `${categoryTerm} in ${searchTerm}` : `${categoryTerm} in ${searchTerm}, Tamil Nadu`;
        } else {
            query = searchTerm.includes('Tamil Nadu') ? searchTerm : `${searchTerm} in Tamil Nadu`;
        }

        console.log("Searching for:", query); // Debug

        const request = {
            query: query,
            fields: ['name', 'geometry', 'photos', 'formatted_address', 'rating', 'place_id']
        };

        servicesRef.current.places.textSearch(request, (results, status) => {
            setLoading(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                setPlaces(results);
            } else {
                setError('No results found. Try broader terms or a different location.');
            }
        });
    };

    // Get Details
    const handleCardClick = (placeId) => {
        if (!servicesRef.current.places) return;
        const request = {
            placeId: placeId,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'photos', 'rating', 'website', 'url', 'editorial_summary', 'geometry']
        };
        servicesRef.current.places.getDetails(request, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setSelectedPlace(place);
            }
        });
    };

    // Helper for Images
    const getPhotoUrl = (photo, maxWidth = 400) => {
        if (photo && typeof photo.getUrl === 'function') {
            return photo.getUrl({ maxWidth });
        }
        return '/assets/agri/nilgiris_tea.png'; // Fallback
    };

    const handleSelect = (topic) => {
        setSearchParams({ section: topic });
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setSearchParams({});
        setPlaces([]); // Clear search on back
        setSearchTerm('');
    };

    const filteredActivities = activeCategory === 'All'
        ? agriData.villageActivities
        : agriData.villageActivities.filter(a => a.category === activeCategory);

    return (
        <div className='agri-page'>


            {!activeSection ? (
                <div className='landing-dashboard'>

                    {/* Panel 1: Explore Our Farms */}
                    <div className='dashboard-panel'>
                        <div className='panel-header'>
                            <h2>Explore Our Farms</h2>
                        </div>
                        <div className='plantation-grid'>
                            {agriData.plantations.map(p => (
                                <div key={p.id} className='plantation-card' onClick={() => handleSelect('plantation')}>
                                    <img src={p.image} className='plantation-img' alt={p.name} />
                                    <div className='plantation-overlay'>
                                        <h3>{p.name}</h3>
                                        <p>{p.location}</p>
                                        <p className='season'>Best: {p.season}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className='panel-footer'>
                            <button className='btn-green' onClick={() => handleSelect('plantation')}>View Details ›</button>
                            <button className='btn-wood'>Book a Visit ›</button>
                        </div>
                    </div>

                    {/* Panel 2: Stay with Farmers */}
                    <div className='dashboard-panel'>
                        <div className='panel-header'>
                            <h2>Stay with Farmers</h2>
                        </div>
                        <div className='stay-hero'>
                            <img src={villageHomeImg} alt="Chettinad Village Home" />
                        </div>
                        <div className='stay-features'>
                            <span className='feature-pill'>🍲 Home-cooked Meals</span>
                            <span className='feature-pill'>🌿 Eco-friendly</span>
                            <span className='feature-pill'>👨‍👩‍👧 Family Friendly</span>
                        </div>
                        <div className='stay-pricing'>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>From ₹2500 / Night</span>
                            <button className='btn-green' onClick={() => handleSelect('stay')}>Check Availability</button>
                            <button className='btn-wood'>Book Now</button>
                        </div>
                    </div>

                    {/* Panel 3: Experience Village Life */}
                    <div className='dashboard-panel'>
                        <div className='panel-header'>
                            <h2>Experience Village Life</h2>
                        </div>
                        <div className='village-icons'>
                            <div className='v-icon'><span>🏺</span><span className='v-label'>Pottery Making</span></div>
                            <div className='v-icon'><span>🐂</span><span className='v-label'>Bullock Cart</span></div>
                            <div className='v-icon'><span>🧵</span><span className='v-label'>Handloom Weaving</span></div>
                            <div className='v-icon'><span>💃</span><span className='v-label'>Folk Dance</span></div>
                        </div>
                        <img src={villageLifeHeroImg} className='village-scene' alt="Village Life" />
                        <div className='panel-footer'>
                            <button className='btn-green' onClick={() => handleSelect('village')}>View Activities ›</button>
                            <button className='btn-wood'>Book Experience ›</button>
                        </div>
                    </div>



                </div>
            ) : (
                <div className='detail-container'>
                    <button className='btn-wood' onClick={handleBack}>← Back to Dashboard</button>

                    <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s' }}>

                        {/* SEARCH ENABLED PLANTATION VIEW */}
                        {activeSection === 'plantation' && (
                            <div className='dashboard-panel' style={{ padding: '30px', minHeight: '600px' }}>
                                <div className='panel-header' style={{ marginBottom: '30px' }}>
                                    <h2>Find Farms & Estates</h2>
                                </div>

                                <div className='search-container'>
                                    <div className='search-input-wrapper'>
                                        <i className="fa-solid fa-search search-icon"></i>
                                        <input
                                            type='text'
                                            className='search-input'
                                            placeholder='Search farms (e.g. "Coffee Estate Valparai")'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <button className='search-btn' onClick={handleSearch} disabled={loading}>
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>

                                {error && <div className='error-state'><p>{error}</p></div>}

                                {/* Default Featured List if no search */}
                                {!loading && places.length === 0 && !error && (
                                    <div>
                                        <h3 style={{ marginBottom: '20px', color: '#666' }}>Featured Destinations</h3>
                                        <div className='places-grid'>
                                            {agriData.plantations.map(p => (
                                                <div key={p.id} className='place-card' onClick={() => setSearchTerm(p.name + " " + p.location)}>
                                                    <img src={p.image} className='place-image' alt={p.name} />
                                                    <div className='place-content'>
                                                        <h3 className='place-name'>{p.name}</h3>
                                                        <p className='place-address'>{p.location}</p>
                                                        <div className='place-meta'>
                                                            <span>{p.activities}</span>
                                                            <span style={{ color: 'green' }}>Featured</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Search Results */}
                                <div className='places-grid'>
                                    {places.map(place => (
                                        <div key={place.place_id} className='place-card' onClick={() => handleCardClick(place.place_id)}>
                                            <img src={getPhotoUrl(place.photos?.[0])} className='place-image' alt={place.name} />
                                            <div className='place-content'>
                                                <h3 className='place-name'>{place.name}</h3>
                                                <p className='place-address'>{place.formatted_address}</p>
                                                <div className='place-meta'>
                                                    <div className='place-rating'>★ {place.rating || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SEARCH ENABLED STAY VIEW */}
                        {activeSection === 'stay' && (
                            <div className='dashboard-panel' style={{ padding: '30px', minHeight: '600px' }}>
                                <div className='panel-header' style={{ marginBottom: '30px' }}>
                                    <h2>Find Farm Stays & Resorts</h2>
                                </div>

                                <div className='search-container'>
                                    <div className='search-input-wrapper'>
                                        <i className="fa-solid fa-search search-icon"></i>
                                        <input
                                            type='text'
                                            className='search-input'
                                            placeholder='Search stays (e.g. "Coimbatore", "Yercaud")'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <button className='search-btn' onClick={handleSearch} disabled={loading}>
                                        {loading ? 'Find Stays' : 'Find Stays'}
                                    </button>
                                </div>

                                {error && <div className='error-state'><p>{error}</p></div>}

                                {!loading && places.length === 0 && !error && (
                                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                        <img src={villageHomeImg} style={{ maxWidth: '100%', borderRadius: '10px', height: '300px', objectFit: 'cover' }} alt="Stay" />
                                        <p style={{ marginTop: '20px', color: '#666' }}>Enter a location to find authentic farm stays and rustic resorts.</p>
                                    </div>
                                )}

                                {/* Search Results */}
                                <div className='places-grid'>
                                    {places.map(place => (
                                        <div key={place.place_id} className='place-card' onClick={() => handleCardClick(place.place_id)}>
                                            <img src={getPhotoUrl(place.photos?.[0])} className='place-image' alt={place.name} />
                                            <div className='place-content'>
                                                <h3 className='place-name'>{place.name}</h3>
                                                <p className='place-address'>{place.formatted_address}</p>
                                                <div className='place-meta'>
                                                    <div className='place-rating'>★ {place.rating || 'N/A'}</div>
                                                    <span style={{ color: 'green', fontSize: '0.8rem' }}>Farm Stay / Resort</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* VILLAGE LIFE SECTION WITH FILTERED SEARCH */}
                        {activeSection === 'village' && (
                            <div className='dashboard-panel' style={{ padding: '40px', minHeight: '800px' }}>
                                <div className='panel-header'>
                                    <h2>Experience Village Life</h2>
                                </div>

                                {/* Category Browser (Acts as Filter) */}
                                <div className='category-browser'>
                                    {['All', 'Arts', 'Farming', 'Culture', 'Food'].map(cat => (
                                        <button
                                            key={cat}
                                            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Search Bar */}
                                <div className='search-container' style={{ maxWidth: '500px' }}>
                                    <div className='search-input-wrapper'>
                                        <i className="fa-solid fa-search search-icon"></i>
                                        <input
                                            type='text'
                                            className='search-input'
                                            placeholder={`Search ${activeCategory === 'All' ? 'Activities' : activeCategory} (e.g. "Chettinad")`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <button className='search-btn' onClick={handleSearch} disabled={loading}>
                                        {loading ? 'Searching...' : 'Explore'}
                                    </button>
                                </div>

                                {error && <div className='error-state'><p>{error}</p></div>}

                                {/* Conditional Rendering: Show Search Results OR Default Rich Content */}
                                {places.length > 0 ? (
                                    <div style={{ marginTop: '30px' }}>
                                        <h3 style={{ marginBottom: '20px' }}>
                                            Found {places.length} {activeCategory !== 'All' ? activeCategory : 'Village'} experiences in "{searchTerm}"
                                        </h3>
                                        <div className='places-grid'>
                                            {places.map(place => (
                                                <div key={place.place_id} className='place-card' onClick={() => handleCardClick(place.place_id)}>
                                                    <img src={getPhotoUrl(place.photos?.[0])} className='place-image' alt={place.name} />
                                                    <div className='place-content'>
                                                        <h3 className='place-name'>{place.name}</h3>
                                                        <p className='place-address'>{place.formatted_address}</p>
                                                        <div className='place-meta'>
                                                            <div className='place-rating'>★ {place.rating || 'N/A'}</div>
                                                            <span style={{ color: 'green', fontSize: '0.8rem' }}>{activeCategory}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                            <button className='btn-wood' onClick={() => setPlaces([])}>Clear Results & Show Timeline</button>
                                        </div>
                                    </div>
                                ) : (
                                    !loading && (
                                        <div className='animate-fade-in'>
                                            {/* Enhanced Activity Grid */}
                                            <div className='activity-grid'>
                                                {filteredActivities.map(act => (
                                                    <div key={act.id} className='activity-card'>
                                                        <div className='eco-badge'>🌿 Eco-Friendly</div>
                                                        <img src={act.image} className='activity-img' alt={act.title} />
                                                        <div className='activity-content'>
                                                            <div className='activity-header'>
                                                                <h3 className='activity-title'>{act.title}</h3>
                                                                <span className='activity-price'>{act.price}</span>
                                                            </div>
                                                            <p className='activity-details'>{act.desc}</p>
                                                            <div className='activity-meta'>
                                                                <span>⏱ {act.duration}</span>
                                                                <span>👥 Small Groups</span>
                                                                <span>⭐ 4.9 (120 Reviews)</span>
                                                            </div>
                                                            <button className='btn-green' style={{ width: '100%', marginTop: 'auto' }}>Book Experience</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>



                                            {/* Map & Hosts Grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '50px' }}>
                                                <div className='village-map-container'>
                                                    <div className='map-overlay-text'>
                                                        <h3 style={{ margin: 0, fontFamily: 'Merriweather' }}>Village Map</h3>
                                                        <p style={{ margin: '5px 0 0' }}>Interactive Map coming soon</p>
                                                        <button className='btn-green' style={{ marginTop: '10px' }}>Download Map PDF</button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className='timeline-title' style={{ textAlign: 'left', marginBottom: '20px' }}>Meet Your Hosts</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                        {agriData.villageHosts.map(host => (
                                                            <div key={host.id} style={{ display: 'flex', gap: '15px', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                                                <img src={host.image} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} alt={host.name} />
                                                                <div>
                                                                    <h4 style={{ margin: '0 0 5px', fontFamily: 'Merriweather' }}>{host.name}</h4>
                                                                    <span style={{ color: 'green', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{host.role}</span>
                                                                    <div style={{ marginTop: '5px' }}>
                                                                        {host.tags.map(tag => (
                                                                            <span key={tag} style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', marginRight: '5px', color: '#666' }}>{tag}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}

                            </div>
                        )}


                    </div>

                    {/* DETAILS MODAL */}
                    {selectedPlace && (
                        <div className="modal-overlay" onClick={() => setSelectedPlace(null)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <button className="close-modal" onClick={() => setSelectedPlace(null)}>&times;</button>
                                <img
                                    src={getPhotoUrl(selectedPlace.photos?.[0], 800)}
                                    className="modal-header-image"
                                    alt={selectedPlace.name}
                                />
                                <div className="modal-body">
                                    <h2 className="modal-title">{selectedPlace.name}</h2>
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>{selectedPlace.formatted_address}</p>

                                    <div className="info-grid">
                                        <div className="info-item">
                                            <div className="info-icon">⭐</div>
                                            <div><h4>Rating</h4><p>{selectedPlace.rating} / 5</p></div>
                                        </div>
                                        {selectedPlace.formatted_phone_number && (
                                            <div className="info-item">
                                                <div className="info-icon">📞</div>
                                                <div><h4>Phone</h4><p>{selectedPlace.formatted_phone_number}</p></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="gallery-grid">
                                        {selectedPlace.photos?.slice(1, 5).map((photo, i) => (
                                            <img key={i} src={getPhotoUrl(photo, 300)} className="gallery-img" alt="Gallery" />
                                        ))}
                                    </div>

                                    <a
                                        href={selectedPlace.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-green"
                                        style={{ display: 'inline-block', marginTop: '20px', textAlign: 'center', textDecoration: 'none' }}
                                    >
                                        View on Maps
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
