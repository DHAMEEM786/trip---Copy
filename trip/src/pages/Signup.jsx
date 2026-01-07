import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import './Auth.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [city, setCity] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/home');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Optimized background image URL - Tea Plantation (Smaller & Lower Quality for speed)
    const backgroundUrl = 'https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&w=1000&q=60';

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const lowerUsername = username.toLowerCase();
            const lowerEmail = email.toLowerCase();

            // 1. Check if username exists
            const usernameRef = doc(db, 'usernames', lowerUsername);
            const usernameSnap = await getDoc(usernameRef);

            if (usernameSnap.exists()) {
                setLoading(false);
                return setError('Username already taken');
            }

            // 2. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 3. Create Username Record for lookup
            await setDoc(usernameRef, {
                uid: user.uid,
                email: lowerEmail
            });

            // 4. Create User Profile Document
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                username: lowerUsername,
                email: lowerEmail,
                name: fullName,
                location: city,
                phoneNumber: phoneNumber,
                createdAt: serverTimestamp(),
            });

            // 5. Initialize Wallet Subcollection
            await setDoc(doc(db, 'users', user.uid, 'wallet', 'summary'), {
                ecopoints: 0,
                points: 0,
                level: 'Bronze',
                updateat: serverTimestamp(),
                CreatedAt: serverTimestamp()
            });

            navigate('/home');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div className="auth-glass-card">
                <h1 className="auth-title">Join the Adventure</h1>
                {error && <div className="auth-error" style={{ color: '#ff6b6b', marginBottom: '1rem', fontWeight: '500' }}>{error}</div>}
                <form className="auth-form" onSubmit={handleSignup}>
                    <div className="auth-input-group">
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="tel"
                            className="auth-input"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <div className="auth-footer">
                        Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Login</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
