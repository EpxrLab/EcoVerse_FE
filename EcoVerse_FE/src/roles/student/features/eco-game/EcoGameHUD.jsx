/**
 * EcoGameHUD - React overlay component for the game canvas
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EcoSeaRescueHUD } from "./SeaRescue/EcoSeaRescueHUD";
import { RunnerHUD } from "./RunnerTrash/RunnerHUD";
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
      style={{ zIndex: 999990 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
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

// ─── Exit Confirm Overlay ─────────────────────────────────────────────────────

function ExitConfirmOverlay({ show, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 1000000 }}
      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center"
      >
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Bạn có chắc chắn muốn thoát?
        </h3>
        <p className="text-gray-600 mb-8">
          Nếu bạn thoát game giữa chừng, toàn bộ dữ liệu của phiên chơi này sẽ bị mất.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Tiếp tục chơi
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
          >
            Thoát game
          </button>
        </div>
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
      style={{ zIndex: 999990 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none"
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

export default function EcoGameHUD({
  game,
  onBack,
  levelConfig,
  gameType,
  onGameResult,
  onPauseChange,
}) {
  console.log("[EcoGameHUD] Rendering. gameType:", gameType, "isSeaRescue:", levelConfig?.stage1Game === "searescue");
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const fetchData = async () => {};

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (onPauseChange) {
      onPauseChange(showExitConfirm);
    }
    if (game && typeof game.pause === "function" && typeof game.resume === "function") {
      if (showExitConfirm) {
        game.pause();
      } else {
        game.resume();
      }
    }
  }, [showExitConfirm, onPauseChange, game]);

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

    game.onResult(async (res) => {
      let finalResult = res;
      // Submit game result to API
      if (onGameResult) {
        const apiResult = await onGameResult(res);
        if (apiResult) {
          finalResult = { ...res, apiResult }; // Merge the API result
        }
      }
      setResult(finalResult);
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
        onClick={() => setShowExitConfirm(true)}
        className="absolute top-4 right-4 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/60 transition-colors"
        style={{ zIndex: 999999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        title="Quay về"
      >
        ✕
      </button>

      {/* ── Stage 1 HUD ── */}
      {stage === "STAGE_1" &&
        !showGameOver &&
        !showTransition &&
        (isSeaRescue ? (
          <div key="searescue" style={{ position: "absolute", inset: 0, zIndex: 1000, pointerEvents: "none" }}>
            <EcoSeaRescueHUD
              game={game}
              levelConfig={levelConfig}
              onComplete={() => game?.triggerStage2()}
            />
          </div>
        ) : (
          <div key="runner" style={{ position: "absolute", inset: 0, zIndex: 1000, pointerEvents: "none" }}>
            <RunnerHUD
              distance={distance}
              speed={speed}
              trashCount={trashCount}
              totalTrash={levelConfig?.runner?.itemCount || 0}
            />
          </div>
        ))}

      <AnimatePresence>
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
        <ExitConfirmOverlay
          key="exitconfirm"
          show={showExitConfirm}
          onConfirm={() => {
            setShowExitConfirm(false);
            onBack();
          }}
          onCancel={() => setShowExitConfirm(false)}
        />
      </AnimatePresence>

      {stage === "RESULT" && result && (
        <ResultScreen result={result} onReplay={handleReplay} onBack={onBack} />
      )}
    </>
  );
}
