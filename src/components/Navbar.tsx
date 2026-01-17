'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logo}>
                SellEasy
            </Link>
            <ul className={styles.navLinks}>
                <li>
                    <Link
                        href="/"
                        className={isActive('/') ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <Link
                        href="/listings"
                        className={isActive('/listings') ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                    >
                        Listings
                    </Link>
                </li>
                <li>
                    <Link
                        href="/listings/new"
                        className={isActive('/listings/new') ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                    >
                        New Listing
                    </Link>
                </li>
                <li>
                    <Link
                        href="/about"
                        className={isActive('/about') ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                    >
                        About
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
