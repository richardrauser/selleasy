import styles from './page.module.css';
import packageJson from '../../../package.json';

export default function AboutPage() {
    const version = packageJson.version;
    const buildNumber = "20260110.1"; // Hardcoded build timestamp for now

    return (
        <main className={styles.pageContainer}>
            <h1 className={styles.title}>About</h1>
            <div className={styles.contentWrapper}>
                <p className={styles.description}>The easiest way to sell your stuff. Let Gemini AI do the heavy lifting! </p>



                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Features</h2>
                    <ul className={styles.featureList}>
                        <li>📸 Gemini powered item recognition</li>
                        <li>💰 Clever price suggestions from Gemini</li>
                        <li>✨ Gemini generated product descriptions</li>
                        <li>💰 Gemini negotiated sales process</li>
                        <li>💬 Messaging system</li>
                        <li>🛍️ Easy listing management</li>
                        <li>🛒 One-click eBay publishing integration</li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Tech Stack</h2>
                    <div className={styles.techTags}>
                        <span className={styles.techTag}>Next.js 15</span>
                        <span className={styles.techTag}>React 19</span>
                        <span className={styles.techTag}>TypeScript</span>
                        <span className={styles.techTag}>Firebase</span>
                        <span className={styles.techTag}>Gemini AI</span>
                        <span className={styles.techTag}>Google Cloud</span>
                        <span className={styles.techTag}>Stripe</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Created By</h2>
                    <p className={styles.creatorText}>
                        Made by <a href="https://x.com/RichardRauser" target="_blank" rel="noopener noreferrer" className={styles.creatorLink}>Richard Rauser</a> in 2026
                    </p>
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Version</span>
                        <span className={styles.value}>v{version}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Build</span>
                        <span className={styles.value}>{buildNumber}</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
