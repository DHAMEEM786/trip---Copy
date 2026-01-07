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
            return res.status(500).json({ error: "GEMINI_API_KEY is not configured in Vercel environment variables" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = "gemini-2.0-flash"; // Updated for 2026 stability
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            text: text,
        });
    } catch (err) {
        console.error("Gemini error:", err);
        return res.status(500).json({ error: err.message });
    }
}
