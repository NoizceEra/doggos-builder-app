"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";
import { Home, Wrench, Gamepad2 } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/", icon: <Home size={18} /> },
    { name: "Builder", href: "/builder", icon: <Wrench size={18} /> },
    { name: "The Pit", href: "/game", icon: <Gamepad2 size={18} />, comingSoon: true },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        🐕 PUPSAMIGOS
      </div>
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
            >
              {tab.icon}
              <span>{tab.name}</span>
              {tab.comingSoon && <span style={{ fontSize: "11px", marginLeft: "4px", opacity: 0.6 }}>Coming Soon</span>}
            </Link>
          );
        })}
      </div>
      <div className={styles.actions}>
        {/* Wallet button will be injected here if needed, or in the specific pages */}
      </div>
    </nav>
  );
}
