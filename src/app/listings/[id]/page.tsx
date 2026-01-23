import { getListing } from "@/app/actions/get-listing";
import Link from "next/link";
import styles from "./page.module.css";
import { notFound } from "next/navigation";

export default async function ListingDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Await params as required in Next.js 15+
    const { id } = await params;

    const { success, data: listing, error } = await getListing(id);

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

            <article className={styles.detailsCard}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{listing.title}</h1>
                    <div className={styles.meta}>
                        <span className={styles.qualityBadge}>{listing.quality}</span>
                        <span className={`${styles.statusBadge} ${styles[`status-${listing.status}`]}`}>
                            {listing.status}
                        </span>
                    </div>
                </header>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Description</h3>
                    <p className={styles.description}>{listing.description}</p>
                </div>

                <div className={styles.priceGrid}>
                    <div className={styles.priceItem}>
                        <span className={styles.priceLabel}>Suggested Price</span>
                        <span className={`${styles.priceValue} ${styles.suggested}`}>
                            ${listing.suggestedPrice}
                        </span>
                    </div>

                    <div className={styles.priceItem}>
                        <span className={styles.priceLabel}>Your Price</span>
                        <span className={styles.priceValue}>${listing.chosenPrice}</span>
                    </div>
                </div>
            </article>
        </main>
    );
}
