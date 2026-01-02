import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.logo}>
          <Image
            src="/logo.png"
            alt="SellEasy Logo"
            width={180}
            height={180}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Get your old shit sold, <span style={{ color: "var(--secondary)" }}>TODAY!</span>
        </h1>
        <p className={styles.description}>
          The easiest way to declutter your life and make money.
        </p>
        <Link href="/listings/new">
          <button className={styles.ctaButton}>
            Get Started
          </button>
        </Link>
      </main>
    </div>
  );
}
