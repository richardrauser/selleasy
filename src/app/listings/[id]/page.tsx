import { getListing } from "@/app/actions/get-listing";
import Link from "next/link";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import ListingDetails from "@/components/ListingDetails";
import ListingMessages from "@/components/ListingMessages";
import { getMessages } from "@/app/actions/get-messages";

export default async function ListingDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Await params as required in Next.js 15+
    const { id } = await params;

    const [listingResult, messagesResult] = await Promise.all([
        getListing(id),
        getMessages(id)
    ]);

    const { success, data: listing, error } = listingResult;
    // Messages are optional, so if error, just empty array or handle gracefully
    const messages = messagesResult.success && messagesResult.data ? messagesResult.data : [];

    if (!success || !listing) {
        // In a real app, you might distinguish between "not found" (404) and "error" (500)
        // For simplicity, we'll try to show notFound() if key missing, or nice error if failed.
        if (error === "Listing not found") {
            notFound();
        }
        return (
            <main className={styles.pageContainer}>
                <Link href="/listings" className={styles.backLink}>
                    ← Back to Listings
                </Link>
                <div className={styles.errorContainer}>
                    <h3 className={styles.errorTitle}>Error loading listing</h3>
                    <p className={styles.errorText}>{error}</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.pageContainer}>
            <Link href="/listings" className={styles.backLink}>
                ← Back to Listings
            </Link>

            <ListingDetails listing={listing} />

            <ListingMessages listingId={listing.id} initialMessages={messages} />
        </main>
    );
}
