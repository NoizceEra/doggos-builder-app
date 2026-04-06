"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  IDL,
  PROGRAM_ID,
  CHOICES,
  type Choice,
  type GameAccount,
  type GameStatus,
  type Rps,
  type SavedCommit,
  randomSalt,
  loadCommit,
  clearCommit,
  fetchAllGames,
  txCreateGame,
  txJoinGame,
  txCommitChoice,
  txRevealChoice,
  txSettle,
  txCancelGame,
  txClaimTimeout,
  shortenPubkey,
  lamportsToSol,
  getStatusLabel,
  getStatusColor,
} from "./rps-client";
import styles from "./game.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RefreshCw, Plus, Clock, Swords } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const CHOICE_EMOJI: Record<number, string> = { 0: "🪨", 1: "📄", 2: "✂️" };
const CHOICE_NAME:  Record<number, string> = { 0: "Rock", 1: "Paper", 2: "Scissors" };

function useRpsProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    const provider = new AnchorProvider(connection, wallet as never, {
      commitment: "confirmed",
    });
    return new Program(IDL as any, provider);
  }, [connection, wallet]);
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function RpsPage() {
  const { publicKey } = useWallet();
  const program = useRpsProgram();

  const [games, setGames]               = useState<GameAccount[]>([]);
  const [loading, setLoading]           = useState(false);
  const [showCreate, setShowCreate]     = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameAccount | null>(null);

  const refresh = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    try {
      const all = await fetchAllGames(program);
      setGames(all);
    } catch (e) {
      console.error("Failed to fetch games:", e);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    if (program) refresh();
  }, [program, refresh]);

  // Re-select updated game after refresh
  useEffect(() => {
    if (selectedGame) {
      const updated = games.find((g) => g.publicKey.equals(selectedGame.publicKey));
      if (updated) setSelectedGame(updated);
    }
  }, [games]); // eslint-disable-line

  async function handleCreate(wagerSol: number) {
    if (!program || !publicKey) return;
    const gameId = new BN(Date.now());
    await txCreateGame(program, publicKey, gameId, new BN(Math.round(wagerSol * LAMPORTS_PER_SOL)));
    await refresh();
  }

  const myGames = games.filter(
    (g) => publicKey && (g.player1.equals(publicKey) || g.player2?.equals(publicKey))
  );
  const openGames = games.filter(
    (g) =>
      g.status === "waitingForPlayer" &&
      publicKey &&
      !g.player1.equals(publicKey)
  );

  return (
    <main className={styles.main}>
      <header className={styles.gameHeader}>
        <div className={styles.titleArea}>
          <h1>RPS Arena</h1>
          <p>Provably fair challenges on Solana</p>
        </div>
        <div className={styles.headerBtnGroup}>
          {publicKey && (
            <button className={styles.refreshBtn} onClick={refresh} disabled={loading}>
              <RefreshCw className={loading ? styles.spinning : ""} size={18} />
              Refresh
            </button>
          )}
          <WalletMultiButton />
        </div>
      </header>

      {!publicKey ? (
        <section className={styles.connectPrompt}>
          <div className={styles.promptIcon}>⚔️</div>
          <h2>Connect Your Wallet</h2>
          <p>Join the arena to challenge others and win SOL.</p>
          <WalletMultiButton />
        </section>
      ) : (
        <div className={styles.content}>
          <section className={styles.gameSection}>
            <div className={styles.sectionTitle}>
              <h2>My Battles</h2>
              <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
                <Plus size={18} /> Create New
              </button>
            </div>
            <div className={styles.gameGrid}>
              <AnimatePresence>
                {myGames.map((g) => (
                  <GameCard
                    key={g.publicKey.toBase58()}
                    game={g}
                    myKey={publicKey}
                    onClick={() => setSelectedGame(g)}
                  />
                ))}
              </AnimatePresence>
              {myGames.length === 0 && <p className={styles.empty}>No active games.</p>}
            </div>
          </section>

          <section className={styles.gameSection}>
            <div className={styles.sectionTitle}>
              <h2>Open Challenges</h2>
            </div>
            <div className={styles.gameGrid}>
               <AnimatePresence>
                {openGames.map((g) => (
                  <GameCard
                    key={g.publicKey.toBase58()}
                    game={g}
                    myKey={publicKey}
                    onClick={() => setSelectedGame(g)}
                  />
                ))}
              </AnimatePresence>
              {openGames.length === 0 && <p className={styles.empty}>No open challenges available.</p>}
            </div>
          </section>
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateGameModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
        {selectedGame && publicKey && (
          <GameModal
            game={selectedGame}
            myKey={publicKey}
            onClose={() => setSelectedGame(null)}
            onAction={refresh}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function CreateGameModal({ onClose, onCreate }: { onClose: () => void, onCreate: (wager: number) => Promise<void> }) {
  const [wager, setWager] = useState("0.1");
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await onCreate(parseFloat(wager));
      onClose();
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        <h3>Create New Match</h3>
        <p>Set your wager in SOL. Minimum is 0.001 SOL.</p>
        <div className={styles.inputGroup}>
          <input
            type="number"
            step="0.01"
            value={wager}
            onChange={e => setWager(e.target.value)}
            placeholder="0.1"
          />
          <span>SOL</span>
        </div>
        <div className={styles.modalBtns}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.createBtn} onClick={handle} disabled={loading}>
            {loading ? "Creating..." : "Confirm Create"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GameModal({ game, myKey, onClose, onAction }: { game: GameAccount, myKey: PublicKey, onClose: () => void, onAction: () => void }) {
  const program = useRpsProgram();
  const [busy, setBusy] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);

  const isP1 = game.player1.equals(myKey);
  const isP2 = game.player2?.equals(myKey) ?? false;
  const isMyGame = isP1 || isP2;
  const savedCommit: SavedCommit | null = loadCommit(game.publicKey);

  async function run(fn: () => Promise<any>) {
    setBusy(true);
    try {
      await fn();
      onAction();
    } catch (e) {
      alert(e);
    } finally {
      setBusy(false);
    }
  }

  const myCommitted = (isP1 && game.player1Commitment !== null) || (isP2 && game.player2Commitment !== null);
  const myRevealed = (isP1 && game.player1Choice !== null) || (isP2 && game.player2Choice !== null);
  const bothRevealed = game.player1Choice !== null && game.player2Choice !== null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Match #{game.gameId.toString().slice(-6)}</h3>
          <span className={styles.wagerBadge}>{lamportsToSol(game.wager)} SOL</span>
        </div>

        <div className={styles.gameInfo}>
          <div className={styles.statusRow}>
            <span>Status:</span>
            <strong style={{ color: getStatusColor(game.status) }}>{getStatusLabel(game.status)}</strong>
          </div>
          <div className={styles.playersList}>
            <div className={styles.playerItem}>
              <span>Host: {shortenPubkey(game.player1)}</span>
              {game.player1Commitment ? "✅ Committed" : "⏳ Waiting"}
            </div>
            <div className={styles.playerItem}>
              <span>Challenger: {game.player2 ? shortenPubkey(game.player2) : "None"}</span>
              {game.player2 ? (game.player2Commitment ? "✅ Committed" : "⏳ Waiting") : "-"}
            </div>
          </div>
        </div>

        <div className={styles.actionsBox}>
          {game.status === "waitingForPlayer" && !isP1 && (
            <button className={styles.actionBtn} onClick={() => run(() => txJoinGame(program!, myKey, game.publicKey))} disabled={busy}>
              Join Challenge
            </button>
          )}

          {game.status === "waitingForCommitments" && isMyGame && !myCommitted && (
            <div className={styles.choiceSelector}>
              <p>Choose your move:</p>
              <div className={styles.choiceGrid}>
                {([0, 1, 2] as Choice[]).map(c => (
                  <button key={c} className={`${styles.choiceBtn} ${selectedChoice === c ? styles.activeChoice : ""}`} onClick={() => setSelectedChoice(c)}>
                    <span className={styles.emoji}>{CHOICE_EMOJI[c]}</span>
                    <span>{CHOICES[c]}</span>
                  </button>
                ))}
              </div>
              <button className={styles.actionBtn} disabled={selectedChoice === null || busy} onClick={() => run(() => txCommitChoice(program!, myKey, game.publicKey, selectedChoice!, randomSalt()))}>
                Lock In Choice
              </button>
            </div>
          )}

          {game.status === "waitingForReveals" && isMyGame && !myRevealed && (
            <div className={styles.revealBox}>
              <p>Both players committed. Time to reveal!</p>
              {savedCommit ? (
                <div className={styles.savedInfo}>
                  You picked: <strong>{CHOICE_EMOJI[savedCommit.choice]} {CHOICES[savedCommit.choice]}</strong>
                </div>
              ) : (
                <p className={styles.errorText}>No saved commitment found in this browser.</p>
              )}
              <button className={styles.actionBtn} disabled={!savedCommit || busy} onClick={() => run(() => txRevealChoice(program!, myKey, game.publicKey, savedCommit!.choice, Uint8Array.from(savedCommit!.salt)))}>
                Reveal My Choice
              </button>
            </div>
          )}

          {game.status === "waitingForReveals" && bothRevealed && (
            <button className={styles.settleBtn} onClick={() => run(() => txSettle(program!, game.publicKey, game.player1, game.player2!))} disabled={busy}>
              Settle & Pay Winner
            </button>
          )}

          {game.winner && (
            <div className={styles.winnerBox}>
              <Trophy size={48} color="#f59e0b" />
              <h3>Winner!</h3>
              <p>{shortenPubkey(game.winner)} takes the pot.</p>
            </div>
          )}
        </div>

        <button className={styles.closeModalBtn} onClick={onClose}>Close</button>
      </motion.div>
    </motion.div>
  );
}

function GameCard({ game, myKey, onClick }: { game: GameAccount, myKey: PublicKey, onClick: () => void }) {
  const isP1 = game.player1.equals(myKey);
  const statusLabel = getStatusLabel(game.status);
  const statusColor = getStatusColor(game.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={styles.card}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <span className={styles.gameId}>#{game.gameId.toString().slice(-6)}</span>
        <span className={styles.wager}>⚡ {lamportsToSol(game.wager)} SOL</span>
      </div>
      <div className={styles.cardStatus} style={{ color: statusColor }}>
        <div className={styles.dot} style={{ background: statusColor }} />
        {statusLabel}
      </div>
      <div className={styles.cardPlayers}>
        <span>{shortenPubkey(game.player1)} {isP1 && "(You)"}</span>
        <Swords size={14} className={styles.swords} />
        <span>{game.player2 ? shortenPubkey(game.player2) : "Open"}</span>
      </div>
    </motion.div>
  );
}
