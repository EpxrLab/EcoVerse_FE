/**
 * EcoGrabberHUD - React overlay for the Crane Grabber game
 *
 * Displays: Timer, Trash collected, Score, Water clarity,
 * and context-sensitive instructions.
 */
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Instruction Banner ───────────────────────────────────────────────────────

function InstructionBanner({ text }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 1100 }}
      >
        <div
          className="px-6 py-3 rounded-2xl text-white font-bold text-lg text-center shadow-lg"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            minWidth: 220,
          }}
        >
          {text}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Water Clarity Bar ────────────────────────────────────────────────────────

function ClarityBar({ percentage }) {
  const barColor =
    percentage > 70
      ? "#40c4ff"
      : percentage > 40
      ? "#66bb6a"
      : "#8d6e63";

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs"
      style={{
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
      }}
    >
      <span className="opacity-80">🌊</span>
      <div className="w-20 h-2 rounded-full bg-white/20 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="tabular-nums font-semibold">{percentage}%</span>
    </div>
  );
}

// ─── Main HUD Component ──────────────────────────────────────────────────────

export function EcoGrabberHUD({ game, levelConfig }) {
  const [timeLeft, setTimeLeft] = useState(
    levelConfig?.grabber?.gameTime ?? 90,
  );
  const [trashCount, setTrashCount] = useState(0);
  const [totalTrash] = useState(levelConfig?.grabber?.totalTrash ?? 10);
  const [clarity, setClarity] = useState(0);
  const [score, setScore] = useState(0);
  const [instruction, setInstruction] = useState("Click để dừng cần cẩu! 🎯");

  useEffect(() => {
    if (!game?.stage1Game) return;
    const grabber = game.stage1Game;

    grabber.onTimerUpdate((time) => setTimeLeft(time));

    grabber.onTrashCollected(() => setTrashCount((prev) => prev + 1));

    grabber.onDistanceUpdate((clarityPct, currentScore) => {
      setClarity(clarityPct);
      setScore(currentScore);
    });

    grabber.onInstructionUpdate((text) => setInstruction(text));
  }, [game]);

  const isLowTime = timeLeft <= 15;
  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 p-4 pointer-events-none"
        style={{ zIndex: 1050 }}
      >
        <div className="flex justify-between items-start max-w-3xl mx-auto gap-3">
          {/* Timer */}
          <div
            className={`px-4 py-2 rounded-2xl text-white ${
              isLowTime ? "animate-pulse" : ""
            }`}
            style={{
              background: isLowTime
                ? "rgba(244,67,54,0.7)"
                : "rgba(0,0,0,0.4)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="text-xs opacity-70 uppercase tracking-wider">
              ⏱️ Thời gian
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Trash collected */}
          <div
            className="px-4 py-2 rounded-2xl text-white"
            style={{
              background: "rgba(76,175,80,0.7)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="text-xs opacity-90 uppercase tracking-wider">
              🗑️ Rác thu gom
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {trashCount}
              <span className="text-sm opacity-70 font-normal">
                {" "}/ {totalTrash}
              </span>
            </div>
          </div>

          {/* Score */}
          <div
            className="px-4 py-2 rounded-2xl text-white"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="text-xs opacity-70 uppercase tracking-wider">
              ⭐ Điểm
            </div>
            <div className="text-2xl font-bold tabular-nums">{score}</div>
          </div>
        </div>

        {/* Clarity bar (below main stats) */}
        <div className="flex justify-center mt-3">
          <ClarityBar percentage={clarity} />
        </div>
      </motion.div>

      {/* Bottom instruction */}
      <InstructionBanner text={instruction} />
    </>
  );
}
