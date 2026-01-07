import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DummyHome from './pages/DummyHome';
import DummyPlanTrip from './pages/DummyPlanTrip';
import DummyAR from './pages/DummyAR';
import DummyVR from './pages/DummyVR';
import PlanTrip from './pages/PlanTrip';
import VR from './pages/VR';
import AR from './pages/AR';
import Culinary from './pages/Culinary/Culinary/Culinary';
import Agri from './pages/Agri/Agri/Agri';
import Booking from './pages/Booking';
import Event from './pages/Event';
import Guide from './pages/Guide';
import GuideDashboard from './pages/GuideDashboard';
import GuideRegistration from './pages/GuideRegistration';
import GuideDetail from './pages/GuideDetail';
import Medical from './pages/Medical/Medical/Medical';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TripHistory from './pages/TripHistory';
import WalletDashboard from './pages/WalletDashboard';
import WhereToGo from './pages/WhereToGo';

import { TripProvider } from './context/TripContext';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <TripProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<DummyHome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/preview/plan-trip" element={<DummyPlanTrip />} />
                    <Route path="/preview/ar" element={<DummyAR />} />
                    <Route path="/preview/vr" element={<DummyVR />} />

                    {/* Public TnVerse Routes */}
                    <Route path="/culinary" element={<Culinary />} />
                    <Route path="/agri" element={<Agri />} />
                    <Route path="/medical" element={<Medical />} />

                    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/trip-history" element={<ProtectedRoute><TripHistory /></ProtectedRoute>} />
                    <Route path="/wallet" element={<ProtectedRoute><WalletDashboard /></ProtectedRoute>} />
                    <Route path="/plan-trip" element={<ProtectedRoute><PlanTrip /></ProtectedRoute>} />
                    <Route path="/vr" element={<ProtectedRoute><VR /></ProtectedRoute>} />
                    <Route path="/ar" element={<ProtectedRoute><AR /></ProtectedRoute>} />

                    <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                    <Route path="/event" element={<ProtectedRoute><Event /></ProtectedRoute>} />
                    <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
                    <Route path="/guide/:id" element={<ProtectedRoute><GuideDetail /></ProtectedRoute>} />
                    <Route path="/guide-dashboard" element={<ProtectedRoute><GuideDashboard /></ProtectedRoute>} />
                    <Route path="/guide-registration" element={<ProtectedRoute><GuideRegistration /></ProtectedRoute>} />
                    <Route path="/where-to-go" element={<WhereToGo />} />
                </Routes>
            </Router>
        </TripProvider>
    );
}

export default App;
