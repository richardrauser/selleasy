'use server';

import { getGeminiModel, GEMINI_MODELS } from "@/lib/gemini";

export async function suggestPriceFromDescription(item: string, description: string, quality: string) {
    const model = getGeminiModel();

    if (!model) {
        return { success: false, error: "Server configuration error: API key missing." };
    }

    try {

        const prompt = `
        Based on the following product details, suggest a reasonable resale price range.
        Item: "${item}"
        Description: "${description}"
        Quality/Condition: "${quality}"
        
        Return ONLY a JSON object in the following format:
        {
            "suggestedPrice": "$XX - $YY"
        }
        Do not include any other text or markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(text);
            return { success: true, data: data };
        } catch (e) {
            console.error("Error parsing JSON:", e);
            return { success: false, error: "Failed to parse price suggestion." };
        }
    } catch (error) {
        console.error("Error suggesting price:", error);
        return { success: false, error: "Failed to suggest price." };
    }
}
