import React, { useState } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';

const ECO_TASKS = [
    { id: 'public_transport', name: 'Used Public Transport', coins: 20, icon: 'fa-bus' },
    { id: 'no_plastic', name: 'Avoided Plastic Bottle', coins: 10, icon: 'fa-bottle-water' },
    { id: 'local_food', name: 'Ate Local Cuisine', coins: 15, icon: 'fa-plate-wheat' },
    { id: 'local_support', name: 'Supported Local Artisans', coins: 25, icon: 'fa-shop' },
    { id: 'walk_cycle', name: 'Walked or Cycled', coins: 15, icon: 'fa-person-walking' },
    { id: 'cleanup', name: 'Clean-up Activity', coins: 30, icon: 'fa-trash-can' }
];

const SubmitTaskModal = ({ onClose, onTaskSubmitted }) => {
    const [selectedTask, setSelectedTask] = useState(ECO_TASKS[0]);
    const [note, setNote] = useState('');
    const [image, setImage] = useState(null);
    const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success'

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Proof Image is Mandatory
        if (!image) {
            alert("Mandatory: Please upload a proof image to verify your activity.");
            return;
        }

        setStatus('submitting');
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Please log in first");

            let proofUrl = '';
            // Image is now mandatory, so we proceed directly
            const storageRef = ref(storage, `proofs/${user.uid}/${Date.now()}_${image.name}`);
            await uploadBytes(storageRef, image);
            proofUrl = await getDownloadURL(storageRef);

            // Create submission record
            await addDoc(collection(db, 'users', user.uid, 'taskSubmissions'), {
                taskId: selectedTask.id,
                taskName: selectedTask.name,
                coinsEarned: selectedTask.coins,
                note,
                proofUrl,
                status: 'verified', // Auto-verify for prototype
                submittedAt: serverTimestamp()
            });

            // Update coins in wallet
            const walletRef = doc(db, 'users', user.uid, 'wallet', 'summary');
            await updateDoc(walletRef, {
                ecopoints: increment(selectedTask.coins),
                points: increment(selectedTask.coins)
            });

            setStatus('success');

            // Close after showing success message
            setTimeout(() => {
                onTaskSubmitted(selectedTask.coins, selectedTask.name);
                onClose();
            }, 2000);

        } catch (error) {
            console.error(error);
            alert(error.message);
            setStatus('idle');
        }
    };

    return (
        <div className="modal-overlay">
            <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ maxWidth: '500px', background: '#1a1a1a', color: 'white' }}
            >
                <div className="modal-header">
                    {/* Ensure title is white as requested */}
                    <h2 style={{ color: 'white' }}>Submit Eco-Task</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Select Task</label>
                        <select
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#333', color: 'white', border: 'none' }}
                            onChange={(e) => setSelectedTask(ECO_TASKS.find(t => t.id === e.target.value))}
                        >
                            {ECO_TASKS.map(task => (
                                <option key={task.id} value={task.id}>{task.name} (+{task.coins} Coins)</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Note / Experience</label>
                        <textarea
                            required
                            placeholder="Tell us what you did..."
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#333', color: 'white', border: 'none', minHeight: '100px' }}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '30px' }}>
                        {/* Marked as Required */}
                        <label>Proof Image (Required)</label>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>Upload a photo to verify your activity.</p>
                    </div>

                    <button
                        type="submit"
                        className="add-trip-btn"
                        style={{
                            width: '100%',
                            padding: '15px',
                            background: status === 'success' ? '#2ecc71' : undefined // Green on success
                        }}
                        disabled={status !== 'idle'}
                    >
                        {status === 'submitting' ? 'Submitting Proof...' :
                            status === 'success' ? 'Successfully Submitted for Verification' :
                                `Confirm & Earn ${selectedTask.coins} Coins`}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default SubmitTaskModal;
