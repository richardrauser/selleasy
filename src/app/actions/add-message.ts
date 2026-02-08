'use server';

import { db } from "@/lib/firebase-admin";

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

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding message:", error);
        return { success: false, error: "Failed to send message" };
    }
}
