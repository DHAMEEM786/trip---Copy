import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3 className="footer-logo">TN<span>Verse</span></h3>
                    <p>Exploring the unseen beauty of Tamil Nadu. Your journey, our passion.</p>
                </div>

                <div className="footer-links">
                    <div className="link-group">
                        <h4>Platform</h4>
                        <a href="/home">Home</a>
                        <a href="/trip-history">Adventures</a>
                        <a href="/wallet">Wallet</a>
                    </div>
                    <div className="link-group">
                        <h4>Support</h4>
                        <a href="#">Contact Us</a>
                        <a href="#">FAQ</a>
                        <a href="#">Safety</a>
                    </div>
                </div>

                <div className="footer-social">
                    <div className="social-icons">
                        <a href="#"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#"><i className="fa-brands fa-twitter"></i></a>
                        <a href="#"><i className="fa-brands fa-facebook"></i></a>
                        <a href="#"><i className="fa-brands fa-youtube"></i></a>
                    </div>
                    <p className="copyright">&copy; 2026 TNVerse. All rights reserved.</p>
                </div>
            </div>
            <div className="footer-bottom-line"></div>
        </footer>
    );
};

export default Footer;
