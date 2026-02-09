'use server';

import { db } from "@/lib/firebase-admin";
import { generateAIResponse } from "./ai-agent";

export interface Message {
    id: string;
    listingId: string;
    senderName: string;
    content: string;
    createdAt: number;
}

interface AddMessageParams {
    listingId: string;
    senderName: string;
    content: string;
}

export async function addMessage({ listingId, senderName, content }: AddMessageParams) {
    if (!content.trim() || !senderName.trim()) {
        return { success: false, error: "Name and message are required" };
    }

    try {
        const messageData = {
            listingId,
            senderName,
            content,
            createdAt: new Date()
        };

        const docRef = await db.collection('listings').doc(listingId).collection('messages').add(messageData);

        // Trigger AI Agent if message is from a user (not the agent itself)
        if (senderName !== "Selleasy Agent") {
            // We await this to ensure it runs in the serverless environment,
            // though for UX speed we might want a job queue in production.
            await generateAIResponse(listingId, content, senderName);
        }

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding message:", error);
        return { success: false, error: "Failed to send message" };
    }
}
