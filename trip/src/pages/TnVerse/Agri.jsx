import React, { useState } from 'react';
import styles from './Agri.module.css';

const agriData = [
    {
        id: 1,
        name: "Pollachi Coconut Farm",
        image: "/tn-verse/agri/pollachi_coconut.png",
        desc: "Experience rural life in lush coconut groves.",
        location: "Pollachi"
    },
    {
        id: 2,
        name: "Kodaikanal Organic Farm",
        image: "/tn-verse/agri/kodaikanal_organic.png",
        desc: "Fresh produce and sustainable farming practices.",
        location: "Kodaikanal"
    },
    {
        id: 3,
        name: "Nilgiris Tea Estate",
        image: "/tn-verse/agri/nilgiris_tea.png",
        desc: "Walk through aromatic tea gardens and factories.",
        location: "Ooty"
    },
    {
        id: 4,
        name: "Valparai Coffee Estates",
        image: "/tn-verse/agri/valparai_coffee.png",
        desc: "Brew your senses with fresh coffee plantation tours.",
        location: "Valparai"
    }
];

const Agri = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', content: null });

    const openModal = (type) => {
        let title = '';
        let content = null;

        switch (type) {
            case 'plantation':
                title = "Plantation Visits";
                content = (
                    <p>Explore the lush greenery of Tamil Nadu's hill stations. Participate in tea leaf plucking, visit processing factories, and enjoy tea tasting sessions. <strong>Highlights:</strong> Ooty, Coonoor, Valparai, Yercaud.</p>
                );
                break;
            case 'farmstay':
                title = "Farm-stay Experiences";
                content = (
                    <p>Disconnect from the city and reconnect with nature. Stay in traditional farmhouses, engage in farming activities like sowing and harvesting, and enjoy authentic home-cooked meals. <strong>Highlights:</strong> Pollachi, Theni, Dindigul.</p>
                );
                break;
            case 'village':
                title = "Village Tourism";
                content = (
                    <p>Experience the timeless traditions of Tamil villages. Watch artisans at work – from the potters of Vilachery to the weavers of Arni. Participate in village festivals and folk dances. <strong>Highlights:</strong> Chettinad, Thanjavur belt.</p>
                );
                break;
            case 'livelihood':
                title = "Rural Livelihood Support";
                content = (
                    <p>Your travel can make a difference. Support local economies by purchasing direct from producers. Visit women's self-help groups and craft centers. <strong>Products:</strong> Pattamadai mats, Thanjavur dolls, organic spices.</p>
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
        <div className={styles.agriPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <img
                    src="/tn-verse/agri/village_life_hero.png"
                    alt="Rural Village Life"
                    className={styles.heroBgImage}
                />
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1>Marutham</h1>
                    <p>Return to the Roots. Experience the Soul of Tamil Nadu.</p>
                    <a href="#concept" className={styles.ctaBtn}>Explore Rural Life</a>
                </div>
            </section>

            {/* The Concept (4 Pillars) */}
            <section id="concept" className={styles.concept}>
                <h2>The Rural Experience</h2>
                <div className={styles.pillarsGrid}>
                    <div className={styles.pillarCard} onClick={() => openModal('plantation')}>
                        <i className={`fa-solid fa-leaf ${styles.pillarIcon}`}></i>
                        <h3>Plantation Visits</h3>
                        <p>Walk through the mist-clad tea gardens of Nilgiris and aromatic coffee estates of Yercaud.</p>
                    </div>
                    <div className={styles.pillarCard} onClick={() => openModal('farmstay')}>
                        <i className={`fa-solid fa-house-chimney-window ${styles.pillarIcon}`}></i>
                        <h3>Farm-stay Experiences</h3>
                        <p>Live the rustic life. Wake up to rooster calls, milk cows, and enjoy fresh organic produce.</p>
                    </div>
                    <div className={styles.pillarCard} onClick={() => openModal('village')}>
                        <i className={`fa-solid fa-people-group ${styles.pillarIcon}`}></i>
                        <h3>Village Tourism</h3>
                        <p>Immerse in the culture. Witness pottery in Vilachery, weaving in Kanchipuram, and folk arts.</p>
                    </div>
                    <div className={styles.pillarCard} onClick={() => openModal('livelihood')}>
                        <i className={`fa-solid fa-hands-holding-circle ${styles.pillarIcon}`}></i>
                        <h3>Rural Livelihood Support</h3>
                        <p>Empower local communities. Buy GI-tagged crafts and spices directly from artisans and farmers.</p>
                    </div>
                </div>
            </section>

            {/* Featured Destinations Section */}
            <section id="destinations" className={styles.destinationsSection}>
                <h2>Featured Rural Escapes</h2>
                <div className={styles.destinationsGrid}>
                    {agriData.map((item) => (
                        <div key={item.id} className={styles.destinationCard}>
                            <img src={item.image} alt={item.name} />
                            <div className={styles.destinationInfo}>
                                <h3>{item.name}</h3>
                                <p>{item.desc}</p>
                                <span><i className="fa-solid fa-location-dot"></i> {item.location}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer className={styles.footer}>
                <p>&copy; 2024 TN Verse - Marutham. Celebrating the Land and its People.</p>
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

export default Agri;
