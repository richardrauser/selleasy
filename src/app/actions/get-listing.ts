'use server';

import { db } from "@/lib/firebase-admin";
import { Listing } from "./get-listings";

export async function getListing(id: string) {
    try {
        const doc = await db.collection('listings').doc(id).get();

        if (!doc.exists) {
            return { success: false, error: "Listing not found" };
        }

        const data = doc.data();
        if (!data) {
            return { success: false, error: "Listing data is empty" };
        }

        const listing: Listing = {
            id: doc.id,
            title: data.title,
            description: data.description,
            quality: data.quality,
            suggestedPrice: data.suggestedPrice,
            chosenPrice: data.chosenPrice,
            createdAt: data.createdAt?.toDate(),
            status: data.status,
            imageBase64: data.imageBase64
        };

        return { success: true, data: listing };

    } catch (error) {
        console.error("Error fetching listing:", error);
        return { success: false, error: "Failed to fetch listing" };
    }
}
