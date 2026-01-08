import React, { useEffect, useState } from 'react';
import { usePageTitle, usePageStyle, useScript } from '../hooks';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PlanTrip = () => {
    usePageTitle('Tamil Nadu Travel Planner AI');
    usePageStyle('/ai api/style.css'); // Assuming style.css is in public/ai api/

    // Load libraries
    useScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");
    useScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js");

    const GEMINI_KEY = import.meta.env.GEMINI_API_KEY;
    const WEATHER_KEY = import.meta.env.WEATHER_API_KEY;

    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [outputHtml, setOutputHtml] = useState(null);
    const [showDownload, setShowDownload] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [refiningIndex, setRefiningIndex] = useState(null); // {dayIndex, activityIndex}

    // Form State
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [travelType, setTravelType] = useState('family');
    const [budget, setBudget] = useState('moderate');
    const [placeType, setPlaceType] = useState('mixed');
    const [customPrompt, setCustomPrompt] = useState('');

    const getDaysInRange = (start, end) => {
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
            Structure:
            {
              "summary": "Brief overview",
              "days": [
                {
                  "day": 1,
                  "activities": [
                    { "time": "Morning (09:00 - 13:00)", "activity": "..." },
                    { "time": "Lunch", "activity": "..." },
                    { "time": "Afternoon (14:00 - 18:00)", "activity": "..." },
                    { "time": "Evening", "activity": "..." }
                  ]
                }
              ],
              "logistics": "Transport & Costs",
              "packing": "Essentials"
            }`;

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: `${systemPrompt}\n\nUser Request: ${prompt}` })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gemini error");

            // Clean the response from potential markdown blocks
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
                setOutputHtml(`<div class="placeholder-state" style="color:red">Failed to generate plan. Please try again.</div>`);
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
        setLoadingMsg("Fetching weather data...");

        if (customPrompt) {
            await sendToGemini(customPrompt);
            return;
        }

        let weatherInfo = "";
        let dailySummaries = [];
        const days = getDaysInRange(startDate, endDate);

        try {
            setLoadingMsg("Checking forecast...");
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
                        dailySummaries.push(`Day ${i + 1}: ${f.weather[0].description}, ${f.main.temp}°C`);
                    }
                });
                weatherInfo = dailySummaries.join("; ");
            }
        } catch (wErr) {
            console.warn("Weather Fetch Failed");
        }

        try {
            setLoadingMsg("Drafting your personalized itinerary...");
            const prompt = `Create a ${days.length}-day itinerary for ${city} from ${startDate} to ${endDate}.
            Travelers: ${travelType}. Budget: ${budget}. Interests: ${placeType}.
            Weather: ${weatherInfo || "Data unavailable"}.`;

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
            
            Respond with the FULL updated JSON itinerary with ONLY the requested change applied.`;

            const updatedItinerary = await sendToGemini(prompt, true);
            setItinerary(updatedItinerary);
        } catch (e) {
            alert("Failed to update activity. Please try again.");
        } finally {
            setRefiningIndex(null);
        }
    };

    const renderMarkdown = (text) => {
        if (!text) return "";
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    const downloadPDF = () => {
        const element = document.getElementById("output");
        const cityName = city || "Itinerary";

        // Clone to styling for PDF (Light Mode)
        const clone = element.cloneNode(true);
        clone.style.background = "white";
        clone.style.color = "black";
        clone.style.padding = "40px";
        clone.style.width = "800px"; // Fixed width for A4 consistency
        clone.style.border = "none";

        // Fix Headers for PDF
        const headers = clone.querySelectorAll('h1, h2, h3, strong');
        headers.forEach(h => h.style.color = "#0f172a");

        // Fix Links
        const links = clone.querySelectorAll('a');
        links.forEach(l => l.style.color = "#2563eb");

        const opt = {
            margin: [10, 10],
            filename: `${cityName}_Travel_Plan.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            // eslint-disable-next-line no-undef
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // eslint-disable-next-line no-undef
        html2pdf().from(clone).set(opt).save();
    };

    return (
        <div style={{ paddingTop: '80px' }}>
            <Navbar />
            <div className="app-container">
                <aside className="sidebar">
                    <div className="brand">
                        <i className="fa-solid fa-route"></i>
                        <h1>TN.AI Planner</h1>
                    </div>

                    <div className="controls">
                        <div className="control-group">
                            <label htmlFor="cityInput"><i className="fa-solid fa-city"></i> Destination</label>
                            <input
                                type="text"
                                id="cityInput"
                                placeholder="Where do you want to go?"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>

                        <div className="control-row">
                            <div className="control-group">
                                <label htmlFor="startDate"><i className="fa-regular fa-calendar"></i> Start</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="control-group">
                                <label htmlFor="endDate"><i className="fa-regular fa-calendar-check"></i> End</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Travelers</label>
                            <div className="select-grid" id="travelTypeOptions">
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
                            <div className="select-grid" id="budgetOptions">
                                {[
                                    { val: 'cheap', label: 'Budget', icon: '$' },
                                    { val: 'moderate', label: 'Standard', icon: '$$' },
                                    { val: 'luxury', label: 'Luxury', icon: '$$$' }
                                ].map(item => (
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

                        <div className="control-group">
                            <label>Interests</label>
                            <div className="select-grid" id="placeTypeOptions">
                                {[
                                    { val: 'mixed', label: 'Mixed' },
                                    { val: 'adventure', label: 'Adventure' },
                                    { val: 'waterfall', label: 'Nature' },
                                    { val: 'temple', label: 'Heritage' }
                                ].map(item => (
                                    <button
                                        key={item.val}
                                        className={`select-btn ${placeType === item.val ? 'active' : ''}`}
                                        onClick={() => setPlaceType(item.val)}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="control-group">
                            <label htmlFor="customPrompt">Custom Requests</label>
                            <textarea
                                id="customPrompt"
                                rows="3"
                                placeholder="Specific requirements? (e.g., wheelchair access, vegan food)"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                            ></textarea>
                        </div>

                        <button onClick={generatePlan} className="generate-btn">
                            <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Itinerary
                        </button>
                    </div>
                </aside>

                <main className="main-content">
                    <div className="result-header">
                        <h2>Your Itinerary</h2>
                        <div className="actions">
                            {showDownload && itinerary && (
                                <button id="downloadBtn" onClick={downloadPDF} className="action-btn">
                                    <i className="fa-solid fa-file-pdf"></i> Download PDF
                                </button>
                            )}
                        </div>
                    </div>

                    <div id="output" className="output-area">
                        {loading ? (
                            <div className="loading">
                                <i className="fa-solid fa-circle-notch"></i>
                                <p>{loadingMsg}</p>
                            </div>
                        ) : (
                            itinerary ? (
                                <div className="itinerary-json-view">
                                    <div className="itinerary-summary">
                                        <p>{itinerary.summary}</p>
                                    </div>

                                    {itinerary.days.map((day, dIdx) => (
                                        <div key={dIdx} className="itinerary-day">
                                            <h3>Day {day.day}</h3>
                                            <div className="activities-grid">
                                                {day.activities.map((act, aIdx) => {
                                                    const isRefining = refiningIndex?.dayIdx === dIdx && refiningIndex?.actIdx === aIdx;
                                                    return (
                                                        <div key={aIdx} className={`activity-card ${isRefining ? 'refining' : ''}`}>
                                                            <div className="activity-time">{act.time}</div>
                                                            <div className="activity-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(act.activity) }}>
                                                            </div>
                                                            <div className="activity-edit">
                                                                <button
                                                                    className="refine-btn"
                                                                    onClick={() => {
                                                                        const feedback = prompt(`What would you like to change about this ${act.time} activity?`, act.activity);
                                                                        if (feedback && feedback !== act.activity) {
                                                                            handleRefineActivity(dIdx, aIdx, feedback);
                                                                        }
                                                                    }}
                                                                >
                                                                    <i className="fa-solid fa-pen-to-square"></i> Refine
                                                                </button>
                                                            </div>
                                                            {isRefining && (
                                                                <div className="card-loader">
                                                                    <i className="fa-solid fa-circle-notch fa-spin"></i> Refining...
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="itinerary-footer-info">
                                        <div className="info-section">
                                            <h4><i className="fa-solid fa-truck-ramp-box"></i> Logistics</h4>
                                            <p>{itinerary.logistics}</p>
                                        </div>
                                        <div className="info-section">
                                            <h4><i className="fa-solid fa-suitcase"></i> Packing Essentials</h4>
                                            <p>{itinerary.packing}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : outputHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: outputHtml }}></div>
                            ) : (
                                <div className="placeholder-state">
                                    <i className="fa-solid fa-map-location-dot"></i>
                                    <p>Enter your trip details to generate a personalized AI travel plan.</p>
                                </div>
                            )
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default PlanTrip;
