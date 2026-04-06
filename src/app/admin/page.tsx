"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";
import { RefreshCw, Trash2, Plus, Home, Settings, Database } from "lucide-react";
import Link from "next/link";

type Trait = {
  Category: string;
  Name: string;
  FileName: string;
};

export default function AdminDashboard() {
  const [traits, setTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  async function fetchTraits() {
    setLoading(true);
    try {
      const res = await fetch("/api/traits"); // GET will also sync on current implementation
      const data = await res.json();
      if (data.success) {
        setTraits(data.traits);
        setSyncMsg(`Successfully synced ${data.count} traits from filesystem.`);
      }
    } catch (e) {
      console.error(e);
      setSyncMsg("Failed to sync traits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTraits();
  }, []);

  async function handleRemove(trait: Trait) {
    if (!confirm(`Remove ${trait.Name} from metadata? (File will NOT be deleted from disk)`)) return;
    const newTraits = traits.filter(t => t !== trait);
    try {
      const res = await fetch("/api/traits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traits: newTraits }),
      });
      if (res.ok) {
        setTraits(newTraits);
        setSyncMsg(`Removed ${trait.Name} from metadata.`);
      }
    } catch (e) {
      alert("Failed to save changes.");
    }
  }

  const categories = Array.from(new Set(traits.map(t => t.Category)));

  return (
    <main className={styles.main}>
      <header className={styles.adminHeader}>
        <div className={styles.titleArea}>
          <h1><Settings size={32} /> Admin Dashboard</h1>
          <p>Manage your Doggos collection traits and sync with the filesystem.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.syncBtn} onClick={fetchTraits} disabled={loading}>
            <RefreshCw className={loading ? styles.spinning : ""} size={18} />
            Scan Trait Folders
          </button>
          <Link href="/builder" className={styles.backBtn}>
            <Home size={18} /> Back to Builder
          </Link>
        </div>
      </header>

      {syncMsg && (
        <div className={styles.msgBox}>
          <Database size={18} /> {syncMsg}
        </div>
      )}

      <div className={styles.traitsGrid}>
        {categories.map(cat => (
          <section key={cat} className={styles.catSection}>
            <h2 className={styles.catTitle}>{cat} ({traits.filter(t => t.Category === cat).length})</h2>
            <div className={styles.traitsList}>
              {traits.filter(t => t.Category === cat).map(t => (
                <div key={`${t.Category}-${t.FileName}`} className={styles.traitRow}>
                  <img src={`/traits/${t.Category}/${t.FileName}`} alt="" className={styles.traitThumb} />
                  <div className={styles.traitInfo}>
                    <span className={styles.traitName}>{t.Name}</span>
                    <span className={styles.traitFile}>{t.FileName}</span>
                  </div>
                  <button className={styles.removeBtn} onClick={() => handleRemove(t)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
