"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Palette } from "lucide-react";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <main className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.heroContent}
        >
          <h1 className={styles.heroTitle}>
            420 Pups 🐕 <br />
            <span>$PUP on Solana</span>
          </h1>
          <p className={styles.heroSubtitle}>
            In the crypto trenches. Building, collecting, gambling, and achieving together. Mint your Pupsamigo, stake your skills, and win in the on-chain arena.
          </p>
          <div className={styles.heroActions}>
            <a 
              href="https://launchmynft.io/collections/HZgWGB556RnLhRjrN92B3gxHy2XStbsWyhYRBtxw5Log/ZXUU4SgyedOmsWWlXSGz"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryBtn}
            >
              ✨ Mint Now <ArrowRight size={20} />
            </a>
            <Link href="/builder" className={styles.secondaryBtn}>
              Build Your Pup <ArrowRight size={20} />
            </Link>
            <a 
              href="https://x.com/Pupsamigos" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.twitterBtn}
            >
              Follow @Pupsamigos
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className={styles.heroImage}
        >
          {/* Abstract background for the doggo image */}
          <div className={styles.imageGlow} />
          <img src="/traits/Skin/Blue.png" alt="Featured Doggo" className={styles.featuredImg} />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Palette size={32} /></div>
          <h3>Mint Your Pup</h3>
          <p>Customize and mint your unique Pupsamigo NFT for 0.1 SOL. Over 1,000 combinations to choose from.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Zap size={32} /></div>
          <h3>Gamble & Win</h3>
          <p>Provably fair Rock-Paper-Scissors on Solana. Stake SOL, battle other pups, and achieve greatness.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Target size={32} /></div>
          <h3>$PUP Token</h3>
          <p>420 pups building in the crypto trenches. Collect, hold, and be part of the pack.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2026 PUPSAMIGOS. 420 Pups on Solana. Building in the crypto trenches.</p>
        <div style={{ marginTop: "1rem" }}>
          <a 
            href="https://x.com/Pupsamigos" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "bold" }}
          >
            Follow @Pupsamigos on X
          </a>
        </div>
      </footer>
    </main>
  );
}