import { getListings } from '@/app/actions/get-listings';
import Link from 'next/link';
import styles from './page.module.css';

// This is a Server Component
export default async function ListingsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Await searchParams as required in Next.js 15+ (although strictness varies, good practice now)
    const params = await searchParams;
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;

    const { success, data: listings, pagination, error } = await getListings(page);

    if (!success) {
        return (
            <main className={styles.pageContainer}>
                <div className={styles.emptyState}>
                    <h3>Error loading listings</h3>
                    <p>{error}</p>
                </div>
            </main>
        );
    }

    const { totalPages } = pagination || { totalPages: 1 };
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    return (
        <main className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Your Listings</h1>
            </header>

            {listings && listings.length > 0 ? (
                <>
                    <div className={styles.grid}>
                        {listings.map((listing) => (
                            <div key={listing.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.itemTitle}>{listing.title}</h3>
                                    <span className={styles.qualityBadge}>{listing.quality}</span>
                                </div>
                                <p className={styles.description}>{listing.description}</p>
                                <div className={styles.priceSection}>
                                    <span className={styles.priceLabel}>Your Price</span>
                                    <span className={styles.priceValue}>${listing.chosenPrice}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.pagination}>
                        {hasPrev ? (
                            <Link href={`/listings?page=${page - 1}`} className={styles.pageBtn}>
                                Previous
                            </Link>
                        ) : (
                            <span className={`${styles.pageBtn} ${styles.disabled}`}>Previous</span>
                        )}

                        <span className={styles.pageInfo}>
                            Page {page} of {totalPages}
                        </span>

                        {hasNext ? (
                            <Link href={`/listings?page=${page + 1}`} className={styles.pageBtn}>
                                Next
                            </Link>
                        ) : (
                            <span className={`${styles.pageBtn} ${styles.disabled}`}>Next</span>
                        )}
                    </div>
                </>
            ) : (
                <div className={styles.emptyState}>
                    <h3>No listings yet</h3>
                    <p>Start selling your items today!</p>
                    <Link href="/listings/new" className={styles.createLink}>
                        Create New Listing
                    </Link>
                </div>
            )}
        </main>
    );
}
