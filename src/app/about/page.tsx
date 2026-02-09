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
                        <li>📸 AI-powered item recognition from photos</li>
                        <li>💰 Smart price suggestions based on market data</li>
                        <li>✨ Automatic description generation</li>
                        <li>💬 Integrated messaging system with AI assistant</li>
                        <li>🛍️ Easy listing management and deletion</li>
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
