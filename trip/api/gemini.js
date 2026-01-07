import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Add CORS headers for Vercel
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
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Please add it to your environment variables." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // List of models to try in order of preference
        const modelsToTry = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-pro"
        ];

        let lastError = null;
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                return res.status(200).json({
                    text: text,
                    modelUsed: modelName
                });
            } catch (err) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err;
                // If it's a 429 (Quota) for one model, it might work for another, so we continue the loop
            }
        }

        // If all models failed
        console.error("All Gemini models failed:", lastError);
        return res.status(lastError?.status || 500).json({
            error: lastError.message,
            suggestion: "Your API key might have reached its free tier limit. Please check https://aistudio.google.com/app/plan_and_billing"
        });

    } catch (err) {
        console.error("Critical Gemini error:", err);
        return res.status(500).json({ error: err.message });
    }
}
