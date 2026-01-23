'use server';

import { db } from "@/lib/firebase-admin";

export interface Listing {
    id: string;
    title: string;
    description: string;
    quality: string;
    suggestedPrice: string;
    chosenPrice: string;
    createdAt?: Date;
    status: string;
    imageBase64?: string;
}

const ITEMS_PER_PAGE = 10;

export async function getListings(page: number = 1) {
    try {
        const offset = (page - 1) * ITEMS_PER_PAGE;

        // Note: For large datasets in Firestore, using 'offset' can be expensive.
        // A cursor-based approach (startAfter) is more scalable but harder to implement with simple page numbers.
        // For this task, we'll use offset assuming a reasonable number of items.

        const snapshot = await db.collection('listings')
            .orderBy('createdAt', 'desc')
            .limit(ITEMS_PER_PAGE)
            .offset(offset)
            .get();

        const listings: Listing[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            listings.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                quality: data.quality,
                suggestedPrice: data.suggestedPrice,
                chosenPrice: data.chosenPrice,
                createdAt: data.createdAt?.toDate(), // Convert Firestore Timestamp to Date
                status: data.status,
                imageBase64: data.imageBase64
            });
        });

        // Get total count for pagination controls (this can also be expensive/slow on large collections, but fine for scale of this app)
        // In a real high-scale app, we might maintain a distributed counter.
        const countSnapshot = await db.collection('listings').count().get();
        const totalItems = countSnapshot.data().count;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        return {
            success: true,
            data: listings,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems
            }
        };

    } catch (error) {
        console.error("Error fetching listings:", error);
        return { success: false, error: "Failed to fetch listings" };
    }
}
