'use server';

import { db } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

interface UpdateListingParams {
    id: string;
    title: string;
    description: string;
    quality: string;
    chosenPrice: string;
}

export async function updateListing(data: UpdateListingParams) {
    try {
        const { id, ...updates } = data;
        await db.collection('listings').doc(id).update({
            ...updates,
            updatedAt: new Date()
        });

        revalidatePath(`/listings/${id}`); // Revalidate specific listing
        revalidatePath('/listings'); // Revalidate listings list
        return { success: true };
    } catch (error) {
        console.error("Error updating listing:", error);
        return { success: false, error: "Failed to update listing" };
    }
}
