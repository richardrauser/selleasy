'use server';

import { getGeminiModel, GEMINI_MODELS } from "@/lib/gemini";

export async function analyzeImage(imageBase64: string, mimeType: string) {
    const model = getGeminiModel();

    if (!model) {
        return { success: false, error: "Server configuration error: API key missing." };
    }

    try {

        const prompt = `
        Analyze the image and identify the distinct items present.
        Return a JSON object with the following structure:
        {
            "items": [
                {
                    "id": "1",
                    "name": "Short item name",
                    "confidence": 0.95,
                    "title": "Suggested Title for this item",
                    "description": "Detailed description for this specific item, suitable for a sales listing.",
                    "quality": "Assessment of item condition (e.g. New, Good, Fair)",
                    "suggestedPrice": "Suggested resale price (e.g. $50 - $75)"
                },
                ...
            ]
        }
        Order the "items" array from highest confidence (probability of being the main subject) to lowest.
        Ensure the response is valid JSON without any markdown formatting.
        `;

        // base64 definition was removed in previous step, adding it back
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
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(text);
            return { success: true, data: data };
        } catch (e) {
            console.error("Error parsing JSON:", e);
            return { success: false, error: "Failed to parse analysis result." };
        }
    } catch (error) {
        console.error("Error analyzing image:", error);
        return { success: false, error: "Failed to analyze image." };
    }
}
