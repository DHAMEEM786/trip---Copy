import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';
import SubmitTaskModal from '../components/SubmitTaskModal';
import Footer from '../components/Footer';

import './WalletDashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const WalletDashboard = () => {
    const [trips, setTrips] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        let unsubWallet = () => { };
        let unsubTrips = () => { };
        let unsubSubmissions = () => { };

        // Main Auth Listener
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            // Always cleanup prev listeners when auth state changes
            unsubWallet();
            unsubTrips();
            unsubSubmissions();

            if (user) {
                // 1. Wallet Summary Listener
                unsubWallet = onSnapshot(doc(db, 'users', user.uid, 'wallet', 'summary'), (snap) => {
                    setWallet(snap.exists() ? snap.data() : {});
                });

                // 2. Trips Listener
                const q = query(collection(db, 'users', user.uid, 'trips'), orderBy('createdAt', 'desc'));
                unsubTrips = onSnapshot(q, (snap) => {
                    const tripList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTrips(tripList);
                    // Default select first trip if none selected
                    if (tripList.length > 0 && !selectedTrip) {
                        setSelectedTrip(tripList[0]);
                    }
                    setLoading(false);
                });

                // 3. Submissions Listener
                const subQ = query(collection(db, 'users', user.uid, 'taskSubmissions'), orderBy('submittedAt', 'desc'));
                unsubSubmissions = onSnapshot(subQ, (snap) => {
                    setSubmissions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                });

            } else {
                setLoading(false);
            }
        });

        // Cleanup on unmount
        return () => {
            unsubscribeAuth();
            unsubWallet();
            unsubTrips();
            unsubSubmissions();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEarnCoins = async (coins, taskName) => {
        const user = auth.currentUser;
        if (!user) return;

        const walletRef = doc(db, 'users', user.uid, 'wallet', 'summary');
        await updateDoc(walletRef, {
            ecopoints: increment(coins),
            points: increment(coins)
        });

        alert(`You earned ${coins} Eco-Coins for: ${taskName}!`);
    };

    const downloadReport = async () => {
        const element = document.getElementById('dashboard-report');
        if (!element) return;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Travel_Wallet_Report.pdf');
    };

    // Helper to calculate spent amount safely (fallback for old trips)
    const calculateTripSpent = (t) => {
        const direct = Number(t.actualExpenditure) || 0;
        if (direct > 0) return direct;

        // Fallback: Sum individual expenses
        return (Number(t.foodExpense) || 0) +
            (Number(t.transportExpense) || 0) +
            (Number(t.adventureExpense) || 0) +
            (Number(t.othersExpense) || 0);
    };

    // --- Derived State & Calculations ---
    const calculatedTotalBudget = trips.reduce((sum, t) => sum + (Number(t.plannedBudget) || 0), 0);
    const calculatedTotalSpent = trips.reduce((sum, t) => sum + calculateTripSpent(t), 0);
    const moneySaved = calculatedTotalBudget - calculatedTotalSpent;

    const tripEcoPoints = trips.length * 50;
    const taskEcoPoints = submissions.reduce((sum, s) => sum + (Number(s.coinsEarned) || 0), 0);
    const calculatedEcoPoints = tripEcoPoints + taskEcoPoints;

    // Self-Healing: Sync DB if mismatch detected
    useEffect(() => {
        if (!wallet || loading) return;
        if (wallet.ecopoints !== calculatedEcoPoints) {
            const user = auth.currentUser;
            if (user) {
                const walletRef = doc(db, 'users', user.uid, 'wallet', 'summary');
                updateDoc(walletRef, { ecopoints: calculatedEcoPoints, points: calculatedEcoPoints })
                    .catch(e => console.error("Auto-healing wallet failed", e));
            }
        }
    }, [wallet, calculatedEcoPoints, loading]);

    // --- Chart Data ---
    const lineChartData = {
        labels: trips.map(t => t.title).reverse(),
        datasets: [
            {
                label: 'Planned Budget',
                data: trips.map(t => t.plannedBudget).reverse(),
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fill: true,
            },
            {
                label: 'Actual Spent',
                data: trips.map(t => calculateTripSpent(t)).reverse(),
                borderColor: '#800020',
                backgroundColor: 'rgba(255, 69, 0, 0.2)',
                fill: true,
            }
        ]
    };

    const expenseBreakdownData = selectedTrip ? {
        labels: ['Food', 'Transport', 'Adventure', 'Others'],
        datasets: [{
            data: [
                selectedTrip.foodExpense || 0,
                selectedTrip.transportExpense || 0,
                selectedTrip.adventureExpense || 0,
                selectedTrip.othersExpense || 0
            ],
            backgroundColor: ['#ff9f43', '#54a0ff', '#5f27cd', '#48dbfb'],
            borderWidth: 0
        }]
    } : null;

    const ecoTasks = [
        { name: 'Used Public Transport', coins: 20, icon: 'fa-bus', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop' },
        { name: 'Avoided Plastic Bottle', coins: 10, icon: 'fa-bottle-water', img: 'https://images.unsplash.com/photo-1627483262268-9c2b5b2834b5?w=100&auto=format&fit=crop' },
        { name: 'Ate Local Cuisine', coins: 15, icon: 'fa-plate-wheat', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&auto=format&fit=crop' },
        { name: 'Supported Artisans', coins: 25, icon: 'fa-shop', img: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=100&auto=format&fit=crop' }
    ];

    if (loading) return <div className="wallet-dashboard-loading">Loading Analytics...</div>;

    return (
        <div className="wallet-dashboard" style={{ padding: 0 }}>
            <Navbar />

            <div className="wallet-hero">
                <motion.h1
                    className="dashboard-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Adventure Wallet
                </motion.h1>
                <motion.p
                    className="dashboard-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Track your spending, master your budget, and grow your eco-impact.
                </motion.p>

                <div className="report-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
                    <button className="download-btn" onClick={downloadReport}>
                        <i className="fa-solid fa-file-pdf"></i> Download Report
                    </button>
                </div>
            </div>

            <div id="dashboard-report">
                <div className="overview-grid">
                    <motion.div className="overview-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="card-icon"><i className="fa-solid fa-plane"></i></div>
                        <div className="card-value">{trips.length}</div>
                        <div className="card-label">Total Trips</div>
                    </motion.div>
                    <motion.div className="overview-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="card-icon"><i className="fa-solid fa-sack-dollar"></i></div>
                        <div className="card-value">₹{calculatedTotalSpent.toLocaleString()}</div>
                        <div className="card-label">Total Spent</div>
                    </motion.div>
                    <motion.div className="overview-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ borderColor: moneySaved >= 0 ? '#2ecc71' : '#ff4757' }}>
                        <div className="card-icon" style={{ color: moneySaved >= 0 ? '#2ecc71' : '#ff4757' }}>
                            <i className={moneySaved >= 0 ? "fa-solid fa-piggy-bank" : "fa-solid fa-triangle-exclamation"}></i>
                        </div>
                        <div className="card-value">₹{Math.abs(moneySaved).toLocaleString()}</div>
                        <div className="card-label">{moneySaved >= 0 ? 'Total Saved' : 'Overspent'}</div>
                    </motion.div>
                    <motion.div className="overview-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="card-icon"><i className="fa-solid fa-coins"></i></div>
                        <div className="card-value">{calculatedEcoPoints}</div>
                        <div className="card-label">Eco Coins</div>
                    </motion.div>
                </div>

                <div className="analytics-grid">
                    <div className="chart-container">
                        <h3>Trip-wise Budget Insight</h3>
                        <div style={{ height: '300px' }}>
                            {trips.length > 0 ? (
                                <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <div className="empty-chart">
                                    <i className="fa-solid fa-chart-line"></i>
                                    <p>No trips added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3>Expense Distribution (Selected Trip)</h3>
                        <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                            {expenseBreakdownData ? (
                                <Doughnut data={expenseBreakdownData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <div className="empty-chart">
                                    <i className="fa-solid fa-chart-pie"></i>
                                    <p>Select a trip to see details</p>
                                </div>
                            )}
                        </div>
                        {trips.length > 0 && (
                            <select
                                className="styled-select"
                                onChange={(e) => setSelectedTrip(trips.find(t => t.id === e.target.value))}
                                value={selectedTrip?.id}
                            >
                                {trips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {/* 3. Timeline View */}
                {selectedTrip?.timeline && (
                    <div className="timeline-section">
                        <h2>📍 {selectedTrip.title} - Journey Timeline</h2>
                        <div className="vertical-timeline">
                            {selectedTrip.timeline.map((day, idx) => (
                                <motion.div
                                    key={idx}
                                    className="timeline-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <span className="day-tag" style={{ color: '#800020', fontWeight: 'bold' }}>Day {day.day}</span>
                                        <h4 style={{ margin: '5px 0' }}><i className="fa-solid fa-location-dot"></i> {day.location || 'Explore'}</h4>
                                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{day.activity || 'Activity planned'}</p>
                                        <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Daily Cost</span>
                                            <span style={{ fontWeight: 'bold' }}>₹{day.expense || 0}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="eco-main-layout">
                    <div className="eco-left-tasks">
                        <h2 className="section-title">🌱 Eco-Friendly Activities</h2>
                        <div className="task-grid-compact">
                            {ecoTasks.map((task, idx) => (
                                <div key={idx} className="task-mini-card">
                                    <img src={task.img} alt={task.name} className="task-img-thumb" />
                                    <div className="task-info">
                                        <h4>{task.name}</h4>
                                        <span>+{task.coins} Coins</span>
                                    </div>
                                    <i className={`fa-solid ${task.icon} task-bg-icon`}></i>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="eco-right-portal">
                        <div className="portal-header">
                            <h2 className="section-title">📸 Proof Portal</h2>
                            <button className="btn-portal-action" onClick={() => setIsTaskModalOpen(true)}>
                                <i className="fa-solid fa-upload"></i> Upload Proof
                            </button>
                        </div>

                        <div className="verification-status-card">
                            <div className="status-header">
                                <span>Verification Status</span>
                                <span className="status-tag">Active</span>
                            </div>
                            <div className="progress-container">
                                <div className="progress-labels">
                                    <label>Daily Goal</label>
                                    <span>{submissions.length * 20}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <motion.div
                                        className="progress-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(submissions.length * 20, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="recent-activity-mini">
                                <h3>Last Submission</h3>
                                {submissions.length > 0 ? (
                                    <div className="activity-item">
                                        <i className="fa-solid fa-circle-check"></i>
                                        <span>{submissions[0].taskName}</span>
                                        <label>Verified</label>
                                    </div>
                                ) : (
                                    <p>Waiting for your first green move!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="badges-full-section">
                    <h2 className="section-title">🎖️ Travel & Eco Achievements</h2>
                    <div className="badge-belt">
                        {[
                            { name: 'Eco Hero', icon: '🌱', threshold: 100 },
                            { name: 'Budget Master', icon: '💰', threshold: 50 },
                            { name: 'Explorer', icon: '🌍', threshold: 5 },
                            { name: 'Green Pro', icon: '🍀', threshold: 500 },
                            { name: 'TN Guide', icon: '🏯', threshold: 200 },
                            { name: 'Legend', icon: '👑', threshold: 1000 }
                        ].map((badge, idx) => (
                            <div key={idx} className={`badge-capsule ${calculatedEcoPoints >= badge.threshold ? 'earned' : ''}`}>
                                <span className="capsule-icon">{badge.icon}</span>
                                <div className="capsule-text">
                                    <h5>{badge.name}</h5>
                                    <p>{badge.threshold} Coins</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="overall-progress-container">
                        <div className="progress-labels">
                            <label>Elite Journey Level</label>
                            <span>{calculatedEcoPoints} / 1000 Coins</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: '15px' }}>
                            <motion.div
                                className="progress-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((calculatedEcoPoints / 1000) * 100, 100)}%` }}
                                style={{ background: 'linear-gradient(to right, #800020, #2ecc71)' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '10px', textAlign: 'center' }}>
                            {calculatedEcoPoints >= 1000 ? "You've reached Legend status!" : `Collect ${1000 - calculatedEcoPoints} more coins to become a TN Legend.`}
                        </p>
                    </div>
                </div>
            </div>

            {isTaskModalOpen && (
                <SubmitTaskModal
                    onClose={() => setIsTaskModalOpen(false)}
                    onTaskSubmitted={(coins, name) => {
                        setUploadProgress(100);
                        setTimeout(() => setUploadProgress(0), 2000);
                    }}
                />
            )}

            <Footer />
        </div>
    );
};


export default WalletDashboard;
