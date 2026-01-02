'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function analyzeImage(imageBase64: string, mimeType: string) {
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return { success: false, error: "Server configuration error: API key missing." };
    }

    try {
        // trying gemini-3.0-pro but "Gemini 3 pro" may not yet be standard/released publicly via this SDK.
        // Downgrade to gemini-1.5-pro is the latest capable vision model.
        const model = genAI.getGenerativeModel({ model: "gemini-3.0-pro" });

        const prompt = "Describe the item in this photo in detail, suitable for a sales listing. Focus on condition, brand, color, and key features.";

        // imageBase64 might come with "data:image/jpeg;base64," prefix.
        // robustly handle it:
        const base64Data = imageBase64.includes('base64,')
            ? imageBase64.split('base64,')[1]
            : imageBase64;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        return { success: true, description: text };
    } catch (error) {
        console.error("Error analyzing image:", error);
        return { success: false, error: "Failed to analyze image." };
    }
}
