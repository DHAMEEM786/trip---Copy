import React, { useEffect, useState } from 'react';
import { usePageTitle, usePageStyle, useScript } from '../hooks';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PlanTrip = () => {
    usePageTitle('Tamil Nadu Travel Planner AI');
    usePageStyle('/ai api/style.css');

    // Load libraries
    const markedStatus = useScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js");
    const html2pdfStatus = useScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");

    const WEATHER_KEY = import.meta.env.WEATHER_API_KEY;

    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [outputHtml, setOutputHtml] = useState(null);
    const [showDownload, setShowDownload] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [refiningIndex, setRefiningIndex] = useState(null);

    // Form State
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [travelType, setTravelType] = useState('family');
    const [budget, setBudget] = useState('moderate');
    const [placeType, setPlaceType] = useState('mixed');
    const [customPrompt, setCustomPrompt] = useState('');

    const getDaysInRange = (start, end) => {
        if (!start || !end) return [];
        const s = new Date(start),
            e = new Date(end);
        const days = [];
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) days.push(new Date(d));
        return days;
    };

    const sendToGemini = async (prompt, isRefinement = false) => {
        try {
            const systemPrompt = `You are an expert travel planner for Tamil Nadu. 
            Respond ONLY with a valid JSON object. 
            Do not include any markdown formatting like \`\`\`json or backticks.
            Use premium, descriptive language. Highlight key places/restaurants in **bold**.
            
            Structure:
            {
              "weather_overview": [
                { "date": "Day 1 Date", "forecast": "broken clouds, 27°C" }
              ],
              "summary": "Brief executive overview with emotional hook",
              "days": [
                {
                  "day": 1,
                  "title": "Arrival & Initial Exploration",
                  "date": "2026-01-07",
                  "day_weather": "broken clouds, 27°C",
                  "activities": [
                    { "time": "Morning (09:00 - 13:00)", "activity": "Arrive at **Madurai airport**..." },
                    { "time": "Lunch", "activity": "Dine at **Murugan Idli Shop**..." },
                    { "time": "Afternoon (14:00 - 18:00)", "activity": "Visit **Meenakshi Temple**..." },
                    { "time": "Evening", "activity": "Relax at hotel..." }
                  ]
                }
              ],
              "logistics": "Detailed transport & cost info. Use bullet points internally.",
              "packing": "Clothing, footwear, and accessories tailored to the trip."
            }`;

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: `${systemPrompt}\n\nUser Request: ${prompt}` })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gemini error");

            const cleanJson = data.text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);

            if (isRefinement) {
                return parsed;
            } else {
                setItinerary(parsed);
                setShowDownload(true);
            }
        } catch (e) {
            console.error("Gemini Error:", e);
            if (!isRefinement) {
                setOutputHtml(`<div class="placeholder-state" style="color:red">Failed to generate plan: ${e.message}</div>`);
            }
            throw e;
        } finally {
            if (!isRefinement) setLoading(false);
        }
    };

    const generatePlan = async () => {
        setItinerary(null);
        setOutputHtml(null);

        if (!customPrompt) {
            if (!city) {
                setOutputHtml(`<div class="placeholder-state" style="color: var(--danger-color);"><i class="fa-solid fa-circle-exclamation"></i><p>Please enter a destination city.</p></div>`);
                return;
            }
            if (!startDate || !endDate) {
                setOutputHtml(`<div class="placeholder-state" style="color: var(--danger-color);"><i class="fa-solid fa-calendar-xmark"></i><p>Please select valid start and end dates.</p></div>`);
                return;
            }
        }

        setShowDownload(false);
        setLoading(true);
        setLoadingMsg("Checking local weather patterns...");

        let weatherInfo = "";
        let dailySummaries = [];
        const days = getDaysInRange(startDate, endDate);

        try {
            const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_KEY}&units=metric`);
            const weatherData = await weatherRes.json();

            if (weatherData.cod === "200") {
                const forecastMap = new Map();
                weatherData.list.forEach(e => {
                    const date = e.dt_txt.split(" ")[0];
                    if (!forecastMap.has(date)) forecastMap.set(date, e);
                });

                days.forEach((d, i) => {
                    const ds = d.toISOString().split("T")[0];
                    const f = forecastMap.get(ds);
                    if (f) {
                        dailySummaries.push(`${ds}: ${f.weather[0].description}, ${f.main.temp}°C`);
                    }
                });
                weatherInfo = dailySummaries.join("; ");
            }
        } catch (wErr) {
            console.warn("Weather Fetch Failed");
        }

        try {
            setLoadingMsg("Crafting your cinematic TN journey...");
            const prompt = `Create a detailed travel plan for ${city} from ${startDate} to ${endDate}.
            Travelers: ${travelType}. Budget: ${budget}. Interests: ${placeType}.
            Weather Forecast: ${weatherInfo || "Data unavailable"}. ${customPrompt ? `Special Requests: ${customPrompt}` : ""}`;

            await sendToGemini(prompt);
        } catch (err) {
            setLoading(false);
        }
    };

    const handleRefineActivity = async (dayIdx, actIdx, feedback) => {
        setRefiningIndex({ dayIdx, actIdx });
        try {
            const currentPlan = JSON.stringify(itinerary);
            const prompt = `Based on the following itinerary, please refine Day ${dayIdx + 1}, Activity "${itinerary.days[dayIdx].activities[actIdx].time}".
            Feedback: ${feedback}
            
            Current Itinerary: ${currentPlan}
            
            Respond with the FULL updated JSON itinerary with ONLY the requested change applied. Ensure bold highlights are preserved.`;

            const updatedItinerary = await sendToGemini(prompt, true);
            setItinerary(updatedItinerary);
        } catch (e) {
            alert("Failed to update activity. Please try again.");
        } finally {
            setRefiningIndex(null);
        }
    };

    const downloadPDF = () => {
        const element = document.getElementById("output");
        if (!element || typeof html2pdf === 'undefined') {
            alert("Tools are still loading...");
            return;
        }

        const clone = element.cloneNode(true);

        // Remove interactive buttons for PDF
        clone.querySelectorAll('.activity-edit, .card-loader').forEach(btn => btn.remove());

        clone.style.background = "white";
        clone.style.color = "#1a1a1a";
        clone.style.padding = "20mm";
        clone.style.fontSize = "11pt";
        clone.style.lineHeight = "1.5";
        clone.style.fontFamily = "'Inter', system-ui, sans-serif";

        const opt = {
            margin: 0,
            filename: `${city || 'My'}_Trip_Plan.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // eslint-disable-next-line no-undef
        html2pdf().from(clone).set(opt).save();
    };

    const renderMarkdown = (text) => {
        if (!text) return "";
        // Simple regex for bold as fallback if marked isn't ready
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8fafc' }}>
            <Navbar />
            <div className="app-container">
                <aside className="sidebar">
                    <div className="brand">
                        <i className="fa-solid fa-route"></i>
                        <h1>TN.AI Planner</h1>
                    </div>

                    <div className="controls">
                        <div className="control-group">
                            <label><i className="fa-solid fa-city"></i> Destination</label>
                            <input
                                type="text"
                                placeholder="Enter city name..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>

                        <div className="control-row">
                            <div className="control-group">
                                <label><i className="fa-regular fa-calendar"></i> Start</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="control-group">
                                <label><i className="fa-regular fa-calendar-check"></i> End</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Travelers</label>
                            <div className="select-grid">
                                {['solo', 'partner', 'family', 'friends'].map(type => (
                                    <button
                                        key={type}
                                        className={`select-btn ${travelType === type ? 'active' : ''}`}
                                        onClick={() => setTravelType(type)}
                                    >
                                        <i className={`fa-solid ${type === 'solo' ? 'fa-person' : type === 'partner' ? 'fa-heart' : type === 'family' ? 'fa-users' : 'fa-user-group'}`}></i> {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Budget</label>
                            <div className="select-grid">
                                {[{ val: 'cheap', label: 'Budget', icon: '$' }, { val: 'moderate', label: 'Standard', icon: '$$' }, { val: 'luxury', label: 'Luxury', icon: '$$$' }].map(item => (
                                    <button
                                        key={item.val}
                                        className={`select-btn ${budget === item.val ? 'active' : ''}`}
                                        onClick={() => setBudget(item.val)}
                                    >
                                        <span>{item.icon}</span> {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={generatePlan} className="generate-btn" disabled={loading}>
                            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            {loading ? " Designing..." : " Generate Itinerary"}
                        </button>
                    </div>
                </aside>

                <main className="main-content">
                    <div className="result-header">
                        <h2>Personalized Outcome</h2>
                        {showDownload && (
                            <button onClick={downloadPDF} className="action-btn">
                                <i className="fa-solid fa-file-pdf"></i> Save PDF
                            </button>
                        )}
                    </div>

                    <div id="output" className="output-area document-view">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loader"></div>
                                <p>{loadingMsg}</p>
                            </div>
                        ) : itinerary ? (
                            <div className="itinerary-document">
                                {/* Weather Section */}
                                {itinerary.weather_forecast && (
                                    <section className="itinerary-section no-bullet">
                                        <h3>Weather Forecast for {city}</h3>
                                        <ul className="weather-list">
                                            {itinerary.weather_forecast.map((w, i) => (
                                                <li key={i}><span>→</span> <strong>{w.date}</strong>: {w.forecast}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {/* Executive Summary */}
                                <section className="itinerary-section">
                                    <h3>Executive Summary</h3>
                                    <p className="summary-text">{itinerary.summary}</p>
                                </section>

                                {/* Daily Agenda */}
                                <section className="itinerary-section">
                                    <h3>Daily Agenda</h3>
                                    {itinerary.days.map((day, dIdx) => (
                                        <div key={dIdx} className="day-agenda">
                                            <h4>Day {day.day}: {day.title} ({day.date})</h4>
                                            <p className="day-weather"><em>Weather: {day.day_weather}</em></p>
                                            <div className="activities-list">
                                                {day.activities.map((act, aIdx) => {
                                                    const isRefining = refiningIndex?.dayIdx === dIdx && refiningIndex?.actIdx === aIdx;
                                                    return (
                                                        <div key={aIdx} className={`activity-item ${isRefining ? 'refining' : ''}`}>
                                                            <div className="activity-main">
                                                                <span className="arrow">→</span>
                                                                <div className="activity-text">
                                                                    <strong>{act.time}:</strong> <span dangerouslySetInnerHTML={{ __html: renderMarkdown(act.activity) }}></span>
                                                                </div>
                                                                <div className="activity-edit">
                                                                    <button
                                                                        className="mini-refine-btn"
                                                                        onClick={() => {
                                                                            const feedback = prompt(`Refine ${act.time}:`, act.activity);
                                                                            if (feedback) handleRefineActivity(dIdx, aIdx, feedback);
                                                                        }}
                                                                    >
                                                                        <i className="fa-solid fa-wand-sparkles"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {isRefining && <div className="refining-overlay"><i className="fa-solid fa-circle-notch fa-spin"></i> Refining...</div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </section>

                                {/* Logistics */}
                                <section className="itinerary-section">
                                    <h3>Logistics</h3>
                                    <div className="document-p" dangerouslySetInnerHTML={{ __html: renderMarkdown(itinerary.logistics) }}></div>
                                </section>

                                {/* Packing */}
                                <section className="itinerary-section">
                                    <h3>Packing Essentials</h3>
                                    <div className="document-p" dangerouslySetInnerHTML={{ __html: renderMarkdown(itinerary.packing) }}></div>
                                </section>
                            </div>
                        ) : outputHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: outputHtml }}></div>
                        ) : (
                            <div className="empty-state">
                                <i className="fa-solid fa-map-marked-alt"></i>
                                <p>Your premium Tamil Nadu experience starts here.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default PlanTrip;
