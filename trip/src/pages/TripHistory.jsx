import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import AddTripModal from '../components/AddTripModal';
import TripCard from '../components/TripCard';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import './Trips.css';

const TripHistory = () => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tripToEdit, setTripToEdit] = useState(null);
    const detailsRef = useRef(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'users', user.uid, 'trips'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tripsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(tripsData);

            // Self-healing: Sync Wallet Stats with actual Trips data
            const totalBudget = tripsData.reduce((sum, t) => sum + (Number(t.plannedBudget) || 0), 0);
            const totalSpent = tripsData.reduce((sum, t) => sum + (Number(t.actualExpenditure) || 0), 0);

            // We use updateDoc to set absolute values, ensuring consistency
            const walletRef = doc(db, 'users', user.uid, 'wallet', 'summary');
            updateDoc(walletRef, {
                totalTrips: tripsData.length,
                totalBudget: totalBudget,
                totalSpent: totalSpent
            }).catch(err => console.error("Error syncing wallet:", err)); // Catch errors silently to not break UI
        });

        return () => unsubscribe();
    }, []);

    const handleExplore = (trip) => {
        setSelectedTrip(trip);
        setTimeout(() => {
            detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleDelete = async (tripId) => {
        if (window.confirm('Are you sure you want to delete this trip adventure?')) {
            try {
                const tripToDelete = trips.find(t => t.id === tripId);
                const user = auth.currentUser;
                await deleteDoc(doc(db, 'users', user.uid, 'trips', tripId));

                // Update Wallet (Decrement values)
                if (tripToDelete) {
                    const walletRef = doc(db, 'users', user.uid, 'wallet', 'summary');
                    await updateDoc(walletRef, {
                        // Removing manual decrement of stats to avoid race conditions with the snapshot listener
                        // totalTrips: increment(-1),
                        // totalBudget: increment(-(tripToDelete.plannedBudget || 0)),
                        // totalSpent: increment(-(tripToDelete.actualExpenditure || 0)),
                        ecopoints: increment(-50) // Deduct the points awarded for adding the trip
                    });
                }

                if (selectedTrip?.id === tripId) {
                    setSelectedTrip(null);
                }
            } catch (error) {
                console.error("Error deleting trip:", error);
                // Suppress alert as per user request (sometimes wallet update fails but trip deletes fine)
                // alert("Failed to delete trip"); 
            }
        }
    };

    const handleEdit = (trip) => {
        setTripToEdit(trip);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTripToEdit(null);
    };

    return (
        <div className="trips-container">
            <Navbar />

            <section className="trips-hero">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    My Adventures
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Relive your best moments and plan for the next one.
                </motion.p>
                <motion.button
                    className="add-trip-btn"
                    onClick={() => { setTripToEdit(null); setIsModalOpen(true); }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <i className="fa-solid fa-plus"></i> Add Trip
                </motion.button>
            </section>

            <div className="trips-grid">
                {trips.map(trip => (
                    <TripCard
                        key={trip.id}
                        trip={trip}
                        onExplore={handleExplore}
                        onEdit={() => handleEdit(trip)}
                        onDelete={() => handleDelete(trip.id)}
                    />
                ))}
            </div>

            {selectedTrip && (
                <section ref={detailsRef} className="trip-details-expanded">
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{selectedTrip.title}</h2>
                                <p style={{ fontSize: '1.2rem', color: '#800020' }}>{selectedTrip.destination}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p><strong>Duration:</strong> {selectedTrip.duration} Days</p>
                                <p><strong>Transport:</strong> {selectedTrip.transport}</p>
                            </div>
                        </div>

                        <div className="form-grid" style={{ marginBottom: '3rem' }}>
                            <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '20px' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#2d3436' }}>📊 Trip Stats</h3>
                                {(() => {
                                    // Calculate Total Spent (Fallback logic similar to Wallet)
                                    const calcSpent = Number(selectedTrip.actualExpenditure) > 0
                                        ? Number(selectedTrip.actualExpenditure)
                                        : (Number(selectedTrip.foodExpense) || 0) + (Number(selectedTrip.transportExpense) || 0) + (Number(selectedTrip.adventureExpense) || 0) + (Number(selectedTrip.othersExpense) || 0);

                                    const calcBudget = Number(selectedTrip.plannedBudget) || 0;
                                    const calcSaved = calcBudget - calcSpent;

                                    return (
                                        <>
                                            <p><strong>Total Spending:</strong> ₹{calcSpent}</p>
                                            <p><strong>Budget Saved:</strong> ₹{calcSaved}</p>
                                        </>
                                    );
                                })()}
                                <p><strong>Distance Covered:</strong> {selectedTrip.distance || 0} km</p>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '20px' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#2d3436' }}>🌟 Experience</h3>
                                <p><strong>Route:</strong> {selectedTrip.startPlace} → {selectedTrip.endPlace}</p>
                                <p><strong>Visited:</strong> {selectedTrip.placesVisited}</p>
                            </div>
                        </div>


                    </div>
                </section>
            )}

            {isModalOpen && <AddTripModal onClose={handleCloseModal} onTripAdded={() => { }} tripToEdit={tripToEdit} />}
            <Footer />
        </div>
    );
};

export default TripHistory;
