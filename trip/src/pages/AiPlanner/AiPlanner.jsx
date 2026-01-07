import React, { useState, useRef } from 'react';
import styles from './AiPlanner.module.css';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';

const GEMINI_KEY = "AIzaSyDovzH1o_DjmA3_yYeNGt_Zi-k_RhKLjGI";
const WEATHER_KEY = "b2c5b477f503ea54bffa1455a210ff49";

const AiPlanner = () => {
    // State
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [travelType, setTravelType] = useState('family');
    const [budget, setBudget] = useState('moderate');
    const [interest, setInterest] = useState('mixed');
    const [customPrompt, setCustomPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const outputRef = useRef(null);

    // Helpers
    const getDaysInRange = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        const days = [];
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }
        return days;
    };

    const handleGenerate = async () => {
        // Validation
        setError('');
        setResult('');

        if (!customPrompt) {
            if (!city) {
                setError('Please enter a destination city.');
                return;
            }
            if (!startDate || !endDate) {
                setError('Please select valid start and end dates.');
                return;
            }
        }

        setLoading(true);
        setLoadingMsg('Fetching weather data...');

        try {
            if (customPrompt) {
                await sendToGemini(customPrompt);
                return;
            }

            // Weather
            let weatherInfo = "";
            let dailySummaries = [];
            const days = getDaysInRange(startDate, endDate);

            try {
                setLoadingMsg('Checking forecast...');
                const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_KEY}&units=metric`);
                const weatherData = await weatherRes.json();

                if (weatherData.cod === "200") {
                    const forecastMap = new Map();
                    weatherData.list.forEach(e => {
                        const date = e.dt_txt.split(" ")[0];
                        if (!forecastMap.has(date)) forecastMap.set(date, e);
                    });

                    weatherInfo = `### Weather Forecast for ${city}\n`;
                    days.forEach((d, i) => {
                        const ds = d.toISOString().split("T")[0];
                        const f = forecastMap.get(ds);
                        if (f) {
                            const desc = f.weather[0].description;
                            const temp = f.main.temp;
                            weatherInfo += `- **${d.toDateString()}**: ${desc}, ${temp}°C\n`;
                            dailySummaries.push({ day: i + 1, desc, temp });
                        }
                    });
                }
            } catch (wErr) {
                console.warn("Weather info failed", wErr);
            }

            // Gemini
            setLoadingMsg('Drafting your professional itinerary...');
            const weatherSection = dailySummaries.length > 0
                ? `**Weather Brief:**\n${dailySummaries.map(d => `Day ${d.day}: ${d.desc}, ${d.temp}°C`).join('; ')}`
                : "**Weather:** Data unavailable (pack for seasonal norms).";

            const prompt = `Create a ${days.length}-day Exclusive Tamil Nadu Itinerary for ${city} (${startDate} to ${endDate}).
            
            **Client Profile:**
            - Type: ${travelType}
            - Budget Level: ${budget}
            - Interests: ${interest}
            
            ${weatherSection}
            
            **Requirements:**
            1. **Executive Summary**: A brief, inspiring overview of the trip.
            2. **Daily Agenda**: strictly formatted as:
               - **Morning (09:00 - 13:00)**: [Activities]
               - **Lunch**: [Restaurant Suggestion]
               - **Afternoon (14:00 - 18:00)**: [Activities]
               - **Evening**: [Relaxation/Dinner spots]
            3. **Logistics**: Transport tips and estimated daily costs.
            4. **Packing Essentials**: Based on the weather.
            5. Format in clean Markdown. Use H2 (##) for Day headers.
            `;

            await sendToGemini(prompt, weatherInfo);

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const sendToGemini = async (prompt, weatherInfo = "") => {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || res.statusText);

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const aiText = data.candidates[0].content.parts[0].text;
                const fullContent = (weatherInfo ? weatherInfo + "\n---\n" : "") + aiText;
                setResult(marked.parse(fullContent));
            } else {
                setError('The AI returned an empty response.');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const element = outputRef.current;
        if (!element) return;

        const opt = {
            margin: [10, 10],
            filename: `${city || 'Itinerary'}_Travel_Plan.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save();
    };

    return (
        <div className={styles.appContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <i className="fa-solid fa-route"></i>
                    <h1>TN.AI Planner</h1>
                </div>

                <div className={styles.controls}>
                    <div className={styles.controlGroup}>
                        <label className={styles.label}><i className="fa-solid fa-city"></i> Destination</label>
                        <input className={styles.input} type="text" placeholder="Where do you want to go?" value={city} onChange={e => setCity(e.target.value)} />
                    </div>

                    <div className={styles.controlRow}>
                        <div className={styles.controlGroup}>
                            <label className={styles.label}><i className="fa-regular fa-calendar"></i> Start</label>
                            <input className={styles.input} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className={styles.controlGroup}>
                            <label className={styles.label}><i className="fa-regular fa-calendar-check"></i> End</label>
                            <input className={styles.input} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    {/* Travelers */}
                    <div className={styles.controlGroup}>
                        <label className={styles.label}>Travelers</label>
                        <div className={styles.selectGrid}>
                            {[
                                { val: 'solo', icon: 'fa-person', label: 'Solo' },
                                { val: 'partner', icon: 'fa-heart', label: 'Couple' },
                                { val: 'family', icon: 'fa-users', label: 'Family' },
                                { val: 'friends', icon: 'fa-user-group', label: 'Friends' }
                            ].map(t => (
                                <button key={t.val}
                                    className={`${styles.selectBtn} ${travelType === t.val ? styles.selectBtnActive : ''}`}
                                    onClick={() => setTravelType(t.val)}>
                                    <i className={`fa-solid ${t.icon}`}></i> {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Budget */}
                    <div className={styles.controlGroup}>
                        <label className={styles.label}>Budget</label>
                        <div className={styles.selectGrid}>
                            {[
                                { val: 'cheap', label: 'Budget', sub: '$' },
                                { val: 'moderate', label: 'Standard', sub: '$$' },
                                { val: 'luxury', label: 'Luxury', sub: '$$$' }
                            ].map(b => (
                                <button key={b.val}
                                    className={`${styles.selectBtn} ${budget === b.val ? styles.selectBtnActive : ''}`}
                                    onClick={() => setBudget(b.val)}>
                                    <span>{b.sub}</span> {b.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interests */}
                    <div className={styles.controlGroup}>
                        <label className={styles.label}>Interests</label>
                        <div className={styles.selectGrid}>
                            {['mixed', 'adventure', 'waterfall', 'temple'].map(i => (
                                <button key={i}
                                    className={`${styles.selectBtn} ${interest === i ? styles.selectBtnActive : ''}`}
                                    onClick={() => setInterest(i)}>
                                    {i.charAt(0).toUpperCase() + i.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.controlGroup}>
                        <label className={styles.label}>Custom Requests</label>
                        <textarea className={styles.textarea} rows="3" placeholder="Specific requirements?" value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}></textarea>
                    </div>

                    <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> {loading ? 'Generating...' : 'Generate Itinerary'}
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <div className={styles.resultHeader}>
                    <h2>Your Itinerary</h2>
                    {result && (
                        <button className={styles.actionBtn} onClick={handleDownload}>
                            <i className="fa-solid fa-file-pdf"></i> Download PDF
                        </button>
                    )}
                </div>

                <div id="output" className={styles.outputArea} ref={outputRef}>
                    {loading && (
                        <div className={styles.loading}>
                            <i className="fa-solid fa-circle-notch"></i>
                            <p>{loadingMsg}</p>
                        </div>
                    )}

                    {!loading && !result && !error && (
                        <div className={styles.placeholderState}>
                            <i className="fa-solid fa-map-location-dot"></i>
                            <p>Enter your trip details to generate a personalized AI travel plan.</p>
                        </div>
                    )}

                    {error && (
                        <div className={styles.placeholderState} style={{ color: '#ef4444' }}>
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && result && (
                        <div dangerouslySetInnerHTML={{ __html: result }} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default AiPlanner;
