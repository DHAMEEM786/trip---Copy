// NOTE: For security, never hardcode API keys directly in client-side code in a real-world application.
// These should be handled on a secure backend server.
const GEMINI_KEY = "AIzaSyDovzH1o_DjmA3_yYeNGt_Zi-k_RhKLjGI";
const WEATHER_KEY = "b2c5b477f503ea54bffa1455a210ff49";

document.addEventListener('DOMContentLoaded', () => {
  // Setup toggle buttons
  ['#travelTypeOptions', '#budgetOptions', '#placeTypeOptions'].forEach(selector => {
    document.querySelectorAll(selector + ' .select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(selector + ' .select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });
});

function getDaysInRange(start, end) {
  const s = new Date(start),
    e = new Date(end);
  const days = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) days.push(new Date(d));
  return days;
}

// Show loading state
function showLoading(show, message = "Generating Plan...") {
  const output = document.getElementById("output");
  if (show) {
    output.innerHTML = `
      <div class="loading">
        <i class="fa-solid fa-circle-notch"></i>
        <p>${message}</p>
      </div>
    `;
  } else {
    // Clear loading only if we are about to show content, otherwise strictly handled by content update
  }
}

async function generatePlan() {
  const city = document.getElementById("cityInput").value.trim();
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  const travelType = document.querySelector('#travelTypeOptions .select-btn.active').dataset.value;
  const budget = document.querySelector('#budgetOptions .select-btn.active').dataset.value;
  const placeType = document.querySelector('#placeTypeOptions .select-btn.active').dataset.value;
  const custom = document.getElementById("customPrompt").value.trim();

  const output = document.getElementById("output");
  const downloadBtn = document.getElementById("downloadBtn");

  // Validation
  if (!custom) {
    if (!city) {
      output.innerHTML = `<div class="placeholder-state" style="color: var(--danger-color);"><i class="fa-solid fa-circle-exclamation"></i><p>Please enter a destination city.</p></div>`;
      return;
    }
    if (!start || !end) {
      output.innerHTML = `<div class="placeholder-state" style="color: var(--danger-color);"><i class="fa-solid fa-calendar-xmark"></i><p>Please select valid start and end dates.</p></div>`;
      return;
    }
  }

  downloadBtn.style.display = "none";
  showLoading(true, "Fetching weather data...");

  if (custom) {
    await sendToGemini(custom, output);
    return;
  }

  let weatherInfo = "";
  let dailySummaries = [];
  const days = getDaysInRange(start, end);

  // 1. Try to fetch weather (Optional)
  try {
    showLoading(true, "Checking forecast...");
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
    } else {
      console.warn("Weather API Error:", weatherData.message);
    }
  } catch (wErr) {
    console.warn("Weather Fetch Failed (continuing without weather):", wErr);
  }

  // 2. Generate Plan with Gemini
  try {
    showLoading(true, "Drafting your professional itinerary...");

    const weatherSection = dailySummaries.length > 0
      ? `**Weather Brief:**\n${dailySummaries.map(d => `Day ${d.day}: ${d.desc}, ${d.temp}°C`).join('; ')}`
      : "**Weather:** Data unavailable (pack for seasonal norms).";

    const prompt = `Create a ${days.length}-day Exclusive Tamil Nadu Itinerary for ${city} (${start} to ${end}).
    
    **Client Profile:**
    - Type: ${travelType}
    - Budget Level: ${budget}
    - Interests: ${placeType}
    
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

    await sendToGemini(prompt, output, weatherInfo);

  } catch (err) {
    console.error(err);
    output.innerHTML = `<div class="placeholder-state" style="color: var(--danger-color);"><i class="fa-solid fa-server"></i><p>Critical Error: ${err.message}</p></div>`;
  }
}

async function sendToGemini(prompt, output, weatherInfo = "") {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || res.statusText);
    }

    const downloadBtn = document.getElementById("downloadBtn");

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const aiText = data.candidates[0].content.parts[0].text;

      const fullContent = (weatherInfo ? weatherInfo + "\n---\n" : "") + aiText;
      const htmlContent = marked.parse(fullContent);

      output.innerHTML = htmlContent;
      downloadBtn.style.display = "flex";

    } else {
      output.innerHTML = `<div class="placeholder-state"><i class="fa-solid fa-robot"></i><p>The AI returned an empty response.</p></div>`;
      downloadBtn.style.display = "none";
    }
  } catch (e) {
    console.error(e);
    output.innerHTML = `<div class="placeholder-state" style="color: var(--danger-color);"><i class="fa-solid fa-triangle-exclamation"></i><p>Error: ${e.message}</p></div>`;
    downloadBtn.style.display = "none";
  }
}

function downloadPDF() {
  const element = document.getElementById("output");
  const city = document.getElementById("cityInput").value.trim() || "Itinerary";

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
    filename: `${city}_Travel_Plan.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().from(clone).set(opt).save();
}