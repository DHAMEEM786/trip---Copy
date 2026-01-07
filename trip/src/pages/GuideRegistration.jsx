import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle, usePageStyle } from '../hooks';

const GuideRegistration = () => {
    usePageTitle('Guide Registration | TN Verse');
    usePageStyle('/guide/style.css');
    usePageStyle('/guide/registration.css');

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [status, setStatus] = useState('Pending'); // Simulation: Pending, Approved, Rejected
    const [otpSent, setOtpSent] = useState(false);
    const [phone, setPhone] = useState('');

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulation of submission
        setIsSubmitted(true);
        // Randomly set status for demo
        const outcomes = ['Pending'];
        setStatus(outcomes[0]);
    };

    const handleSendOTP = () => {
        if (!phone || phone.length < 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        setOtpSent(true);
        alert(`OTP sent to ${phone} (Demo: 1234)`);
    };

    return (
        <div className="registration-wrapper">
            <Navbar />

            <div className="registration-container">
                <header className="reg-header">
                    <h1>Guide Onboarding Portal</h1>
                    <p>Join the largest network of verified travel experts in Tamil Nadu.</p>
                </header>

                {!isSubmitted ? (
                    <div className="form-card-premium">
                        <div className="progress-bar-wrapper">
                            <div className="progress-steps">
                                <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                                    <span className="step-num">1</span>
                                    <span className="step-label">Basic Info</span>
                                </div>
                                <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
                                <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
                                    <span className="step-num">2</span>
                                    <span className="step-label">Professional</span>
                                </div>
                                <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`}></div>
                                <div className={`step-item ${currentStep === 3 ? 'active' : ''}`}>
                                    <span className="step-num">3</span>
                                    <span className="step-label">Verification</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="reg-form">
                            {currentStep === 1 && (
                                <div className="form-step-content animation-slide-in">
                                    <h3 className="section-title">Step 1: Personal Credentials</h3>
                                    <div className="form-grid-modern">
                                        <div className="form-group-modern full">
                                            <label>Profile Photo (Mandatory)</label>
                                            <div className="upload-placeholder">
                                                <i className="fa-solid fa-camera"></i>
                                                <span>Click to upload passport size photo</span>
                                                <input type="file" accept="image/*" required />
                                            </div>
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Full Name</label>
                                            <input type="text" placeholder="As per Aadhaar" required />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Mobile Number</label>
                                            <div className="otp-input-wrapper">
                                                <input
                                                    type="tel"
                                                    placeholder="Enter 10 digit number"
                                                    required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-verify-otp"
                                                    onClick={handleSendOTP}
                                                >
                                                    {otpSent ? 'Resend' : 'Send OTP'}
                                                </button>
                                            </div>
                                            {otpSent && (
                                                <div className="form-group-modern" style={{ marginTop: '15px' }}>
                                                    <label>Enter OTP</label>
                                                    <input type="text" placeholder="Enter 4-digit code" maxLength="4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Email Address</label>
                                            <input type="email" placeholder="example@mail.com" required />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>City / District</label>
                                            <input type="text" placeholder="e.g. Madurai" required />
                                        </div>
                                        <div className="form-group-modern full">
                                            <label>Languages Known</label>
                                            <div className="checkbox-group-modern">
                                                <label className="checkbox-custom"><input type="checkbox" /> Tamil</label>
                                                <label className="checkbox-custom"><input type="checkbox" /> English</label>
                                                <label className="checkbox-custom"><input type="checkbox" /> Hindi</label>
                                                <label className="checkbox-custom"><input type="checkbox" /> Malayalam</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-navigation">
                                        <div></div>
                                        <button type="button" className="btn-next" onClick={nextStep}>Professional Info <i className="fa-solid fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="form-step-content animation-slide-in">
                                    <h3 className="section-title">Step 2: Professional Expertise</h3>
                                    <div className="form-grid-modern">
                                        <div className="form-group-modern">
                                            <label>Guide Type</label>
                                            <select required>
                                                <option value="">Select Specialty</option>
                                                <option value="Local">Local Guide</option>
                                                <option value="Heritage">Heritage / History</option>
                                                <option value="Adventure">Adventure / Trekking</option>
                                                <option value="Eco">Eco / Nature</option>
                                            </select>
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Years of Experience</label>
                                            <input type="number" min="0" placeholder="e.g. 5" required />
                                        </div>
                                        <div className="form-group-modern full">
                                            <label>Areas Covered (Keywords)</label>
                                            <input type="text" placeholder="e.g. Meenakshi Temple, Teppakulam, Local Markets" required />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Pricing (Per Day)</label>
                                            <input type="text" placeholder="e.g. ₹2000" required />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Max Tourists Per Trip</label>
                                            <input type="number" min="1" max="50" placeholder="e.g. 10" required />
                                        </div>
                                        <div className="form-group-modern full">
                                            <label>Short Bio</label>
                                            <textarea placeholder="Tell us about your guiding style and passion..." rows="4" required></textarea>
                                        </div>
                                    </div>
                                    <div className="form-navigation">
                                        <button type="button" className="btn-back" onClick={prevStep}><i className="fa-solid fa-arrow-left"></i> Back</button>
                                        <button type="button" className="btn-next" onClick={nextStep}>Verification Docs <i className="fa-solid fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="form-step-content animation-slide-in">
                                    <h3 className="section-title">Step 3: Identity & Trust Verification</h3>
                                    <div className="form-grid-modern">
                                        <div className="form-group-modern">
                                            <label>Govt ID Proof (Aadhaar / Passport)</label>
                                            <input type="file" required />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Police Verification (Optional but Recommended)</label>
                                            <input type="file" />
                                        </div>
                                        <div className="form-group-modern full">
                                            <label className="checkbox-custom trust-consent">
                                                <input type="checkbox" required /> I agree to the <Link to="/terms">Terms & Conditions</Link> and verify that all information provided is accurate.
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-navigation">
                                        <button type="button" className="btn-back" onClick={prevStep}><i className="fa-solid fa-arrow-left"></i> Back</button>
                                        <button type="submit" className="btn-submit-registration">Submit for Verification</button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    <div className="submission-success-card animate-pop-in">
                        <div className={`status-badge ${status.toLowerCase()}`}>
                            <i className="fa-solid fa-clock-rotate-left"></i> {status}
                        </div>
                        <h2>Application Submitted!</h2>
                        <p>Our team is currently verifying your credentials. This process usually takes 24-48 hours.</p>
                        <div className="next-steps-list">
                            <div className="step-done"><i className="fa-solid fa-check-circle"></i> Profile Form Received</div>
                            <div className="step-process"><i className="fa-solid fa-spinner fa-spin"></i> Document Verification</div>
                            <div className="step-pending"><i className="fa-solid fa-circle-dot"></i> Profile Activation</div>
                        </div>
                        <Link to="/home" className="btn-return-home">Back to Home</Link>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default GuideRegistration;
