import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import './Trips.css';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'wallet', 'summary'), (doc) => {
            if (doc.exists()) {
                setWallet(doc.data());
            }
        });

        return () => unsubscribe();
    }, []);

    const getLevelColor = (level) => {
        switch (level) {
            case 'Gold': return '#FFD700';
            case 'Silver': return '#C0C0C0';
            case 'Bronze': return '#CD7F32';
            default: return '#800020';
        }
    };

    return (
        <div className="trips-container">
            <Navbar />

            <section className="trips-hero" style={{ background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')` }}>
                <h1>Travel Wallet</h1>
                <p>Track your rewards and eco-points earned during your travels.</p>
            </section>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {/* Points Card */}
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ color: '#636e72', fontSize: '1rem', fontWeight: '600' }}>TOTAL POINTS</h3>
                        <p style={{ fontSize: '4rem', fontWeight: '800', color: '#800020' }}>{wallet?.points || 0}</p>
                        <p style={{ color: '#b2bec3' }}>Redeemable for bookings</p>
                    </div>

                    {/* Eco Points Card */}
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ color: '#636e72', fontSize: '1rem', fontWeight: '600' }}>ECO POINTS</h3>
                        <p style={{ fontSize: '4rem', fontWeight: '800', color: '#00b894' }}>{wallet?.ecopoints || 0}</p>
                        <p style={{ color: '#b2bec3' }}>Earned from eco-activities</p>
                    </div>

                    {/* Level Card */}
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ color: '#636e72', fontSize: '1rem', fontWeight: '600' }}>TRAVEL LEVEL</h3>
                        <p style={{ fontSize: '3rem', fontWeight: '800', color: getLevelColor(wallet?.level) }}>{wallet?.level || 'Bronze'}</p>
                        <div style={{ width: '100%', height: '10px', background: '#f1f2f6', borderRadius: '5px', marginTop: '1rem' }}>
                            <div style={{ width: '40%', height: '100%', background: getLevelColor(wallet?.level), borderRadius: '5px' }}></div>
                        </div>
                        <p style={{ color: '#b2bec3', marginTop: '10px' }}>Next Level: {wallet?.level === 'Bronze' ? 'Silver' : 'Gold'}</p>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', background: '#2d3436', padding: '3rem', borderRadius: '30px', color: 'white' }}>
                    <h2 style={{ marginBottom: '2rem' }}>Rewards History</h2>
                    <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '20px' }}>
                        <i className="fa-solid fa-gift" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                        <p>No rewards redeemed yet. Travel more to earn points!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
