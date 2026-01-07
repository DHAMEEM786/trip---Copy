import "dotenv/config";         
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

console.log("Gemini key loaded:", process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Gemini backend running on http://localhost:5000");
});
