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
            return res.status(500).json({ error: "API Key missing. Add GEMINI_API_KEY to your Vercel/Environment variables." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Expanded model list for maximum resilience
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-8b",
            "gemini-2.0-flash-exp",
            "gemini-pro"
        ];

        let lastError = null;
        let attemptedModels = [];

        for (const modelName of modelsToTry) {
            try {
                attemptedModels.push(modelName);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return res.status(200).json({
                    text: response.text(),
                    model: modelName
                });
            } catch (e) {
                lastError = e;
                console.warn(`Model ${modelName} failed:`, e.message);

                // If it's a 429 (Quota), it might be specific to the model or global.
                // If it's a 404 (Not Found), definitely try the next one.
                if (e.status === 404) continue;
                if (e.status === 429) {
                    // If 429, we still try others because some models have different quotas
                    continue;
                }
                // For other errors, we might want to stop, but for now let's try all.
            }
        }

        // If we get here, all models failed
        const isQuotaError = lastError?.status === 429 || lastError?.message?.includes("quota");

        return res.status(lastError?.status || 500).json({
            error: lastError?.message || "All models failed",
            diagnostic: {
                attempted: attemptedModels,
                lastFailure: lastError?.message,
                isQuotaIssue: isQuotaError
            },
            suggestion: isQuotaError
                ? "Your API key has hit its daily limit. Please check https://aistudio.google.com/app/plan_and_billing or try a different key."
                : "Verify your API key is correct and assigned to a project with 'Generative Language API' enabled."
        });

    } catch (err) {
        console.error("Gemini Failure:", err);
        return res.status(500).json({ error: err.message });
    }
}
