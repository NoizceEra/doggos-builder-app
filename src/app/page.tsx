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
            The Ultimate 🐕 <br />
            <span>Doggo Universe</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Build your unique digital companion, play provably fair games on Solana, and join the most vibrant community in the dog-o-sphere.
          </p>
          <div className={styles.heroActions}>
            <Link href="/builder" className={styles.primaryBtn}>
              Start Building <ArrowRight size={20} />
            </Link>
            <Link href="/game" className={styles.secondaryBtn}>
              Play RPS Game
            </Link>
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
          <h3>Dynamic NFT Builder</h3>
          <p>Over 1,000 combinations of backgrounds, skins, and accessories to make your Doggo truly yours.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Zap size={32} /></div>
          <h3>On-Chain Gaming</h3>
          <p>Provably fair Rock-Paper-Scissors built on Solana. Stake your skills and win rewards.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Target size={32} /></div>
          <h3>Community First</h3>
          <p>Join a decentralized autonomous pack that rewards long-term holders and creators.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2026 DOGGOS.BUILDER. All rights reserved.</p>
      </footer>
    </main>
  );
}
