/**
 * EcoGameHUD - React overlay component for the game canvas
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EcoSeaRescueHUD } from "./SeaRescue/EcoSeaRescueHUD";
import { RunnerHUD } from "./UI/EcoRunner/RunnerHUD";
import { SorterHUD } from "./UI/EcoSorter/SorterHUD";
import { ResultScreen } from "./UI/ResultScreen/ResultScreen";

// ─── Game Over Overlay ────────────────────────────────────────────────────────

function GameOverOverlay({ show }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-5"
    >
      <motion.div
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-5xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        💥 Va chạm!
      </motion.div>
    </motion.div>
  );
}

// ─── Stage Transition Overlay ─────────────────────────────────────────────────

function StageTransition({ stage }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none z-5"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        className="text-center text-white"
      >
        <div className="text-6xl mb-4">{stage === "STAGE_2" ? "♻️" : "🎮"}</div>
        <div className="text-3xl font-bold mb-2">
          {stage === "STAGE_2" ? "Màn 2: Phân loại rác" : "Bắt đầu!"}
        </div>
        <div className="text-lg opacity-70">
          {stage === "STAGE_2"
            ? "Kéo thả rác vào đúng thùng phân loại"
            : "Thu gom rác và né vật cản!"}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main HUD Component ───────────────────────────────────────────────────────

export default function EcoGameHUD({ game, onBack, levelConfig }) {
  const [stage, setStage] = useState("STAGE_1");
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(levelConfig?.runner?.baseSpeed || 12);
  const [trashCount, setTrashCount] = useState(0);
  const [sortScore, setSortScore] = useState({ correct: 0, wrong: 0 });
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [result, setResult] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const isSeaRescue = levelConfig?.stage1Game === "searescue";

  useEffect(() => {
    if (!game) return;

    // Runner HUD data (only meaningful when stage1Game === 'runner')
    game.onDistanceUpdate((d, s) => {
      setDistance(d);
      setSpeed(s);
    });

    game.onTrashCollected((count) => {
      setTrashCount(count);
    });

    // Stage 2 data
    game.onSortingUpdate((score, remaining) => {
      setSortScore({ ...score });
      setItemsRemaining(remaining);
    });

    game.onTimerUpdate((time) => {
      setTimeRemaining(time);
    });

    // Stage transitions
    game.onStageChange((newStage) => {
      if (newStage === "STAGE_2") {
        const tl = levelConfig?.sorter?.timeLimit || 0;
        setTimeRemaining(tl > 0 ? tl : null);

        setShowGameOver(true);
        setTimeout(() => {
          setShowGameOver(false);
          setShowTransition(true);
          setTimeout(() => {
            setShowTransition(false);
            setStage("STAGE_2");
          }, 2000);
        }, 1200);
      } else if (newStage === "RESULT") {
        setStage("RESULT");
      }
    });

    game.onResult((res) => {
      setResult(res);
    });
  }, [game, levelConfig]);

  const handleReplay = useCallback(() => {
    setStage("STAGE_1");
    setDistance(0);
    setSpeed(levelConfig?.runner?.baseSpeed || 12);
    setTrashCount(0);
    setSortScore({ correct: 0, wrong: 0 });
    setItemsRemaining(0);
    setTimeRemaining(null);
    setResult(null);
    setShowTransition(false);
    setShowGameOver(false);
    game?.restart();
  }, [game, levelConfig]);

  return (
    <>
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/60 transition-colors"
        title="Quay về"
      >
        ✕
      </button>

      <AnimatePresence mode="wait">
        {/* ── Stage 1 HUD ── */}
        {stage === "STAGE_1" &&
          !showGameOver &&
          !showTransition &&
          (isSeaRescue ? (
            // EcoSeaRescueHUD wires itself directly into game.runner
            // — it does NOT run its own loop, only shows reactive UI
            <EcoSeaRescueHUD
              key="searescue"
              game={game}
              levelConfig={levelConfig}
              onComplete={() => game?.triggerStage2()}
            />
          ) : (
            <RunnerHUD
              key="runner"
              distance={distance}
              speed={speed}
              trashCount={trashCount}
            />
          ))}

        {/* ── Stage 2 HUD ── */}
        {stage === "STAGE_2" && !result && (
          <SorterHUD
            key="sorter"
            itemsRemaining={itemsRemaining}
            correct={sortScore.correct}
            wrong={sortScore.wrong}
            timeRemaining={timeRemaining}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGameOver && <GameOverOverlay key="gameover" show />}
        {showTransition && <StageTransition key="transition" stage="STAGE_2" />}
      </AnimatePresence>

      {stage === "RESULT" && result && (
        <ResultScreen result={result} onReplay={handleReplay} onBack={onBack} />
      )}
    </>
  );
}
