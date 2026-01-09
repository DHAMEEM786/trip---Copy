import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Auth.css';

const Login = () => {
    const [identifier, setIdentifier] = useState(''); // Can be email or username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/home';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate(from, { replace: true });
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Optimized background image URL - Tropical Beach/Resort (Different fallback for speed)
    const backgroundUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=60';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let email = identifier;

            // 1. If identifier doesn't look like an email, assume it's a username
            if (!identifier.includes('@')) {
                const usernameRef = doc(db, 'usernames', identifier.toLowerCase());
                const usernameSnap = await getDoc(usernameRef);

                if (usernameSnap.exists()) {
                    email = usernameSnap.data().email;
                } else {
                    setLoading(false);
                    return setError('Username not found');
                }
            }

            // 2. Sign in with email and password
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError('Invalid credentials');
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
                <h1 className="auth-title">Welcome Back</h1>
                {error && <div className="auth-error" style={{ color: '#ff6666', marginBottom: '1rem' }}>{error}</div>}
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="auth-input-group">
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Username or Email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging In...' : 'Sign In'}
                    </button>
                    <div className="auth-footer">
                        Don't have an account? <span className="auth-link" onClick={() => navigate('/signup')}>Sign Up</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
