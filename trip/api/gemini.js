import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API Key missing" });

        const genAI = new GoogleGenerativeAI(apiKey);

        // Models to try in priority order
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-pro",
            "gemini-1.5-pro"
        ];

        let lastError = null;
        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return res.status(200).json({ text: response.text(), model: modelName });
            } catch (err) {
                console.warn(`Model ${modelName} failed: ${err.message}`);
                lastError = err;
                // If it's a quota issue (429), switching models might not help, but we try anyway.
                // If it's a not found (404), we definitely try the next one.
            }
        }

        // If all failed, provide a super detailed diagnostic
        return res.status(lastError?.status || 500).json({
            error: lastError.message,
            diagnostic: "All models failed. This usually means your API Key is restricted or out of quota.",
            suggestion: "Check your quota at https://aistudio.google.com/app/plan_and_billing. Ensure 'Generative Language API' is enabled."
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
