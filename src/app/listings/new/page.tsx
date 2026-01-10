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
                    <p className={styles.subtitle}>Snap a photo to automatically describe your item.</p>
                </header>

                <ListingPhotoPicker />

            </div>
        </main>
    );
}
