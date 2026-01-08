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
            1. **Quick Summary**: 2-3 lines about the trip.
            2. **Daily Plan**:
               - **Morning**: [Top 1-2 activities]
               - **Lunch**: [1 suggestion]
               - **Afternoon**: [1-2 activities]
               - **Evening**: [Best spot for dinner/relaxing]
            3. **Short Tips**: 2-3 helpful points for transport or packing.
            
            Use H2 (##) for Day headers and Markdown for lists.
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
            
            Please rewrite ONLY the content for **Day ${selectedDayToReplan}** based on this feedback:
            ${replanFeedback || "Suggest different local experiences or hidden gems."}
            
            **Format to return (START DIRECTLY WITH THE HEADER):**
            ## Day ${selectedDayToReplan}
            - **Morning**: ...
            - **Lunch**: ...
            - **Afternoon**: ...
            - **Evening**: ...
            
            **CRITICAL:**
            - Return ONLY the markdown for Day ${selectedDayToReplan}.
            - DO NOT return the full itinerary.
            - DO NOT return any "Here is your plan" or concluding text. 
            - Use the same simple Indian English style.
            `;

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gemini error");

            const newDayContent = data.text.trim();

            // Surgical Swap logic
            let currentContent = rawMarkdown;
            const dayHeader = `## Day ${selectedDayToReplan}`;
            const nextDayHeader = `## Day ${parseInt(selectedDayToReplan) + 1}`;
            const tipsHeader = `3. **Short Tips**`;

            let startIndex = currentContent.indexOf(dayHeader);
            if (startIndex === -1) {
                throw new Error("Could not find the specific day section to update in the current plan.");
            }

            // Find where this day section ends
            let endIndex = currentContent.indexOf(nextDayHeader, startIndex + dayHeader.length);
            if (endIndex === -1) {
                endIndex = currentContent.indexOf(tipsHeader, startIndex + dayHeader.length);
            }
            if (endIndex === -1) {
                endIndex = currentContent.length;
            }

            const updatedMarkdown =
                currentContent.substring(0, startIndex).trim() +
                "\n\n" +
                newDayContent +
                "\n\n" +
                currentContent.substring(endIndex).trim();

            setRawMarkdown(updatedMarkdown);
            setOutputHtml(marked.parse(updatedMarkdown));
            setReplanFeedback('');

        } catch (err) {
            console.error("Replan error:", err);
            // Optionally inform the user
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

    return (
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
                    <div className="actions">
                        {showDownload && (
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
        </div>
    );
};

export default PlanTrip;
