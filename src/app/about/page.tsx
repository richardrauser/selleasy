import styles from './page.module.css';
import packageJson from '../../../package.json';

export default function AboutPage() {
    const version = packageJson.version;
    const buildNumber = "20260110.1"; // Hardcoded build timestamp for now

    return (
        <main className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.title}>SellEasy</h1>
                <p className={styles.description}>The easiest way to sell your stuff.</p>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Version</span>
                        <span className={styles.value}>v{version}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Build</span>
                        <span className={styles.value}>{buildNumber}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Env</span>
                        <span className={styles.value}>{process.env.NODE_ENV}</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
