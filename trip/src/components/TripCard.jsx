import React from 'react';

const TripCard = ({ trip, onExplore, onEdit, onDelete }) => {
    return (
        <div className="trip-card">
            <div className="trip-card-image" style={{ backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80'})` }}>
                <div className="trip-card-overlay-actions">
                    <button className="icon-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit Trip">
                        <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete Trip">
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <div className="trip-card-content" onClick={() => onExplore(trip)}>
                <h3 className="trip-card-title">{trip.title}</h3>
                <p style={{ color: '#800020', fontWeight: '600', marginBottom: '8px' }}>{trip.destination}</p>
                <div className="trip-card-info">
                    <span><i className="fa-solid fa-calendar"></i> {trip.startDate}</span>
                    <span><i className="fa-solid fa-indian-rupee-sign"></i> {trip.actualExpenditure}</span>
                </div>
                <div className="trip-card-actions">
                    <button className="btn-details">See Details</button>
                    <button className="btn-explore">Explore <i className="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        </div>
    );
};

export default TripCard;
