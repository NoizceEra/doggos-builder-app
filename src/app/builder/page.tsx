"use client";

import traitsData from "../../traits.json";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styles from "./page.module.css";

const MINT_PRICE_SOL = 0.1;

const CATEGORIES = ["Background", "Skin", "Clothes", "Face", "Hats"] as const;
type Category = (typeof CATEGORIES)[number];

type Trait = {
  Category: Category;
  Name: string;
  FileName: string;
};

type SelectedTraits = {
  [K in Category]?: Trait;
};

function groupTraitsByCategory(traits: Trait[]): Record<Category, Trait[]> {
  const grouped: Record<Category, Trait[]> = {
    Background: [],
    Skin: [],
    Clothes: [],
    Face: [],
    Hats: [],
  };
  for (const t of traits) {
    if (grouped[t.Category]) grouped[t.Category].push(t);
  }
  return grouped;
}

function DoggoPreview({ selected }: { selected: SelectedTraits }) {
  const layers: Category[] = ["Background", "Skin", "Clothes", "Face", "Hats"];

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.previewInner}>
        {layers.map((category) => {
          const trait = selected[category];
          if (!trait || trait.Name === "None") return null;
          const src = `/traits/${trait.Category}/${encodeURIComponent(
            trait.FileName
          )}`;
          return (
            <Image
              key={`${category}-${trait.Name}`}
              src={src}
              alt={`${category} ${trait.Name}`}
              width={500}
              height={500}
              className={styles.layer}
              priority={true}
            />
          );
        })}
      </div>
    </div>
  );
}

function TraitCard({ 
  trait, 
  isActive, 
  onClick 
}: { 
  trait: Trait; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const imagePath = `/traits/${trait.Category}/${encodeURIComponent(trait.FileName)}`;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.traitCard} ${isActive ? styles.traitCardActive : ""}`}
      title={trait.Name}
    >
      <div className={styles.traitImageWrapper}>
        <Image
          src={imagePath}
          alt={trait.Name}
          width={100}
          height={100}
          className={styles.traitImage}
        />
      </div>
      <span className={styles.traitName}>{trait.Name}</span>
      {isActive && <div className={styles.activeIndicator} />}
    </button>
  );
}

export default function BuilderPage() {
  const { publicKey } = useWallet();
  const traits = traitsData as Trait[];
  const traitsByCategory = useMemo(
    () => groupTraitsByCategory(traits),
    [traits]
  );

  const [selected, setSelected] = useState<SelectedTraits>(() => {
    const initial: SelectedTraits = {};
    for (const cat of CATEGORIES) {
      const list = traitsByCategory[cat] || [];
      const first = list.find((t) => t.Name !== "None") ?? list[0];
      if (first) initial[cat] = first;
    }
    return initial;
  });

  const [doggoName, setDoggoName] = useState("Cool Doggo #1");
  const [isMinting, setIsMinting] = useState(false);

  const handleSelect = (category: Category, trait: Trait) => {
    setSelected((prev) => ({ ...prev, [category]: trait }));
  };

  const handleRandom = () => {
    setSelected(() => {
      const next: SelectedTraits = {};
      for (const cat of CATEGORIES) {
        const list = traitsByCategory[cat] || [];
        if (!list.length) continue;
        const nonNone = list.filter((t) => t.Name !== "None");
        const pool = nonNone.length ? nonNone : list;
        const choice = pool[Math.floor(Math.random() * pool.length)];
        next[cat] = choice;
      }
      return next;
    });
  };

  const handleDownload = () => {
    const attributes = CATEGORIES.map(cat => ({
      trait_type: cat,
      value: selected[cat]?.Name || "None"
    }));

    const metadata = {
      name: doggoName,
      image: "ipfs://...",
      attributes: attributes
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doggoName.replace(/\s+/g, "-").toLowerCase()}-metadata.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMint = async () => {
    if (!publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    setIsMinting(true);
    try {
      // TODO: Implement NFT mint functionality
      // 1. Upload metadata to IPFS
      // 2. Create and send mint transaction
      // 3. Handle success/error states
      const attributes = CATEGORIES.map(cat => ({
        trait_type: cat,
        value: selected[cat]?.Name || "None"
      }));

      const metadata = {
        name: doggoName,
        symbol: "PUP",
        description: "A Pupsamigo from the 420 pups collection on Solana",
        image: "ipfs://...",
        attributes: attributes,
        properties: {
          category: "image",
          files: []
        }
      };

      console.log("Mint metadata:", metadata);
      alert(`Minting ${doggoName} for ${MINT_PRICE_SOL} SOL - Coming Soon!`);
    } catch (error) {
      console.error("Mint failed:", error);
      alert("Mint failed. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left: Preview Section */}
      <section className={styles.previewSection}>
        <div className={styles.nameInputWrapper}>
          <label className={styles.nameLabel} htmlFor="doggo-name">Inscribe Name</label>
          <input
            id="doggo-name"
            type="text"
            value={doggoName}
            onChange={(e) => setDoggoName(e.target.value)}
            className={styles.nameInput}
            placeholder="Enter name..."
          />
        </div>

        <div className={styles.previewBox}>
          <DoggoPreview selected={selected} />
        </div>
        
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleRandom}
            className={styles.primaryButton}
          >
            🎲 Randomize
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className={styles.secondaryButton}
          >
            ⬇️ Get Metadata
          </button>
          <button
            type="button"
            onClick={handleMint}
            disabled={isMinting || !publicKey}
            className={styles.primaryButton}
            style={{ opacity: isMinting || !publicKey ? 0.6 : 1 }}
          >
            {isMinting ? "⏳ Minting..." : `✨ Mint ${MINT_PRICE_SOL} SOL`}
          </button>
          <WalletMultiButton />
        </div>
      </section>

      {/* Right: Trait Selection */}
      <section className={styles.selectionSection}>
        <div className={styles.traitsContainer}>
          {CATEGORIES.map((category) => {
            const list = traitsByCategory[category] || [];
            const selected_trait = selected[category];
            
            return (
              <div
                key={category}
                className={styles.categorySection}
              >
                <div className={styles.categoryLabel}>
                  <h2>{category}</h2>
                  {selected_trait && (
                    <span className={styles.selectedBadge}>
                      {selected_trait.Name}
                    </span>
                  )}
                </div>
                
                <div className={styles.traitGrid}>
                  {list.map((trait) => {
                    const isActive = selected[category]?.Name === trait.Name;
                    return (
                      <TraitCard
                        key={trait.Name}
                        trait={trait}
                        isActive={isActive}
                        onClick={() => handleSelect(category, trait)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
