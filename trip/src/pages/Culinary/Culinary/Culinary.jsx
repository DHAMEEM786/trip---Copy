import React, { useState, useEffect } from 'react';
import './Culinary.css';
import '@fontsource/dancing-script';
import '@fontsource/playfair-display';

// Import images from assets
import chettinadChickenImg from '../../../assets/culinary/chettinad_chicken.jpg';
import kothuParottaImg from '../../../assets/culinary/kothu_parotta.jpg';
import fishCurryImg from '../../../assets/culinary/fish_curry.jpg';
import filterCoffeeImg from '../../../assets/culinary/filter_coffee.jpg';
import heroBgImg from '../../../assets/culinary/hero_bg.jpg';
import headerPremiumImg from '../../../assets/culinary/header_premium.png';
import placeholderFoodImg from '../../../assets/culinary/placeholder_food.jpg';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const regions = [
    { id: 'chettinad', name: 'Chettinad', desc: 'Spicy, aromatic, and rich in heritage.' },
    { id: 'kongu', name: 'Kongu Nadu', desc: 'Simple, healthy, and using native ingredients.' },
    { id: 'madurai', name: 'Madurai', desc: 'Street food paradise with bold flavors.' },
    { id: 'coastal', name: 'Coastal', desc: 'Fresh seafood with tangy tamarind notes.' }
];

const popularDishes = [
    { id: 1, name: 'Chettinad Chicken', region: 'chettinad', img: chettinadChickenImg },
    { id: 2, name: 'Kothu Parotta', region: 'madurai', img: kothuParottaImg },
    { id: 3, name: 'Fish Curry', region: 'coastal', img: fishCurryImg },
    { id: 4, name: 'Filter Coffee', region: 'all', img: filterCoffeeImg },
];

