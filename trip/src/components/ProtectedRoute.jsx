import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
            <div className="loader">Loading adventure...</div>
            <style>{`
                .loader { font-family: 'Poppins', sans-serif; font-weight: 600; color: #800020; }
            `}</style>
        </div>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute;
