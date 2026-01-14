import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODELS = {
    PRO: "gemini-3-pro-preview",
    FLASH: "gemini-3-flash-preview"
};

export function getGeminiModel(modelName: string = GEMINI_MODELS.FLASH) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return null;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
}
