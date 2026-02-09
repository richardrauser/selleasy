import { getListing } from "@/app/actions/get-listing";
import Link from "next/link";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import BuyPageClient from "@/components/BuyPageClient";

export default async function BuyPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await params;
    const queryParams = await searchParams;
    const negotiatedPrice = typeof queryParams.price === 'string' ? queryParams.price : undefined;

    const { success, data: listing, error } = await getListing(id);

    if (!success || !listing) {
        if (error === "Listing not found") {
            notFound();
        }
        return (
            <main className={styles.container}>
                <Link href={`/listings/${id}`} className={styles.backLink}>
                    ← Back to Listing
                </Link>
                <div className={styles.header}>
                    <h3 className={styles.title}>Error loading listing</h3>
                    <p style={{ color: 'red' }}>{error}</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <Link href={`/listings/${id}`} className={styles.backLink}>
                ← Back to Listing
            </Link>

            <BuyPageClient listing={listing} negotiatedPrice={negotiatedPrice} />
        </main>
    );
}
