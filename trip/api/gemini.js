import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        return res.status(200).json({ status: "Service Active" });
    }

    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const { prompt } = body || {};
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API Key missing" });

        const genAI = new GoogleGenerativeAI(apiKey);

        // Most likely models for free tier in 2026
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
                return res.status(200).json({ text: response.text(), model: modelName });
            } catch (e) {
                lastError = e;
                // Proceed to next model for 404 (Not Found) or 429 (Quota)
                if (e.status === 404 || e.status === 429) continue;
                break;
            }
        }

        // If all failed, provide a dynamic list of models available to this key
        let availableModels = [];
        try {
            // Attempt to list models for diagnostic purposes
            // Note: listModels is not available on some SDK versions directly, 
            // but we can try to provide a clean error.
        } catch (listErr) { }

        return res.status(lastError?.status || 500).json({
            error: lastError?.message || "All models failed",
            suggestion: "If you see status 429, your API key has reached its limit. Check https://aistudio.google.com/app/plan_and_billing",
            diagnostic: {
                attemptedModels: modelsToTry,
                lastFailureStatus: lastError?.status
            }
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
