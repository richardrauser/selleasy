'use server';

import { db } from "@/lib/firebase-admin";
import { Message } from "./add-message";

export async function getMessages(listingId: string) {
    try {
        const messagesSnapshot = await db.collection('listings')
            .doc(listingId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .get();

        const messages: Message[] = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            listingId,
            ...doc.data(),
            createdAt: doc.data().createdAt.toMillis()
        })) as Message[];

        return { success: true, data: messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { success: false, error: "Failed to fetch messages" };
    }
}
