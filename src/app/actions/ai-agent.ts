'use server';

import { getListing } from "./get-listing";
import { getGeminiModel } from "@/lib/gemini";
import { getMessages } from "./get-messages";
import { db } from "@/lib/firebase-admin";

export async function generateAIResponse(listingId: string, userMessage: string, senderName: string) {
    console.log(`[AI Agent] Triggered for listing ${listingId} by ${senderName}`);

    try {
        // 1. Get Listing Details
        const { success: listingSuccess, data: listing } = await getListing(listingId);
        if (!listingSuccess || !listing) {
            console.error("[AI Agent] Listing not found or fetch failed");
            return;
        }

        // 2. Get recent message history
        const { success: msgSuccess, data: messages } = await getMessages(listingId);
        const recentMessages = msgSuccess && messages ? messages.slice(-5) : [];

        const historyText = recentMessages.map(m => `${m.senderName}: ${m.content}`).join("\n");

        // 3. Initialize Gemini
        const model = getGeminiModel();
        if (!model) {
            console.error("[AI Agent] Gemini model invalid (API Key missing?)");
            return;
        }

        // 4. Construct Prompt
        const systemPrompt = `
        You are an intelligent sales assistant for an item listing.
        Your goal is to answer questions, negotiate price, and be helpful to potential buyers.
        
        Item Details:
        - Title: ${listing.title}
        - Description: ${listing.description}
        - Quality/Condition: ${listing.quality}
        - Asking Price: $${listing.chosenPrice}
        
        Guidelines:
        - Answer questions based ONLY on the item description. If you don't know, say you don't know but the item looks great.
        - Negotiate the price if the user asks. You are authorized to accept offers that are within 15% of the Asking Price.
        - If an offer is too low, politely counter-offer with a price closer to the Asking Price.
        - Be friendly, professional, and concise.
        - Do not start your message with "AI Agent:" or similar. Just speak naturally.
        `;

        const chatLayout = `
        Conversation History:
        ${historyText}

        User (${senderName}) just said: "${userMessage}"
        
        Reply to ${senderName}:
        `;

        const fullPrompt = systemPrompt + "\n\n" + chatLayout;

        console.log("[AI Agent] Generating content...");
        // 5. Generate Response
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const aiText = response.text();

        console.log("[AI Agent] Response generated, length:", aiText.length);

        if (aiText) {
            // 6. Save AI Message directly to avoid circular dependency with add-message.ts
            const messageData = {
                listingId,
                senderName: "Selleasy Agent",
                content: aiText,
                createdAt: new Date()
            };

            await db.collection('listings').doc(listingId).collection('messages').add(messageData);
            console.log("[AI Agent] Response saved to Firestore");
        }

    } catch (error) {
        console.error("[AI Agent] Error generating response:", error);
    }
}
