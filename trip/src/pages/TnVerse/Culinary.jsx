import React, { useState } from 'react';
import styles from './Culinary.module.css';

// Images removed, using local public paths

const Culinary = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', content: null });

    const openModal = (type) => {
        let title = '';
        let content = null;

        switch (type) {
            case 'trails':
                title = 'Food Trails';
                content = (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '10px' }}><strong>Chettinad Spice Trail:</strong> Karaikudi - Kanadukathan - Devakottai. (3 Days)</li>
                        <li style={{ marginBottom: '10px' }}><strong>Coastal Catch Trail:</strong> Chennai - Pondicherry - Nagapattinam. (4 Days)</li>
                        <li style={{ marginBottom: '10px' }}><strong>Kongu Nadu Flavor Trail:</strong> Coimbatore - Erode - Karur. (3 Days)</li>
                    </ul>
                );
                break;
            case 'networks':
                title = 'Cooking Networks';
                content = (
                    <p>Connect with over <strong>50+ home chefs</strong> across Tamil Nadu. Book immersive cooking sessions in heritage homes. Learn the secrets of <i>Achi's</i> kitchen.</p>
                );
                break;
            case 'experiences':
                title = 'Culinary Experiences';
                content = (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '10px' }}><strong>Farm-to-Plate:</strong> Harvest spices in Theni and cook a meal.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Temple Kitchen Tours:</strong> Witness the making of the massive <i>Madurai Azhagar Kovil Dosa</i>.</li>
                    </ul>
                );
                break;
            case 'ventures':
                title = 'Gourmet Ventures';
                content = (
                    <p>Shop exclusive GI-tagged products: <strong>Tirunelveli Halwa</strong>, <strong>Kovilpatti Kadalai Mittai</strong>, and <strong>Nilgiris Tea</strong>. Shipped globally.</p>
                );
                break;
            default:
                break;
        }

        setModalData({ title, content });
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    return (
        <div className={styles.culinaryPage}>
            {/* Hero Section */}
            <section className={styles.hero} style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/tn-verse/culinary/hero_bg.jpg')` }}>
                <h1>Arusuvai</h1>
                <p>The Six Tastes of Tamil Nadu. One Seamless Journey.</p>
                <a href="#concept" className={styles.ctaBtn}>Start Your Journey</a>
            </section>

            {/* The Concept (4 Pillars) */}
            <section id="concept" className={styles.concept}>
                <h2>The Ecosystem</h2>
                <div className={styles.pillarsGrid}>
                    <div className={styles.pillarCard} onClick={() => openModal('trails')}>
                        <i className={`fa-solid fa-route ${styles.pillarIcon}`}></i>
                        <h3>Food Trails</h3>
                        <p>Curated journeys through the history of taste. From the spice markets of Karaikudi to the coastal catch of Rameswaram.</p>
                    </div>
                    <div className={styles.pillarCard} onClick={() => openModal('networks')}>
                        <i className={`fa-solid fa-users ${styles.pillarIcon}`}></i>
                        <h3>Cooking Networks</h3>
                        <p>Connect with local custodians of cuisine. Dine in ancestral homes and learn secret recipes from the masters.</p>
                    </div>
                    <div className={styles.pillarCard} onClick={() => openModal('experiences')}>
                        <i className={`fa-solid fa-utensils ${styles.pillarIcon}`}></i>
                        <h3>Culinary Experiences</h3>
                        <p>Don't just eat—harvest, cook, and create. Farm-to-plate workshops and temple kitchen tours.</p>
                    </div>
                    <div className={styles.pillarCard} onClick={() => openModal('ventures')}>
                        <i className={`fa-solid fa-gift ${styles.pillarIcon}`}></i>
                        <h3>Gourmet Ventures</h3>
                        <p>Take the taste home. GI-tagged gift boxes, artisanal spice blends, and DIY filter coffee kits.</p>
                    </div>
                </div>
            </section>

            {/* Famous Foods Section */}
            <section id="foods" className={styles.foodSection}>
                <h2>Famous Foods of Tamil Nadu</h2>
                <div className={styles.foodGrid}>
                    {/* Food Item 1 */}
                    <div className={styles.foodCard}>
                        <img src="/tn-verse/culinary/chettinad_chicken.jpg" alt="Chettinad Chicken" />
                        <div className={styles.foodInfo}>
                            <h3>Chettinad Chicken</h3>
                            <p>A fiery curry from the Chettinad region, made with freshly ground spices, poppy seeds, and coconut.</p>
                        </div>
                    </div>
                    {/* Food Item 2 */}
                    <div className={styles.foodCard}>
                        <img src="/tn-verse/culinary/fish_curry.jpg" alt="Coastal Fish Curry" />
                        <div className={styles.foodInfo}>
                            <h3>Coastal Fish Curry</h3>
                            <p>Tangy and spicy fish curry made with tamarind and fresh catch from the Coromandel coast.</p>
                        </div>
                    </div>
                    {/* Food Item 3 */}
                    <div className={styles.foodCard}>
                        <img src="/tn-verse/culinary/kothu_parotta.jpg" alt="Kothu Parotta" />
                        <div className={styles.foodInfo}>
                            <h3>Kothu Parotta</h3>
                            <p>A street food classic! Flaky parotta shredded and stir-fried with eggs, meat, and spicy salna.</p>
                        </div>
                    </div>
                    {/* Food Item 4 */}
                    <div className={styles.foodCard}>
                        <img src="/tn-verse/culinary/filter_coffee.jpg" alt="Filter Coffee" />
                        <div className={styles.foodInfo}>
                            <h3>Madras Filter Coffee</h3>
                            <p>Strong, frothy coffee brewed in a traditional metal filter and served in a 'davara' tumbler.</p>
                        </div>
                    </div>
                    {/* Food Item 5 */}
                    <div className={styles.foodCard}>
                        <img src="https://placehold.co/600x400/92400E/FFFFFF?text=Jigarthanda" alt="Jigarthanda" />
                        <div className={styles.foodInfo}>
                            <h3>Madurai Jigarthanda</h3>
                            <p>A cooling dessert drink made with milk, almond gum, sarsaparilla root syrup, and ice cream.</p>
                        </div>
                    </div>
                    {/* Food Item 6 */}
                    <div className={styles.foodCard}>
                        <img src="https://placehold.co/600x400/D97706/FFFFFF?text=Halwa" alt="Tirunelveli Halwa" />
                        <div className={styles.foodInfo}>
                            <h3>Tirunelveli Halwa</h3>
                            <p>A rich, dark wheat halwa glistening with ghee, famous for its melt-in-the-mouth texture.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Hotels Section */}
            <section id="hotels" className={styles.hotelSection}>
                <h2>Best Culinary Hotels by District</h2>
                <div className={styles.hotelTableContainer}>
                    <table className={styles.hotelTable}>
                        <thead>
                            <tr>
                                <th>District</th>
                                <th>Hotel Name</th>
                                <th>Specialty Cuisine</th>
                                <th>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Chennai</td>
                                <td>ITC Grand Chola</td>
                                <td>Royal Indian / Peshawri</td>
                                <td><i className={`fa-solid fa-star ${styles.hotelRating}`}></i> 5.0</td>
                            </tr>
                            <tr>
                                <td>Chennai</td>
                                <td>Sangeetha Veg Restaurant</td>
                                <td>Authentic South Indian Veg</td>
                                <td><i className={`fa-solid fa-star ${styles.hotelRating}`}></i> 4.5</td>
                            </tr>
                            <tr>
                                <td>Madurai</td>
                                <td>Heritage Madurai</td>
                                <td>Traditional Madurai Feast</td>
                                <td><i className={`fa-solid fa-star ${styles.hotelRating}`}></i> 4.8</td>
                            </tr>
                            <tr>
                                <td>Madurai</td>
                                <td>Amma Mess</td>
                                <td>Non-Veg Delicacies (Bone Marrow Omelette)</td>
                                <td><i className={`fa-solid fa-star ${styles.hotelRating}`}></i> 4.6</td>
                            </tr>
                            <tr>
                                <td>Karaikudi</td>
                                <td>The Bangala</td>
                                <td>Authentic Chettinad Heritage</td>
                                <td><i className={`fa-solid fa-star ${styles.hotelRating}`}></i> 4.9</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Interactive Map Teaser */}
            <section className={styles.mapSection}>
                <h2>Explore the Flavor Map</h2>
                <p>Click on a region to discover its signature dish and book your trail.</p>
                <div className={styles.mapContainer}>
                    <div className={styles.mapOverlay}>
                        <h3>Interactive Map Coming Soon</h3>
                        <p>Visualize your culinary route across Tamil Nadu.</p>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>&copy; 2024 TN Verse - Arusuvai. Celebrating the Heritage of Taste.</p>
            </footer>

            {/* Modal */}
            {modalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <span className={styles.closeBtn} onClick={closeModal}>&times;</span>
                        <h2 className={styles.modalTitle}>{modalData.title}</h2>
                        <div>{modalData.content}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Culinary;
