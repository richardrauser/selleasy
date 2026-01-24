'use client';

import dynamic from 'next/dynamic';
import styles from './page.module.css';

const ListingPhotoPicker = dynamic(() => import('@/components/ListingPhotoPicker'), {
    ssr: false,
    loading: () => <div className={styles.loadingPlaceholder}>Loading camera...</div>
});

export default function NewListingPage() {
    return (
        <main className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Create New Listing</h1>
                    <div className={styles.subtitle}>
                        Snap a photo to automatically:
                        <ol className={styles.featuresList}>
                            <li>describe your item</li>
                            <li>assess its quality</li>
                            <li>suggest a price</li>
                        </ol>
                    </div>
                </header>

                <ListingPhotoPicker />

            </div>
        </main>
    );
}
