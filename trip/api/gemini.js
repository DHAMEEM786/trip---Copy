import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { prompt } = body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // safer for production
      contents: prompt,
    });

    return res.status(200).json({
      text: response.text,
    });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      error: err.message || "Server error",
    });
  }
}