import React from 'react';
import './Medical.css';

// Import images from assets
import wellnessImg from '../../../assets/medical/wellness.png';
import ayurvedaImg from '../../../assets/medical/ayurveda.png';
import hospitalImg from '../../../assets/medical/hospital.png';

const medicalCategories = [
  {
    id: 1,
    title: "Wellness Retreats",
    subtitle: "Yoga, Meditation & Detox",
    desc: "Restore your body, mind & spirit in the serene hills of Tamil Nadu.",
    img: wellnessImg,
    btnText: "Explore Retreats",
    btnClass: "btn-wellness"
  },
  {
    id: 2,
    title: "Siddha & Ayurveda",
    subtitle: "Traditional Healing Therapies",
    desc: "Experience ancient remedies & expert care for holistic healing.",
    img: ayurvedaImg,
    btnText: "Learn More",
    btnClass: "btn-ayurveda"
  },
  {
    id: 3,
    title: "Hospital Tourism",
    subtitle: "Medical Travel & Care",
    desc: "World-class hospitals offering specialized treatments & full support.",
    img: hospitalImg,
    btnText: "Plan Your Visit",
    btnClass: "btn-hospital"
  }
];

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export default function Medical() {
  const [activeSection, setActiveSection] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [doctorType, setDoctorType] = React.useState(''); // New state for doctor type
  const [places, setPlaces] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  React.useEffect(() => {
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

  const handleSectionClick = (section) => {
    setActiveSection(section);
    setPlaces([]); // Clear previous results
    setSearchTerm('');
    setDoctorType('');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && mapLoaded && searchTerm) {
      setLoading(true);
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));

      let query = '';
      if (activeSection === 'wellness') {
        query = `Yoga Meditation Detox center in ${searchTerm}`;
      } else if (activeSection === 'ayurveda') {
        query = `Siddha Ayurveda Hospital Clinic in ${searchTerm}`;
      } else if (activeSection === 'hospital') {
        query = `Best ${doctorType || 'Specialist'} Hospital in ${searchTerm}`;
      }

      const request = {
        query: query,
        fields: ['name', 'formatted_address', 'photos', 'rating', 'place_id']
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
        }
        setLoading(false);
      });
    }
  };

  let searchTitle = 'Find Your Peace';
  let searchSubtitle = 'Search for Yoga, Meditation & Detox centers';
  let searchPlaceholder = 'Enter location (e.g., Ooty)...';

  if (activeSection === 'ayurveda') {
    searchTitle = 'Ancient Healing';
    searchSubtitle = 'Search for Siddha & Ayurveda Hospitals';
    searchPlaceholder = 'Enter location (e.g., Madurai)...';
  } else if (activeSection === 'hospital') {
    searchTitle = 'World-Class Care';
    searchSubtitle = 'Find Top Specialists & Hospitals';
    searchPlaceholder = 'Enter location (e.g., Chennai)...';
  }

  return (
    <div className='medical-page'>
      <div className='medical-content'>

        {!activeSection ? (
          <>
            <div className='medical-header'>
              <h1>Medical & Wellness Tourism</h1>
              <p>Discover healing and rejuvenation in Tamil Nadu</p>
            </div>

            <div className='cards-container'>
              {medicalCategories.map(cat => (
                <div key={cat.id} className='medical-card'>
                  <div className='card-img-wrapper'>
                    <img src={cat.img} alt={cat.title} />
                  </div>
                  <div className='card-content'>
                    <div>
                      <h3>{cat.title}</h3>
                      <h4>{cat.subtitle}</h4>
                      <p>{cat.desc}</p>
                    </div>
                    <button
                      className={`card-btn ${cat.btnClass}`}
                      onClick={() => {
                        if (cat.id === 1) handleSectionClick('wellness');
                        if (cat.id === 2) handleSectionClick('ayurveda');
                        if (cat.id === 3) handleSectionClick('hospital');
                      }}
                    >
                      {cat.btnText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='wellness-view'>
            <div className='silent-nav'>
              <button className='btn-silent-back' onClick={() => setActiveSection(null)}>← Back to Medical</button>
            </div>

            <div className='silent-header'>
              <h2>{searchTitle}</h2>
              <p>{searchSubtitle}</p>
            </div>

            <div className='silent-search-container'>
              {activeSection === 'hospital' && (
                <select
                  className='silent-input doctor-select'
                  value={doctorType}
                  onChange={(e) => setDoctorType(e.target.value)}
                  style={{ marginBottom: '20px' }}
                >
                  <option value="">Select Doctor / Specialist</option>
                  <option value="Cardiologist">Cardiologist (Heart)</option>
                  <option value="Neurologist">Neurologist (Brain)</option>
                  <option value="Orthopedic Surgeon">Orthopedic (Bones/Joints)</option>
                  <option value="Oncologist">Oncologist (Cancer)</option>
                  <option value="Dermatologist">Dermatologist (Skin)</option>
                  <option value="Pediatrician">Pediatrician (Child)</option>
                  <option value="Gynecologist">Gynecologist (Women)</option>
                  <option value="Dentist">Dentist</option>
                  <option value="ENT Specialist">ENT Specialist</option>
                  <option value="Surgeon">General Surgeon</option>
                </select>
              )}

              <input
                type="text"
                className='silent-input'
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <div className='peace-grid'>
              {loading && <p style={{ textAlign: 'center', color: '#888' }}>Finding places...</p>}

              {!loading && places.map(place => (
                <div key={place.place_id} className='peace-card'>
                  <img
                    src={place.photos?.[0]?.getUrl() || (activeSection === 'wellness' ? wellnessImg : (activeSection === 'ayurveda' ? ayurvedaImg : hospitalImg))}
                    className='peace-img'
                    alt={place.name}
                  />
                  <div className='peace-content'>
                    <h3>{place.name}</h3>
                    <p>{place.formatted_address}</p>
                    {place.rating && <div className='peace-rating'>★ {place.rating}</div>}
                    <button
                      className='btn-view-map'
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.formatted_address)}`, '_blank')}
                    >
                      View on Map 📍
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
