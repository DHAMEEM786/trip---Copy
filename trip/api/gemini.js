import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const { prompt } = body || {};

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY missing in server environment." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Attempt models in order of priority for free tier stability
        const models = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"];
        let lastError = null;

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return res.status(200).json({ text: response.text() });
            } catch (e) {
                lastError = e;
                if (e.status === 404) continue; // Try next if not found
                break; // Stop if it's a quota or other error
            }
        }

        throw lastError;

    } catch (err) {
        console.error("Gemini Failure:", err);
        return res.status(err.status || 500).json({
            error: err.message || "Internal Server Error",
        });
    }
}
