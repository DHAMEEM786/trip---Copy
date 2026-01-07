import React, { createContext, useState, useContext, useEffect } from 'react';

const TripContext = createContext();

export const useTripContext = () => useContext(TripContext);

export const TripProvider = ({ children }) => {
    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Trips State
    const [trips, setTrips] = useState([
        {
            id: 1,
            name: 'Chennai to Madurai',
            date: '2024-12-12',
            endDate: '2024-12-15',
            duration: '3 Days',
            destination: 'Madurai',
            places: ['Meenakshi Temple', 'Thirumalai Nayakkar Mahal'],
            stay: { name: 'Hotel Supreme', nights: 2, cost: 4000 },
            food: { spots: ['Murugan Idli Shop'], cuisine: 'Chettinad', cost: 1500 },
            travelMode: 'Train',
            distance: '460 km',
            travelCost: 500,
            shoppingCost: 0,
            activitiesCost: 500,
            cost: 6500, // Total
            ecoFriendly: true,
            status: 'Completed',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Madurai_Meenakshi_Temple_West_Tower.jpg/640px-Madurai_Meenakshi_Temple_West_Tower.jpg',
        },
        // Initial mock data
        {
            id: 2,
            name: 'Ooty Trip',
            date: '2024-11-05',
            endDate: '2024-11-08',
            duration: '4 Days',
            destination: 'Ooty',
            places: ['Botanical Gardens'],
            stay: { name: 'Sterling Ooty', nights: 3, cost: 6000 },
            food: { spots: ['Earl\'s Secret'], cuisine: 'Continental', cost: 2000 },
            travelMode: 'Bus',
            distance: '550 km',
            travelCost: 1000,
            shoppingCost: 1000,
            activitiesCost: 500,
            cost: 10500,
            ecoFriendly: false,
            status: 'Completed',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ooty_Lake_1.jpg/640px-Ooty_Lake_1.jpg',
        }
    ]);

    // Wallet State
    const [walletPoints, setWalletPoints] = useState(1250);
    const [walletHistory, setWalletHistory] = useState([
        { id: 1, desc: 'Used Public Transport', points: 50, date: '12 Dec' },
        { id: 2, desc: 'Visited Eco-Park', points: 100, date: '10 Dec' }
    ]);
    const [submittedProofs, setSubmittedProofs] = useState([]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
        // We can apply class to body if needed, or handle in components
        document.body.classList.toggle('dark-theme');
    };

    const addTrip = (newTrip) => {
        setTrips(prev => [newTrip, ...prev]);
    };

    const addWalletPoints = (points, description) => {
        setWalletPoints(prev => prev + points);
        setWalletHistory(prev => [{ id: Date.now(), desc: description, points, date: new Date().toLocaleDateString() }, ...prev]);
    };

    const submitEcoProof = (proof) => {
        setSubmittedProofs(prev => [proof, ...prev]);
        // Auto-reward for demo purposes
        setTimeout(() => {
            addWalletPoints(50, `Eco Proof Verified: ${proof.type}`);
        }, 2000);
    };

    return (
        <TripContext.Provider value={{
            isDarkMode,
            toggleTheme,
            trips,
            addTrip,
            walletPoints,
            walletHistory,
            addWalletPoints,
            submitEcoProof,
            submittedProofs
        }}>
            {children}
        </TripContext.Provider>
    );
};
