import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.logo}>
          <Image
            src="/SellEasyLogo.png"
            alt="SellEasy Logo"
            width={300}
            height={236}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Let <span style={{ color: "var(--secondary)" }}>Google's Gemini AI</span> Sell Your Stuff!
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
