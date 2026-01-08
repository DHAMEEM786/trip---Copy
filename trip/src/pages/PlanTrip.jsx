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

    const sendToGemini = async (prompt, isRefinement = false) => {
        try {
            const systemPrompt = `You are an expert travel planner for Tamil Nadu. 
            Respond ONLY with a valid JSON object. Do not include markdown blocks.
            
            Structure:
            {
              "weather_forecast": [
                { "date": "Date", "forecast": "weather, temp" }
              ],
              "summary": "Executive summary text.",
              "days": [
                {
                  "day": 1,
                  "title": "Title",
                  "date": "Date",
                  "day_weather": "weather, temp",
                  "activities": [
                    { "time": "Morning (09:00 - 13:00)", "activity": "Activity text with **bold** highlights." }
                  ]
                }
              ],
              "logistics": [
                { "item": "Transport", "details": ["Detail 1", "Detail 2"] },
                { "item": "Costs", "details": ["Detail 1"] }
              ],
              "packing": [
                { "category": "Clothing", "tips": ["Tip 1"] }
              ]
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
                setOutputHtml(`<div class="placeholder-state" style="color:red">Failed: ${e.message}</div>`);
            }
            throw e;
        } finally {
            if (!isRefinement) setLoading(false);
        }
    };

    const generatePlan = async () => {
        if (!city || !startDate || !endDate) {
            alert("Please fill in city and dates.");
            return;
        }

        setItinerary(null);
        setOutputHtml(null);
        setShowDownload(false);
        setLoading(true);
        setLoadingMsg("Checking local weather...");

        let weatherInfo = "";
        try {
            const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_KEY}&units=metric`);
            const weatherData = await weatherRes.json();

            if (weatherData.cod === "200") {
                const forecastLines = [];
                const seenDates = new Set();
                weatherData.list.forEach(e => {
                    const dateStr = e.dt_txt.split(" ")[0];
                    if (!seenDates.has(dateStr)) {
                        forecastLines.push(`${dateStr}: ${e.weather[0].description}, ${e.main.temp}°C`);
                        seenDates.add(dateStr);
                    }
                });
                weatherInfo = forecastLines.join("; ");
            }
        } catch (wErr) {
            console.warn("Weather error", wErr);
        }

        setLoadingMsg("Crafting plan with weather data...");
        const prompt = `Create a trip for ${city} (${startDate} to ${endDate}). Travelers: ${travelType}. Budget: ${budget}.
        WEATHER DATA TO INCLUDE IN OUTPUT: ${weatherInfo || "N/A"}. ${customPrompt}`;

        await sendToGemini(prompt);
    };

    const handleRefineActivity = async (dayIdx, actIdx, feedback) => {
        setRefiningIndex({ dayIdx, actIdx });
        try {
            const prompt = `Refine Day ${dayIdx + 1}, Activity "${itinerary.days[dayIdx].activities[actIdx].time}" based on: ${feedback}. 
            Retain full JSON structure. Itinerary: ${JSON.stringify(itinerary)}`;
            const updated = await sendToGemini(prompt, true);
            setItinerary(updated);
        } catch (e) {
            alert("Refinement failed.");
        } finally {
            setRefiningIndex(null);
        }
    };

    const downloadPDF = () => {
        const element = document.getElementById("output");
        if (!element || typeof html2pdf === 'undefined') return;

        const clone = element.cloneNode(true);
        clone.querySelectorAll('.activity-edit, .refining-overlay, .mini-refine-btn').forEach(el => el.remove());

        clone.style.background = "white";
        clone.style.width = "190mm";
        clone.style.padding = "10mm";

        const opt = {
            margin: 10,
            filename: `${city}_Itinerary.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // eslint-disable-next-line no-undef
        html2pdf().from(clone).set(opt).save();
    };

    const renderMarkdown = (text) => {
        if (!text) return "";
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f1f5f9' }}>
            <Navbar />
            <div className="app-container">
                <aside className="sidebar">
                    <div className="brand">
                        <i className="fa-solid fa-route"></i>
                        <h1>TN.AI Planner</h1>
                    </div>
                    <div className="controls">
                        <div className="control-group">
                            <label>Destination City</label>
                            <input type="text" placeholder="e.g. Madurai" value={city} onChange={e => setCity(e.target.value)} />
                        </div>
                        <div className="control-row">
                            <div className="control-group"><label>Start</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                            <div className="control-group"><label>End</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                        </div>
                        <div className="control-group">
                            <label>Travelers</label>
                            <div className="select-grid">
                                {['solo', 'partner', 'family', 'friends'].map(t => (
                                    <button key={t} className={`select-btn ${travelType === t ? 'active' : ''}`} onClick={() => setTravelType(t)}>{t}</button>
                                ))}
                            </div>
                        </div>
                        <div className="control-group">
                            <label>Budget</label>
                            <div className="select-grid">
                                {['cheap', 'moderate', 'luxury'].map(b => (
                                    <button key={b} className={`select-btn ${budget === b ? 'active' : ''}`} onClick={() => setBudget(b)}>{b}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={generatePlan} className="generate-btn" disabled={loading}>
                            {loading ? "Planning..." : "Generate Plan"}
                        </button>
                    </div>
                </aside>

                <main className="main-content">
                    <div className="result-header">
                        <h2>Personalized Itinerary</h2>
                        {showDownload && <button onClick={downloadPDF} className="action-btn">Download PDF</button>}
                    </div>

                    <div id="output" className="output-area document-view">
                        {loading ? (
                            <div className="loading-state"><div className="loader"></div><p>{loadingMsg}</p></div>
                        ) : itinerary ? (
                            <div className="itinerary-document">
                                {/* Weather Section */}
                                {itinerary.weather_forecast && (
                                    <section className="doc-section">
                                        <h3>Weather Forecast for {city}</h3>
                                        <ul className="doc-weather-list">
                                            {itinerary.weather_forecast.map((w, i) => (
                                                <li key={i}><span>→</span> <strong>{w.date}</strong>: {w.forecast}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                                <hr />

                                {/* Executive Summary */}
                                <section className="doc-section with-bullet">
                                    <h3>Executive Summary</h3>
                                    <p>{itinerary.summary}</p>
                                </section>
                                <hr />

                                {/* Daily Agenda */}
                                <section className="doc-section with-bullet">
                                    <h3>Daily Agenda</h3>
                                    {itinerary.days.map((day, dIdx) => (
                                        <div key={dIdx} className="doc-day">
                                            <h4>Day {day.day}: {day.title} ({day.date})</h4>
                                            <p className="doc-day-weather"><em>Weather: {day.day_weather}</em></p>
                                            <div className="doc-activities">
                                                {day.activities.map((act, aIdx) => {
                                                    const isRefining = refiningIndex?.dayIdx === dIdx && refiningIndex?.actIdx === aIdx;
                                                    return (
                                                        <div key={aIdx} className="doc-activity-item">
                                                            <span>→</span>
                                                            <div className="doc-activity-content">
                                                                <strong>{act.time}:</strong> <span dangerouslySetInnerHTML={{ __html: renderMarkdown(act.activity) }}></span>
                                                                <button className="mini-refine-btn" onClick={() => {
                                                                    const f = prompt("What to change?", act.activity);
                                                                    if (f) handleRefineActivity(dIdx, aIdx, f);
                                                                }}><i className="fa-solid fa-wand-sparkles"></i></button>
                                                            </div>
                                                            {isRefining && <div className="refining-overlay">Refining...</div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </section>
                                <hr />

                                {/* Logistics */}
                                <section className="doc-section with-bullet">
                                    <h3>Logistics</h3>
                                    {itinerary.logistics.map((log, lIdx) => (
                                        <div key={lIdx} className="doc-log-item">
                                            <span>→</span> <strong>{log.item}:</strong>
                                            <ul className="doc-sub-list">
                                                {log.details.map((det, dIdx) => <li key={dIdx}><span>→</span> {det}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </section>
                                <hr />

                                {/* Packing */}
                                <section className="doc-section with-bullet">
                                    <h3>Packing Essentials</h3>
                                    {itinerary.packing.map((pack, pIdx) => (
                                        <div key={pIdx} className="doc-pack-item">
                                            <span>→</span> <strong>{pack.category}:</strong>
                                            <ul className="doc-sub-list">
                                                {pack.tips.map((tip, tIdx) => <li key={tIdx}><span>→</span> {tip}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </section>
                            </div>
                        ) : (
                            <div className="empty-state"><i className="fa-solid fa-map-location-dot"></i><p>Ready to plan your trip.</p></div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default PlanTrip;
