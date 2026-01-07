import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Add a friendly health check for browser visits (GET)
    if (req.method === 'GET') {
        return res.status(200).json({
            status: "Service Active",
            message: "The Gemini AI service is running. Use POST to send prompts.",
            environment: process.env.VERCEL ? "Production" : "Development"
        });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const { prompt } = body || {};

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required in request body." });
        }

        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API Key missing. Please check your .env or Vercel settings." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-8b",
            "gemini-pro"
        ];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return res.status(200).json({
                    text: response.text(),
                    model: modelName
                });
            } catch (e) {
                lastError = e;
                if (e.status === 404) continue;
                if (e.status === 429) continue;
            }
        }

        return res.status(lastError?.status || 500).json({
            error: lastError?.message || "All models failed",
            suggestion: "If you see status 429, your API key has reached its limit. Check https://aistudio.google.com/app/plan_and_billing"
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
