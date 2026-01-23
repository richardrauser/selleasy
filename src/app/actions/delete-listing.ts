'use server';

import { db } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function deleteListing(id: string) {
    try {
        await db.collection('listings').doc(id).delete();
        revalidatePath('/listings');
        return { success: true };
    } catch (error) {
        console.error("Error deleting listing:", error);
        return { success: false, error: "Failed to delete listing" };
    }
}
