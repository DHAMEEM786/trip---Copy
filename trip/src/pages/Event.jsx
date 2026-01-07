import React, { useEffect, useState, useRef } from 'react';
import { usePageTitle, usePageStyle } from '../hooks';
import Footer from '../components/Footer';

const Event = () => {
    usePageTitle('Vibrant Voyages | Premium Events');
    usePageStyle('/event/style.css');

    const [currentCategory, setCurrentCategory] = useState('all');
    const [city, setCity] = useState('');
    const [currentCityName, setCurrentCityName] = useState('Tamil Nadu');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Modal state
    const [modalActive, setModalActive] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [modalImage, setModalImage] = useState('');

    const placesService = useRef(null);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
        }
    }, []);

    const fetchPlaces = (query) => {
        return new Promise((resolve, reject) => {
            if (!placesService.current) {
                // Try initializing again
                if (window.google && window.google.maps && window.google.maps.places) {
                    placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
                } else {
                    resolve([]); // API not ready
                    return;
                }
            }

            const request = {
                query: query,
                fields: ['name', 'photos', 'rating', 'formatted_address', 'place_id', 'types']
            };

            placesService.current.textSearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve(results);
                } else {
                    resolve([]);
                }
            });
        });
    };

    const handleSearch = async (overrideCity = null, overrideCategory = null) => {
        const searchCity = overrideCity !== null ? overrideCity : city;
        const searchCategory = overrideCategory !== null ? overrideCategory : currentCategory;

        if (!searchCity && searchCity !== '') {
            // If implicit search (Tamil Nadu default), keep going maybe? But script required city input.
            // Script said "if (!city) return".
            if (!city) return;
        }

        const effectiveCity = searchCity || currentCityName;

        setLoading(true);
        setError('');
        setPlaces([]);
        setCurrentCityName(effectiveCity);

        try {
            let query = '';
            switch (searchCategory) {
                case 'festival': query = `festivals in ${effectiveCity}`; break;
                case 'music': query = `music venues and concerts in ${effectiveCity}`; break;
                case 'culture': query = `cultural centers and museums in ${effectiveCity}`; break;
                case 'nightlife': query = `nightlife and clubs in ${effectiveCity}`; break;
                default: query = `tourist attractions in ${effectiveCity}`; break;
            }

            const results = await fetchPlaces(query);

            if (results.length === 0) {
                setError(`No ${searchCategory !== 'all' ? searchCategory : ''} events found in "${effectiveCity}". Try another category.`);
            } else {
                setPlaces(results);
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (cat) => {
        setCurrentCategory(cat);
        // Only trigger search if we already have a city
        if (city) {
            handleSearch(null, cat);
        } else if (currentCityName !== 'Tamil Nadu') {
            handleSearch(currentCityName, cat);
        }
    };

    const openModal = (place) => {
        let photoUrl;
        if (place.photos && place.photos.length > 0) {
            photoUrl = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
        } else {
            photoUrl = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000';
        }
        setModalImage(photoUrl);
        setSelectedPlace(place);
        setModalActive(true);
    };

    return (
        <main>
            <header className="hero">
                <h1>Unforgettable <br /> <span>Experiences</span></h1>
                <p>Curated events and hidden gems in Tamil Nadu's most vibrant cities.</p>

                <div className="search-container">
                    <input
                        type="text"
                        id="city-search"
                        placeholder="Search city (e.g., Chennai, Madurai)..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button id="search-btn" onClick={() => handleSearch()}>Explore</button>
                </div>
            </header>

            <div className="filter-container">
                {['all', 'festival', 'music', 'culture', 'nightlife'].map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${currentCategory === cat ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat)}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="section-header">
                <h2 className="section-title">Trending in <span id="city-name">{currentCityName}</span></h2>
            </div>

            <div className="gallery-grid" id="gallery">
                {places.map((place, index) => {
                    let photoUrl;
                    if (place.photos && place.photos.length > 0) {
                        // eslint-disable-next-line no-unused-vars
                        photoUrl = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
                    } else {
                        photoUrl = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000';
                    }

                    const type = place.types ? place.types[0].replace(/_/g, ' ') : 'Event';

                    return (
                        <div
                            key={place.place_id}
                            className="card"
                            style={{ animation: `fadeInUp 0.6s ease forwards ${index * 0.1}s`, opacity: 0 }}
                            onClick={() => openModal(place)}
                        >
                            <div className="card-image-container">
                                <img src={photoUrl} alt={place.name} className="card-image" />
                                <div className="card-overlay">{type}</div>
                            </div>
                            <div className="card-content">
                                <div>
                                    <h3 className="card-title">{place.name}</h3>
                                    <div className="card-meta">
                                        {place.rating && <span className="card-rating"><i className="fa-solid fa-star"></i> {place.rating}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div id="loading">
                    <div className="loader"></div>
                </div>
            )}

            {!loading && error && (
                <div id="error-message" style={{ display: 'block' }}>{error}</div>
            )}

            {/* Modal */}
            <div id="event-modal" className={`modal ${modalActive ? 'active' : ''}`} onClick={(e) => { if (e.target.id === 'event-modal') setModalActive(false) }}>
                <div className="modal-content">
                    <div className="close-modal" onClick={() => setModalActive(false)}>&times;</div>
                    {selectedPlace && (
                        <>
                            <div className="modal-image-col">
                                <img id="modal-image" src={modalImage} alt="Event Image" />
                            </div>
                            <div className="modal-info-col">
                                <h2 id="modal-title">{selectedPlace.name}</h2>
                                <div className="modal-meta">
                                    {selectedPlace.rating && <span id="modal-rating"><i className="fa-solid fa-star"></i> {selectedPlace.rating}</span>}
                                    <span id="modal-category"><i className="fa-solid fa-tag"></i> {selectedPlace.types ? selectedPlace.types[0].replace(/_/g, ' ') : 'Event'}</span>
                                </div>
                                <p id="modal-address"><i className="fa-solid fa-location-dot"></i> <span>{selectedPlace.formatted_address}</span></p>
                                <div className="tags" id="modal-tags"></div>
                                <p id="modal-description">Experience the magic of this destination. Perfect for travelers seeking culture, excitement, and unforgettable memories.</p>

                                <a
                                    href={`https://www.google.com/maps/place/?q=place_id:${selectedPlace.place_id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    id="maps-link"
                                    className="btn-primary"
                                >
                                    <i className="fa-solid fa-map-location-dot"></i> View Location
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <Footer />
        </main>
    );
};

export default Event;
