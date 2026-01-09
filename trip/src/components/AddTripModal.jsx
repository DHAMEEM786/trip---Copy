import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc } from 'firebase/firestore';

const AddTripModal = ({ onClose, onTripAdded, tripToEdit = null }) => {
    const [formData, setFormData] = useState(tripToEdit ? {
        ...tripToEdit
    } : {
        title: '',
        destination: '',
        startDate: '',
        endDate: '',
        plannedBudget: 0,
        foodExpense: 0,
        transportExpense: 0,
        adventureExpense: 0,
        othersExpense: 0,
        startPlace: '',
        endPlace: '',
        placesVisited: '',
        transport: 'Car',
        distance: ''
    });

    const [timeline, setTimeline] = useState(tripToEdit?.timeline || [{ day: 1, location: '', activity: '', expense: 0 }]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name.includes('Expense') || name === 'plannedBudget' || name === 'distance' ? Number(value) : value });
    };

    const handleTimelineChange = (index, field, value) => {
        const newTimeline = [...timeline];
        newTimeline[index][field] = field === 'expense' || field === 'day' ? Number(value) : value;
        setTimeline(newTimeline);
    };

    const addActivity = () => {
        const lastDay = timeline[timeline.length - 1]?.day || 1;
        setTimeline([...timeline, { day: lastDay, location: '', activity: '', expense: 0 }]);
    };

    const addNewDay = () => {
        const lastDay = timeline[timeline.length - 1]?.day || 1;
        setTimeline([...timeline, { day: lastDay + 1, location: '', activity: '', expense: 0 }]);
    };


    const getDestinationImage = (dest) => {
        const search = dest?.toLowerCase() || '';
        if (search.includes('ooty')) return 'https://images.unsplash.com/photo-1548013146-72479768b921?auto=format&fit=crop&w=1000&q=80';
        if (search.includes('kodai')) return 'https://images.unsplash.com/photo-1626014303757-64174d6f0285?auto=format&fit=crop&w=1000&q=80';
        if (search.includes('madurai')) return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80';
        if (search.includes('chennai')) return 'https://images.unsplash.com/photo-1580619305218-8423a7f19bca?auto=format&fit=crop&w=1000&q=80';
        if (search.includes('kanni')) return 'https://images.unsplash.com/photo-1601000780131-7e8e19c063cf?auto=format&fit=crop&w=1000&q=80';
        if (search.includes('ramesh')) return 'https://images.unsplash.com/photo-1589136142558-1830f277053b?auto=format&fit=crop&w=1000&q=80';
        return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validate Adventure Specs
        if (!formData.startPlace?.trim() ||
            !formData.endPlace?.trim() ||
            !formData.distance ||
            !formData.transport ||
            !formData.placesVisited?.trim()) {
            alert("Mandatory: Please fill in all Adventure Specs (Start/End Place, Distance, Transport, Places Visited).");
            return;
        }

        // 2. Validate Budget (Must be filled and > 0)
        // Check if plannedBudget is falsy or 0
        if (!formData.plannedBudget || Number(formData.plannedBudget) <= 0) {
            alert("Mandatory: Planned Budget is required and must be greater than 0.");
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user logged in");

            let imageUrls = tripToEdit?.imageUrls || [];

            // Calculate Actual Expenditure from Breakdown fields + Timeline (if used)
            // Prioritize Breakdown fields if they are used, otherwise fallback to timeline or sum both?
            // User requested "Total Spent" fixed. Assuming Breakdown fields are primary source of truth for total cost.
            const breakdownTotal =
                (Number(formData.foodExpense) || 0) +
                (Number(formData.transportExpense) || 0) +
                (Number(formData.adventureExpense) || 0) +
                (Number(formData.othersExpense) || 0);

            const timelineTotal = timeline.reduce((sum, item) => sum + Number(item.expense), 0);

            // If breakdown is filled, use it. If not, use timeline. Max ensures we don't miss data.
            const actualExpenditure = Math.max(breakdownTotal, timelineTotal);

            const savings = (Number(formData.plannedBudget) || 0) - actualExpenditure;

            // Determine Cover Image
            // Priority: 1. Existing trip cover (if editing & no new images override intended), 
            // 2. First image in valid list, 3. Destination fallback
            let coverImage = tripToEdit?.coverImage;
            if (imageUrls.length > 0) {
                coverImage = imageUrls[0];
            }
            if (!coverImage) {
                coverImage = getDestinationImage(formData.destination);
            }

            const tripData = {
                ...formData,
                timeline,
                userId: user.uid,
                imageUrls,
                coverImage,
                updatedAt: serverTimestamp(),
                duration: Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) || 0,
                actualExpenditure,
                savings
            };

            const walletRef = doc(db, 'users', user.uid, 'wallet', 'summary');

            if (tripToEdit) {
                await updateDoc(doc(db, 'users', user.uid, 'trips', tripToEdit.id), tripData);

                // Update Wallet on Edit (Calculate Difference)
                const oldBudget = tripToEdit.plannedBudget || 0;
                const oldSpent = tripToEdit.actualExpenditure || 0;

                await updateDoc(walletRef, {
                    totalBudget: increment(formData.plannedBudget - oldBudget),
                    totalSpent: increment(actualExpenditure - oldSpent)
                });

            } else {
                tripData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'users', user.uid, 'trips'), tripData);

                // Update Wallet (only for new trips) - Use setDoc with merge to prevent "No document" error
                // Removed ecopoints increment as requested
                await setDoc(walletRef, {
                    totalTrips: increment(1),
                    totalBudget: increment(formData.plannedBudget || 0),
                    totalSpent: increment(actualExpenditure || 0),
                    // ecopoints: increment(50) // Removed
                }, { merge: true });
            }

            onTripAdded();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content compact-modal" style={{ maxWidth: '1200px' }}>
                <div className="modal-header">
                    <h2>{tripToEdit ? 'Update Adventure' : 'Add New Adventure'}</h2>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="compact-form">
                    {/* Row 1: Basic Info & Adventure Specs */}
                    <div className="form-main-grid-wide">
                        <section className="modal-form-section">
                            <h3>📌 Basic Info</h3>
                            <div className="form-row">
                                <div className="form-group"><label>Trip Title</label><input name="title" value={formData.title} required onChange={handleChange} placeholder="Summer Vacation" /></div>
                                <div className="form-group"><label>Destination</label><input name="destination" value={formData.destination} required onChange={handleChange} placeholder="Ooty, TN" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Start Date</label><input type="date" name="startDate" value={formData.startDate} required onChange={handleChange} /></div>
                                <div className="form-group"><label>End Date</label><input type="date" name="endDate" value={formData.endDate} required onChange={handleChange} /></div>
                            </div>
                        </section>

                        <section className="modal-form-section">
                            <h3>🚀 Adventure Specs</h3>
                            <div className="form-row">
                                <div className="form-group"><label>Start Place</label><input name="startPlace" value={formData.startPlace} onChange={handleChange} placeholder="Chennai" /></div>
                                <div className="form-group"><label>End Place</label><input name="endPlace" value={formData.endPlace} onChange={handleChange} placeholder="Ooty" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Distance (km)</label><input type="number" name="distance" value={formData.distance} onChange={handleChange} placeholder="560" /></div>
                                <div className="form-group">
                                    <label>Transport Mode</label>
                                    <select name="transport" value={formData.transport} onChange={handleChange}>
                                        <option value="Car">Car</option>
                                        <option value="Bus">Bus</option>
                                        <option value="Train">Train</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Flight">Flight</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group"><label>Places Visited</label><input name="placesVisited" value={formData.placesVisited} onChange={handleChange} placeholder="Botanical Garden, Lake, Peak..." /></div>
                        </section>
                    </div>

                    {/* Row 2: Expenditure Breakdown (Single Row) */}
                    <section className="modal-form-section full-width-section">
                        <h3>💰 Expenditure Breakdown</h3>
                        <div className="expense-horizontal-grid">
                            <div className="form-group"><label>Planned Budget (₹)</label><input type="number" name="plannedBudget" value={formData.plannedBudget} onChange={handleChange} placeholder="0" /></div>
                            <div className="form-group"><label>Food (₹)</label><input type="number" name="foodExpense" value={formData.foodExpense} onChange={handleChange} placeholder="0" /></div>
                            <div className="form-group"><label>Transport (₹)</label><input type="number" name="transportExpense" value={formData.transportExpense} onChange={handleChange} placeholder="0" /></div>
                            <div className="form-group"><label>Adventure (₹)</label><input type="number" name="adventureExpense" value={formData.adventureExpense} onChange={handleChange} placeholder="0" /></div>
                            <div className="form-group"><label>Others (₹)</label><input type="number" name="othersExpense" value={formData.othersExpense} onChange={handleChange} placeholder="0" /></div>
                        </div>
                    </section>

                    {/* Row 3: Timeline */}
                    <section className="modal-form-section timeline-card">
                        <h3>🗺️ Trip Timeline (Day by Day)</h3>
                        <div className="timeline-header-row">
                            <span>Day</span>
                            <span>Location</span>
                            <span>Activity</span>
                            <span>Cost (₹)</span>
                        </div>
                        <div className="timeline-items-container">
                            {timeline.map((entry, index) => (
                                <div key={index} className="timeline-row-item">
                                    <input type="number" value={entry.day} onChange={(e) => handleTimelineChange(index, 'day', e.target.value)} className="day-input" />
                                    <input value={entry.location} onChange={(e) => handleTimelineChange(index, 'location', e.target.value)} placeholder="Place" />
                                    <input value={entry.activity} onChange={(e) => handleTimelineChange(index, 'activity', e.target.value)} placeholder="What did you do?" />
                                    <input type="number" value={entry.expense} onChange={(e) => handleTimelineChange(index, 'expense', e.target.value)} placeholder="0" />
                                </div>
                            ))}
                        </div>
                        <div className="timeline-actions">
                            <button type="button" onClick={addActivity} className="btn-add-secondary btn-add-activity">
                                <i className="fa-solid fa-location-dot"></i> + Add Another Place
                            </button>
                            <button type="button" onClick={addNewDay} className="btn-add-secondary btn-add-new-day">
                                <i className="fa-solid fa-calendar-plus"></i> + Add Another Day
                            </button>
                        </div>
                    </section>


                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" className="add-trip-btn" disabled={loading}>
                            {loading ? 'Processing...' : (tripToEdit ? 'Save Changes' : 'Save Adventure Record')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTripModal;
