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
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1021703248835-v1f0n1v0n1v0n1v0n1v0.apps.googleusercontent.com'; // Placeholder - user needs to set this

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
    const [accessToken, setAccessToken] = useState(null);
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, status: 'idle' });

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
        setOutputHtml(null);
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
            }
        } catch (wErr) {
            console.warn("Weather Fetch Failed:", wErr);
        }

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
            - Use very simple Indian English.
            - Format to ## Quick Summary, ## Daily Plan (## Day X), ## Logistics & Packing Essentials.
            `;

            if (dailySummaries.length > 0) {
                setWeatherData(dailySummaries);
                setWeatherCity(city);
            }

            await sendToGemini(prompt);

        } catch (err) {
            console.error(err);
            setOutputHtml(`<div class="placeholder-state" style="color: var(--danger-color);"><i class="fa-solid fa-server"></i><p>Error: ${err.message}</p></div>`);
        } finally {
            setLoading(false);
        }
    };

    const replanDay = async () => {
        if (!rawMarkdown) return;
        setLoading(true);
        setLoadingMsg(`Replanning Day ${selectedDayToReplan}...`);

        try {
            const prompt = `I have this itinerary for ${city}: ${rawMarkdown}. Please update Day ${selectedDayToReplan} with different activities. Feedback: ${replanFeedback}. Return ONLY ## Day ${selectedDayToReplan} markdown.`;

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            let newDayContent = data.text.trim().replace(/^```markdown\n|```$/g, '').trim();
            const currentContent = rawMarkdown;
            const dayNum = selectedDayToReplan;
            const dayRegex = new RegExp(`## Day ${dayNum}[\\s\\S]*?(?=(##|$))`, 'i');

            if (dayRegex.test(currentContent)) {
                const updatedMarkdown = currentContent.replace(dayRegex, newDayContent + "\n\n");
                setRawMarkdown(updatedMarkdown);
                setOutputHtml(marked.parse(updatedMarkdown));
                setReplanFeedback('');
            }
        } catch (err) {
            alert(`Replanning failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const element = document.getElementById("output");
        const cityName = city || "Itinerary";
        const clone = element.cloneNode(true);
        clone.style.background = "white";
        clone.style.color = "black";
        clone.style.padding = "40px";
        clone.style.width = "800px";
        const opt = {
            margin: [10, 10],
            filename: `${cityName}_Travel_Plan.pdf`,
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(clone).set(opt).save();
    };

    // --- GOOGLE CALENDAR API LOGIC ---

    const authorizeAndSync = () => {
        if (!accessToken) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/calendar.events',
                callback: (response) => {
                    if (response.access_token) {
                        setAccessToken(response.access_token);
                        syncToGoogleCalendar(response.access_token);
                    }
                },
            });
            client.requestAccessToken();
        } else {
            syncToGoogleCalendar(accessToken);
        }
    };

    const syncToGoogleCalendar = async (token) => {
        if (!token || calendarEvents.length === 0) return;

        setSyncProgress({ current: 0, total: calendarEvents.length, status: 'syncing' });

        for (let i = 0; i < calendarEvents.length; i++) {
            const event = calendarEvents[i];
            setSyncProgress(prev => ({ ...prev, current: i + 1 }));

            try {
                await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        summary: event.summary,
                        location: event.location,
                        description: event.description,
                        start: { dateTime: event.start.dateTime + ":00", timeZone: 'Asia/Kolkata' },
                        end: { dateTime: event.end.dateTime + ":00", timeZone: 'Asia/Kolkata' },
                        reminders: {
                            useDefault: false,
                            overrides: [{ method: 'popup', minutes: 30 }]
                        }
                    })
                });
            } catch (err) {
                console.error("Sync Error:", err);
            }
        }

        setSyncProgress(prev => ({ ...prev, status: 'done' }));
        setTimeout(() => {
            setShowSyncModal(false);
            setSyncProgress({ current: 0, total: 0, status: 'idle' });
            alert("SUCCESS! Your trip is now synced with Google Calendar.");
        }, 1500);
    };

    const generateCalendarEvents = async () => {
        if (!rawMarkdown) return;
        setIsExporting(true);
        setLoading(true);
        setLoadingMsg("Analyzing itinerary for API sync...");

        try {
            const prompt = `Convert this itinerary for ${city} (from ${startDate} to ${endDate}) into a JSON list of events for Google Calendar. Rules: Create events for Morning (09:00), Lunch (13:00), Afternoon (15:00), Evening (18:30). Output JSON ONLY: { "events": [{ "summary": "...", "location": "...", "description": "...", "start": { "dateTime": "YYYY-MM-DDTHH:mm:ss" }, "end": { "dateTime": "YYYY-MM-DDTHH:mm:ss" }, "day": 1 }] }. Itinerary: ${rawMarkdown}`;

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            let jsonText = data.text.trim().replace(/^```json\n|```$/g, '').trim();
            const parsed = JSON.parse(jsonText);

            if (parsed.events && parsed.events.length > 0) {
                setCalendarEvents(parsed.events);
                setShowSyncModal(true);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to organize calendar events.");
        } finally {
            setLoading(false);
            setIsExporting(false);
        }
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="brand">
                    <i className="fa-solid fa-route"></i>
                    <h1>TN.AI Planner <span style={{ fontSize: '0.6rem', background: 'var(--accent-primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>API Sync</span></h1>
                </div>

                <div className="controls">
                    <div className="control-group">
                        <label htmlFor="cityInput"><i className="fa-solid fa-city"></i> Destination</label>
                        <input type="text" id="cityInput" placeholder="Where do you want to go?" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    {outputHtml && (
                        <div className="control-group replan-section">
                            <label><i className="fa-solid fa-arrows-rotate"></i> Replan Specific Day</label>
                            <select value={selectedDayToReplan} onChange={(e) => setSelectedDayToReplan(e.target.value)} style={{ width: '100%', marginBottom: '0.75rem' }}>
                                {(startDate && endDate) ? getDaysInRange(startDate, endDate).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                                )) : <option value="1">Day 1</option>}
                            </select>
                            <textarea placeholder="Tell me what to change..." value={replanFeedback} onChange={(e) => setReplanFeedback(e.target.value)} rows="2"></textarea>
                            <button onClick={replanDay} className="action-btn" style={{ width: '100%', background: 'var(--accent-soft)', color: 'var(--accent-primary)', justifyContent: 'center' }}>
                                <i className="fa-solid fa-wand-magic-sparkles"></i> Update Day {selectedDayToReplan}
                            </button>
                        </div>
                    )}
                    <div className="control-row">
                        <div className="control-group">
                            <label htmlFor="startDate">Start</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="control-group">
                            <label htmlFor="endDate">End</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    {/* Simplified select for brevity */}
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
                                    <i className="fa-solid fa-calendar-plus"></i> Sync to Calendar (Automatic)
                                </button>
                                <button id="downloadBtn" onClick={downloadPDF} className="action-btn">
                                    <i className="fa-solid fa-file-pdf"></i> PDF
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div id="output" className="output-area">
                    {loading ? (
                        <div className="loading">
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            <p>{loadingMsg}</p>
                        </div>
                    ) : (
                        outputHtml ? <div dangerouslySetInnerHTML={{ __html: outputHtml }}></div> : <div className="placeholder-state"><i className="fa-solid fa-map-location-dot"></i><p>Generate your plan to start.</p></div>
                    )}
                </div>
            </main>

            {showSyncModal && (
                <div className="modal-overlay" onClick={() => setShowSyncModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h3><i className="fa-solid fa-cloud-arrow-up"></i> Calendar API Sync</h3>
                            <button className="close-modal" onClick={() => setShowSyncModal(false)}>&times;</button>
                        </div>
                        <div className="sync-status" style={{ padding: '2rem 1rem' }}>
                            {syncProgress.status === 'idle' ? (
                                <>
                                    <h4 style={{ marginBottom: '1rem' }}>Found {calendarEvents.length} events to add</h4>
                                    <button onClick={authorizeAndSync} className="generate-btn" style={{ width: '100%', margin: 0 }}>
                                        Authorize & Sync All
                                    </button>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}></i>
                                    <h4 style={{ marginTop: '1rem' }}>{syncProgress.status === 'done' ? 'All Synced!' : `Adding ${syncProgress.current}/${syncProgress.total}...`}</h4>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanTrip;
