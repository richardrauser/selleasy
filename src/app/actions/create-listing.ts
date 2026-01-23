'use server';

import { db } from "@/lib/firebase-admin";

interface CreateListingParams {
    title: string;
    description: string;
    quality: string;
    suggestedPrice: string;
    chosenPrice: string;
}

export async function createListing(data: CreateListingParams) {
    try {
        const docRef = await db.collection('listings').add({
            ...data,
            createdAt: new Date(),
            status: 'draft' // Initial status
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating listing:", error);
        return { success: false, error: "Failed to create listing" };
    }
}