export default function Culinary() {
    const [activeRegion, setActiveRegion] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // New state for details view
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
            script.async = true;
            script.onload = () => setMapLoaded(true);
            document.body.appendChild(script);
        } else {
            setMapLoaded(true);
        }
    }, []);

    const handleSearch = (queryOverride) => {
        if (!mapLoaded) return;

        let query = queryOverride || searchTerm;
        const regionQuery = activeRegion && activeRegion !== 'All' && activeRegion !== 'Region' ? activeRegion : '';

        // Contextual fallback
        let searchBase = query;
        if (!searchBase) {
            if (regionQuery) {
                searchBase = regionQuery;
            } else {
                searchBase = "Tamil Nadu";
            }
        }

        // Construct a more effective query for food/restaurants
        // The user specifically wants "food images", so searching for "famous food" or "dishes"
        // typically returns places known for that specific item, often with food photos.
        const searchText = `famous food in ${searchBase}`;

        console.log("Searching for:", searchText);

        setLoading(true);
        setPlaces([]);
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));

        const commonFields = ['name', 'formatted_address', 'photos', 'rating', 'place_id', 'geometry', 'user_ratings_total', 'types'];

        // Helper to wrap textSearch in a Promise
        const searchAsync = (text) => {
            return new Promise((resolve) => {
                const request = {
                    query: text,
                    fields: commonFields,
                    // Removing strict type: 'restaurant' to allow for 'food', 'bakery', 'cafe', etc.
                    // which might yield better food photos than formal restaurants.
                };
                service.textSearch(request, (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                        resolve(results);
                    } else {
                        resolve([]);
                    }
                });
            });
        };

        // Single fetch
        searchAsync(searchText)
            .then((restaurants) => {
                // Take top 20
                let combined = restaurants.slice(0, 20);

                // Deduplicate based on place_id to ensure no repeated places
                const uniquePlaces = Array.from(new Map(combined.map(item => [item.place_id, item])).values());

                setPlaces(uniquePlaces);
                setLoading(false);
            });
    };

    const fetchPlaceDetails = (placeId) => {
        if (!mapLoaded) return;
        setDetailsLoading(true);

        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const request = {
            placeId: placeId,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'opening_hours', 'rating', 'user_ratings_total', 'reviews', 'photos', 'url', 'geometry']
        };

        service.getDetails(request, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setSelectedPlace(place);
            }
            setDetailsLoading(false);
        });
    };

    return (
        <div className="culinary-page">
            {/* Hero Section */}
            <div className="culinary-hero">
                <div className="hero-content">
                    <h1>Discover the Flavors of <br /> <span>Tamil Nadu</span></h1>
                    <p>Experience the rich and diverse culinary delights of Tamil Nadu</p>
                </div>
            </div>

            {/* Food Trails Section */}
            <div className="food-trails-section" id="explore-section">
                <div className="section-header">
                    <h2>Food Trails</h2>
                    <p>Explore by Region</p>
                </div>

                {/* Custom Filters */}
                <div className="trails-filters">
                    {/* Search Input */}
                    <div className="filter-search-wrapper">
                        <input
                            className="filter-search-input"
                            type="text"
                            placeholder="Search places (e.g. Madurai)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <button className="btn-apply-filters" onClick={() => handleSearch()}>Apply Filters</button>
                </div>

                {/* Food Trails Grid or Search Results */}
                {loading ? (
                    <div className="loading-spinner" style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#d35400' }}>
                        Simmering flavors...
                    </div>
                ) : places.length > 0 ? (
                    <div className="search-results-wrapper">
                        <div className="grid-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                            <h2 style={{ fontFamily: 'Playfair Display', color: '#4a3b32', fontSize: '2rem' }}>
                                Top Spots in "{searchTerm || activeRegion || 'Tamil Nadu'}"
                            </h2>
                            <button
                                onClick={() => { setPlaces([]); setSearchTerm(''); }}
                                style={{ padding: '8px 20px', background: '#d35400', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Clear Results
                            </button>
                        </div>
                        <div className="trails-grid">
                            {places.slice(0, 20).map((place, index) => {
                                const styles = ['card-madurai', 'card-chennai', 'card-coimbatore', 'card-chettinad'];
                                const cardStyle = styles[index % styles.length];


                                // Determine fallback image deterministically based on place name length/char
                                // This ensures consistent unique-looking fallbacks without random flicker
                                const fallbacks = [
                                    chettinadChickenImg,
                                    kothuParottaImg,
                                    fishCurryImg,
                                    filterCoffeeImg,
                                    placeholderFoodImg
                                ];
                                const fallbackIndex = place.name.length % fallbacks.length;
                                const fallbackSrc = fallbacks[fallbackIndex];

                                // Use API photo if available, else deterministic fallback
                                const imageSrc = place.photos?.[0]?.getUrl({ maxWidth: 400 }) || fallbackSrc;

                                return (
                                    <div key={place.place_id} className={`trail-card ${cardStyle}`}>
                                        <div className="card-header-bar">{place.name}</div>
                                        <div className="card-images">
                                            <img
                                                src={imageSrc}
                                                alt={place.name}
                                                onError={(e) => e.target.src = 'https://placehold.co/400x300/e74c3c/white?text=Delicious+Food'}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="card-info">
                                            <div className="info-row">
                                                <i className="fas fa-star" style={{ color: '#f1c40f' }}></i>
                                                <div>
                                                    <span className="info-label">Rating</span>
                                                    <span className="info-val">{place.rating ? `${place.rating} (${place.user_ratings_total})` : 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="info-row">
                                                <i className="fas fa-utensils"></i>
                                                <div>
                                                    <span className="info-label">Type</span>
                                                    <span className="info-val">Restaurant</span>
                                                </div>
                                            </div>
                                            <div className="info-row">
                                                <i className="fas fa-map-marker-alt"></i>
                                                <div>
                                                    <span className="info-label">Address</span>
                                                    <span className="info-val" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>{place.formatted_address?.split(',')[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn-explore-trail" onClick={() => fetchPlaceDetails(place.place_id)}>View Details</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="trails-grid">
                        {/* Madurai Card */}
                        <div className="trail-card card-madurai">
                            <div className="card-header-bar">Madurai</div>
                            <div className="card-images">
                                <img src={placeholderFoodImg} alt="Jigarthanda" onError={(e) => e.target.src = 'https://placehold.co/400x300/e74c3c/white?text=Madurai+Food'} />
                                <img src={kothuParottaImg} alt="Kothu Parotta" onError={(e) => e.target.src = 'https://placehold.co/400x300/c0392b/white?text=Madurai+Street'} />
                            </div>
                            <div className="card-info">
                                <div className="info-row">
                                    <i className="fas fa-utensils"></i>
                                    <div>
                                        <span className="info-label">Signature Dishes</span>
                                        <span className="info-val">Jigarthanda, Kari Dosai</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <span className="info-label">Popular Food Street</span>
                                        <span className="info-val">Jigarthandhar Street</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-cloud-sun"></i>
                                    <div>
                                        <span className="info-label">Best Season</span>
                                        <span className="info-val">All Year</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-explore-trail">Explore Now</button>
                        </div>

                        {/* Chennai Card */}
                        <div className="trail-card card-chennai">
                            <div className="card-header-bar">Chennai</div>
                            <div className="card-images">
                                <img src={placeholderFoodImg} alt="Idli" onError={(e) => e.target.src = 'https://placehold.co/400x300/3498db/white?text=Chennai+Food'} />
                                <img src={placeholderFoodImg} alt="Marina" onError={(e) => e.target.src = 'https://placehold.co/400x300/2980b9/white?text=Marina+Beach'} />
                            </div>
                            <div className="card-info">
                                <div className="info-row">
                                    <i className="fas fa-utensils"></i>
                                    <div>
                                        <span className="info-label">Signature Dishes</span>
                                        <span className="info-val">Idli Sambar, Masala Dosa</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <span className="info-label">Popular Food Street</span>
                                        <span className="info-val">Marina Beach</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-cloud-sun"></i>
                                    <div>
                                        <span className="info-label">Best Season</span>
                                        <span className="info-val">Winter</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-explore-trail">Explore Now</button>
                        </div>

                        {/* Coimbatore Card */}
                        <div className="trail-card card-coimbatore">
                            <div className="card-header-bar">Coimbatore</div>
                            <div className="card-images">
                                <img src={placeholderFoodImg} alt="Kongu Food" onError={(e) => e.target.src = 'https://placehold.co/400x300/2ecc71/white?text=Kongu+Food'} />
                                <img src={placeholderFoodImg} alt="RS Puram" onError={(e) => e.target.src = 'https://placehold.co/400x300/27ae60/white?text=RS+Puram'} />
                            </div>
                            <div className="card-info">
                                <div className="info-row">
                                    <i className="fas fa-utensils"></i>
                                    <div>
                                        <span className="info-label">Signature Dishes</span>
                                        <span className="info-val">Kongu Nadu Special</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <span className="info-label">Popular Food Street</span>
                                        <span className="info-val">RS Puram</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-cloud-rain"></i>
                                    <div>
                                        <span className="info-label">Best Season</span>
                                        <span className="info-val">Monsoon</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-explore-trail">Explore Now</button>
                        </div>

                        {/* Chettinad Card */}
                        <div className="trail-card card-chettinad">
                            <div className="card-header-bar">Chettinad</div>
                            <div className="card-images">
                                <img src={chettinadChickenImg} alt="Chettinad Chicken" onError={(e) => e.target.src = 'https://placehold.co/400x300/c0392b/white?text=Chettinad+Chicken'} />
                                <img src={placeholderFoodImg} alt="Karaikudi" onError={(e) => e.target.src = 'https://placehold.co/400x300/a93226/white?text=Karaikudi'} />
                            </div>
                            <div className="card-info">
                                <div className="info-row">
                                    <i className="fas fa-utensils"></i>
                                    <div>
                                        <span className="info-label">Signature Dishes</span>
                                        <span className="info-val">Chettinad Chicken</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <span className="info-label">Popular Food Street</span>
                                        <span className="info-val">Karaikudi</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-sun"></i>
                                    <div>
                                        <span className="info-label">Best Season</span>
                                        <span className="info-val">Summer</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-explore-trail">Explore Now</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedPlace && (
                <div className="modal-overlay" onClick={() => setSelectedPlace(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedPlace(null)}>×</button>

                        <div className="modal-header">
                            <h2>{selectedPlace.name}</h2>
                            <div className="modal-rating">
                                <span className="stars">★ {selectedPlace.rating}</span>
                                <span className="reviews-count">({selectedPlace.user_ratings_total} reviews)</span>
                            </div>
                            <p className="modal-address">{selectedPlace.formatted_address}</p>
                        </div>

                        <div className="modal-gallery">
                            {selectedPlace.photos?.slice(0, 12).map((photo, i) => (
                                <img key={i} src={photo.getUrl({ maxHeight: 300 })} alt={`${selectedPlace.name} view ${i + 1}`} className={`gallery-img-${i}`} />
                            ))}
                        </div>

                        <div className="modal-details-grid">
                            <div className="info-column">
                                {selectedPlace.formatted_phone_number && (
                                    <div className="info-item">
                                        <strong>Phone:</strong> {selectedPlace.formatted_phone_number}
                                    </div>
                                )}
                                {selectedPlace.website && (
                                    <div className="info-item">
                                        <strong>Website:</strong> <a href={selectedPlace.website} target="_blank" rel="noreferrer">Visit Site</a>
                                    </div>
                                )}
                                {selectedPlace.opening_hours && (
                                    <div className="info-item open-hours">
                                        <strong>Opening Hours:</strong>
                                        <ul>
                                            {selectedPlace.opening_hours.weekday_text?.map((day, i) => <li key={i}>{day}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <a href={selectedPlace.url} target="_blank" rel="noreferrer" className="btn-google-maps">View on Google Maps</a>
                            </div>


                        </div>
                    </div>
                </div>
            )}

            {detailsLoading && (
                <div className="modal-overlay">
                    <div className="loading-spinner">Fetcher details...</div>
                </div>
            )}
        </div>
    );
}
