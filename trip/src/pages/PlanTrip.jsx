import React, { useEffect, useState } from 'react';
import { usePageTitle, usePageStyle, useScript } from '../hooks';

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
    const [rawMarkdown, setRawMarkdown] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [weatherCity, setWeatherCity] = useState('');
    const [showDownload, setShowDownload] = useState(false);
    const [selectedDayToReplan, setSelectedDayToReplan] = useState('1');
    const [replanFeedback, setReplanFeedback] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [showSyncModal, setShowSyncModal] = useState(false);

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

    const getWeatherIcon = (desc) => {
        const d = desc.toLowerCase();
        if (d.includes('clear')) return 'fa-sun';
        if (d.includes('cloud')) return 'fa-cloud';
        if (d.includes('rain')) return 'fa-cloud-rain';
        if (d.includes('snow')) return 'fa-snowflake';
        if (d.includes('thunder')) return 'fa-bolt';
        if (d.includes('mist') || d.includes('fog')) return 'fa-smog';
        return 'fa-cloud-sun';
    };

    const renderWeatherSection = (summaries, cityName) => {
        if (!summaries || summaries.length === 0) return "";

        const cards = summaries.map(s => `
<div class="weather-card">
    <span class="date">Day ${s.day}</span>
    <i class="fa-solid ${getWeatherIcon(s.desc)} weather-icon"></i>
    <span class="temp">${Math.round(s.temp)}°C</span>
    <span class="desc">${s.desc}</span>
</div>`).join('');

        return `
<div class="weather-section">
    <h3><i class="fa-solid fa-cloud-sun"></i> Weather Forecast for ${cityName}</h3>
    <div class="weather-grid">
        ${cards}
    </div>
</div>`;
    };

    const sendToGemini = async (prompt) => {
        try {
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gemini error");

            setRawMarkdown(data.text);
            const htmlContent = marked.parse(data.text);
            setOutputHtml(htmlContent);
            setShowDownload(true);
        } catch (e) {
            setOutputHtml(
                `<div class="placeholder-state" style="color:red">${e.message}</div>`
            );
        } finally {
            setLoading(false);
        }
    };


    const generatePlan = async () => {
        setOutputHtml(null); // Clear previous output
        setWeatherData(null);

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
            setLoading(false);
            return;
        }

        let weatherInfo = "";
        let dailySummaries = [];
        const days = getDaysInRange(startDate, endDate);

        // 1. Try to fetch weather
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

                weatherInfo = `### Weather Forecast for ${city}\n`;
                days.forEach((d, i) => {
                    const ds = d.toISOString().split("T")[0];
                    const f = forecastMap.get(ds);
                    if (f) {
                        const desc = f.weather[0].description;
                        const temp = f.main.temp;
                        weatherInfo += `- **${d.toDateString()}**: ${desc}, ${temp}°C\n`;
                        dailySummaries.push({ day: i + 1, desc, temp, date: d.toDateString() });
                    }
                });
            } else {
                console.warn("Weather API Error:", weatherData.message);
            }
        } catch (wErr) {
            console.warn("Weather Fetch Failed (continuing without weather):", wErr);
        }

        // 2. Generate Plan with Gemini
        try {
            setLoadingMsg("Drafting your professional itinerary...");

            const weatherSection = dailySummaries.length > 0
                ? `**Weather Brief:**\n${dailySummaries.map(d => `Day ${d.day}: ${d.desc}, ${d.temp}°C`).join('; ')}`
                : "**Weather:** Data unavailable (pack for seasonal norms).";

            const prompt = `Create a short and simple ${days.length}-day Tamil Nadu travel plan for ${city} (${startDate} to ${endDate}).
            
            **Traveler Info:**
            - Category: ${travelType}
            - Budget: ${budget}
            - Interest: ${placeType}
            
            ${weatherSection}
            
            **Guidelines:**
            - Use very simple, friendly Indian English (easy to understand).
            - Keep it concise. No long paragraphs.
            - Focus on the best local experiences.

            **Format:**
            ## Quick Summary
            (2-3 lines about the trip)

            ## Daily Plan
            (For each day, use ## Day X header)
            - **Morning**: [Top 1-2 activities]
            - **Lunch**: [1 suggestion]
            - **Afternoon**: [1-2 activities]
            - **Evening**: [Best spot for dinner/relaxing]

            ## Logistics & Packing Essentials
            - Best way to travel between spots.
            - 2-3 essential items for the weather.

            **CRITICAL:** Ensure every section (Summary, Day X, Logistics) starts with a ## header.
            `;

            if (dailySummaries.length > 0) {
                setWeatherData(dailySummaries);
                setWeatherCity(city);
            }

            await sendToGemini(prompt);

        } catch (err) {
            console.error(err);
            setOutputHtml(`<div class="placeholder-state" style="color: var(--danger-color);"><i class="fa-solid fa-server"></i><p>Critical Error: ${err.message}</p></div>`);
        } finally {
            setLoading(false);
        }
    };

    const replanDay = async () => {
        if (!rawMarkdown) return;

        setLoading(true);
        setLoadingMsg(`Replanning Day ${selectedDayToReplan}...`);

        try {
            const prompt = `I have this travel itinerary for ${city}:
            
            ${rawMarkdown}
            
            **OBJECTIVE:**
            Please provide DIFFERENT activities for **Day ${selectedDayToReplan}**. 
            
            **Specific Feedback:**
            ${replanFeedback || "Suggest entirely new local experiences, hidden gems, or different spots than the ones currently listed."}
            
            **Format to return (START DIRECTLY WITH THE HEADER):**
            ## Day ${selectedDayToReplan}
            - **Morning**: [NEW activity 1-2]
            - **Lunch**: [NEW suggest 1]
            - **Afternoon**: [NEW activity 1-2]
            - **Evening**: [NEW best spot]
            
            **CRITICAL:**
            - Return ONLY the updated markdown for Day ${selectedDayToReplan}.
            - DO NOT return the full itinerary.
            - Ensure the activities are DIFFERENT from what is currently in Day ${selectedDayToReplan}.
            - Use the same simple, friendly Indian English style.
            `;

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gemini error");

            let newDayContent = data.text.trim();
            // Remove markdown code block markers if Gemini included them
            newDayContent = newDayContent.replace(/^```markdown\n|```$/g, '').trim();

            // Surgical Swap logic using Regex
            const currentContent = rawMarkdown;
            const dayNum = selectedDayToReplan;

            // Look for ## Day {dayNum} followed by any content until we hit the next ## header OR the end of the string
            const dayRegex = new RegExp(`## Day ${dayNum}[\\s\\S]*?(?=(##|$))`, 'i');

            if (!dayRegex.test(currentContent)) {
                console.error("Content before regex fail:", currentContent);
                throw new Error(`Could not find the section for Day ${dayNum}. Please try generating a new plan.`);
            }

            const updatedMarkdown = currentContent.replace(dayRegex, newDayContent + "\n\n");

            setRawMarkdown(updatedMarkdown);
            setOutputHtml(marked.parse(updatedMarkdown));
            setReplanFeedback('');

        } catch (err) {
            console.error("Replan error:", err);
            alert(`Sorry, I couldn't update the plan: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

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

    const createGoogleCalendarUrl = (event) => {
        const start = event.start.dateTime.replace(/[-:]/g, '');
        const end = event.end.dateTime.replace(/[-:]/g, '');
        const details = encodeURIComponent(event.description || '');
        const location = encodeURIComponent(event.location || '');
        const summary = encodeURIComponent(event.summary || '');

        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${summary}&dates=${start}/${end}&details=${details}&location=${location}&trp=true`;
    };

    const generateCalendarEvents = async () => {
        console.log("!!! TRIGGERING GOOGLE CALENDAR SYNC MODAL !!!");
        if (!rawMarkdown) return;
        setIsExporting(true);
        setLoading(true);
        setLoadingMsg("Organizing your sync schedule...");

        try {
            const prompt = `You are a travel automation agent.

I will give you a travel itinerary in markdown format.
Your task is to convert it into a list of events.

### INPUTS
- City: ${city}
- Trip start date: ${startDate}
- Trip end date: ${endDate}
- Itinerary markdown:
${rawMarkdown}

### RULES
1. Create events ONLY for: Morning, Lunch, Afternoon, Evening.
2. Use realistic Indian travel times:
   - Morning: 09:00 – 11:30
   - Lunch: 13:00 – 14:00
   - Afternoon: 15:00 – 17:30
   - Evening: 18:30 – 20:30
3. Each event MUST include: summary, location, start.dateTime (YYYY-MM-DDTHH:mm:ss), end.dateTime (YYYY-MM-DDTHH:mm:ss), and description.
4. Output ONLY valid JSON:
{
  "events": [
    {
      "summary": "Meenakshi Temple Visit",
      "location": "Madurai",
      "description": "Explore the historic temple",
      "start": { "dateTime": "2026-01-10T09:00:00" },
      "end": { "dateTime": "2026-01-10T11:30:00" },
      "day": 1
    }
  ]
}
`;

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gemini error");

            console.log("RAW AI RESPONSE FOR CALENDAR:", data.text);

            let jsonText = data.text.trim();
            // Robust extraction: find content between first { and last }
            const firstBrace = jsonText.indexOf('{');
            const lastBrace = jsonText.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonText = jsonText.substring(firstBrace, lastBrace + 1);
            }

            try {
                const parsed = JSON.parse(jsonText);
                if (parsed.events && parsed.events.length > 0) {
                    setCalendarEvents(parsed.events);
                    setShowSyncModal(true);
                } else {
                    console.error("No events in parsed JSON:", parsed);
                    throw new Error("No events found in the itinerary.");
                }
            } catch (parseErr) {
                console.error("JSON Parse Error. Cleaned text:", jsonText);
                throw new Error("Could not understand the calendar data format from AI.");
            }
        } catch (err) {
            console.error("CALENDAR GENERATION FAILED:", err);
            alert(`Failed to organize calendar events: ${err.message}`);
        } finally {
            setLoading(false);
            setIsExporting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("JSON copied to clipboard!");
        });
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="brand">
                    <i className="fa-solid fa-route"></i>
                    <h1>TN.AI Planner <span style={{ fontSize: '0.6rem', background: 'var(--accent-primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>v2.0 - SYNC POPUP</span></h1>
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
                    {outputHtml && (
                        <div className="control-group replan-section">
                            <label><i className="fa-solid fa-arrows-rotate"></i> Replan Specific Day</label>

                            <select
                                value={selectedDayToReplan}
                                onChange={(e) => setSelectedDayToReplan(e.target.value)}
                                style={{ width: '100%', marginBottom: '0.75rem' }}
                            >
                                {(startDate && endDate) ? getDaysInRange(startDate, endDate).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                                )) : <option value="1">Day 1</option>}
                            </select>

                            <textarea
                                placeholder="Tell me what to change for this day... (e.g. 'less walking', 'more food')"
                                value={replanFeedback}
                                onChange={(e) => setReplanFeedback(e.target.value)}
                                rows="2"
                                style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}
                            ></textarea>

                            <button onClick={replanDay} className="action-btn" style={{ width: '100%', background: 'var(--accent-soft)', border: 'none', color: 'var(--accent-primary)', justifyContent: 'center' }}>
                                <i className="fa-solid fa-wand-magic-sparkles"></i> Update Day {selectedDayToReplan}
                            </button>
                        </div>
                    )}

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
                    <div className="actions" style={{ display: 'flex', gap: '0.75rem' }}>
                        {showDownload && (
                            <>
                                <button onClick={generateCalendarEvents} className="action-btn" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                                    <i className="fa-solid fa-calendar-plus"></i> Add to Calendar
                                </button>
                                <button id="downloadBtn" onClick={downloadPDF} className="action-btn">
                                    <i className="fa-solid fa-file-pdf"></i> Download PDF
                                </button>
                            </>
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
                        (outputHtml || weatherData) ? (
                            <>
                                {weatherData && (
                                    <div className="weather-section">
                                        <h3><i className="fa-solid fa-cloud-sun"></i> Weather Forecast for {weatherCity}</h3>
                                        <div className="weather-grid">
                                            {weatherData.map((s, idx) => (
                                                <div key={idx} className="weather-card">
                                                    <span className="date">Day {s.day}</span>
                                                    <i className={`fa-solid ${getWeatherIcon(s.desc)} weather-icon`}></i>
                                                    <span className="temp">{Math.round(s.temp)}°C</span>
                                                    <span className="desc">{s.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {outputHtml && <div dangerouslySetInnerHTML={{ __html: outputHtml }}></div>}
                            </>
                        ) : (
                            <div className="placeholder-state">
                                <i className="fa-solid fa-map-location-dot"></i>
                                <p>Enter your trip details to generate a personalized AI travel plan.</p>
                            </div>
                        )
                    )}
                </div>
            </main>

            {showSyncModal && (
                <div className="modal-overlay" onClick={() => setShowSyncModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
                        <div className="modal-header">
                            <h3><i className="fa-solid fa-calendar-check"></i> Sync to Google Calendar</h3>
                            <button className="close-modal" onClick={() => setShowSyncModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="sync-list" style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
                            {calendarEvents.map((event, idx) => (
                                <div key={idx} className="sync-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'var(--accent-soft)',
                                    borderRadius: '12px',
                                    marginBottom: '0.75rem',
                                    gap: '1rem',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{event.summary}</h4>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <i className="fa-solid fa-calendar-day"></i> Day {event.day}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <i className="fa-solid fa-clock"></i> {new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <a
                                        href={createGoogleCalendarUrl(event)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="action-btn"
                                        style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.6rem 1rem', fontSize: '0.85rem', textDecoration: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <i className="fa-solid fa-plus"></i> Add
                                    </a>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                <i className="fa-solid fa-circle-info"></i> Clicking "Add" will open a Google Calendar window. Click <strong>"Save"</strong> in that window to confirm.
                            </p>
                            <button className="action-btn" onClick={() => setShowSyncModal(false)} style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-soft)', color: 'var(--accent-primary)', border: 'none' }}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanTrip;
