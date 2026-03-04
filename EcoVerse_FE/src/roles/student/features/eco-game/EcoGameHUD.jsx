/**
 * EcoGameHUD - React overlay component for the game canvas
 *
 * Displays stage-specific information:
 * - Stage 1: distance, speed, trash count
 * - Stage 2: items remaining, correct/wrong score
 * - Result: final score with breakdown
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Stage 1 HUD ──────────────────────────────────────────────────────────────

function RunnerHUD({ distance, speed, trashCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-0 left-0 right-0 p-4 pointer-events-none"
    >
      <div className="flex justify-between items-start max-w-2xl mx-auto">
        {/* Distance */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-70 uppercase tracking-wider">Quãng đường</div>
          <div className="text-2xl font-bold tabular-nums">{Math.floor(distance)}m</div>
        </div>

        {/* Trash collected */}
        <div className="bg-green-500/80 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-90 uppercase tracking-wider">🗑️ Rác thu gom</div>
          <div className="text-2xl font-bold tabular-nums">{trashCount}</div>
        </div>

        {/* Speed */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-70 uppercase tracking-wider">Tốc độ</div>
          <div className="text-lg font-bold tabular-nums">{speed.toFixed(1)}</div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="mt-4 text-center">
        <div className="inline-block bg-black/30 backdrop-blur-md rounded-xl px-4 py-2 text-white/70 text-xs">
          ← → Chuyển làn &nbsp;|&nbsp; ↑ Nhảy &nbsp;|&nbsp; Vuốt trái/phải/lên (mobile)
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stage 2 HUD ──────────────────────────────────────────────────────────────

function SorterHUD({ itemsRemaining, correct, wrong, timeRemaining }) {
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const hasTimer = timeRemaining !== null && timeRemaining !== undefined;
  const isLowTime = hasTimer && timeRemaining < 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-0 left-0 right-0 p-4 pointer-events-none"
    >
      <div className="flex justify-between items-start max-w-2xl mx-auto">
        {/* Items remaining */}
        <div className="bg-blue-500/80 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-90 uppercase tracking-wider">Còn lại</div>
          <div className="text-2xl font-bold tabular-nums">{itemsRemaining}</div>
        </div>

        {/* Score */}
        <div className="bg-green-500/80 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-90 uppercase tracking-wider">✅ Đúng</div>
          <div className="text-2xl font-bold tabular-nums">{correct}</div>
        </div>

        {/* Wrong */}
        <div className="bg-red-500/80 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-90 uppercase tracking-wider">❌ Sai</div>
          <div className="text-2xl font-bold tabular-nums">{wrong}</div>
        </div>

        {/* Accuracy */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-70 uppercase tracking-wider">Chính xác</div>
          <div className="text-lg font-bold tabular-nums">{accuracy}%</div>
        </div>

        {/* Timer (only shown if timeLimit > 0) */}
        {hasTimer && (
          <div className={`backdrop-blur-md rounded-2xl px-4 py-2 text-white ${
            isLowTime ? 'bg-red-600/90 animate-pulse' : 'bg-orange-500/80'
          }`}>
            <div className="text-xs opacity-90 uppercase tracking-wider">⏱️ Thời gian</div>
            <div className="text-2xl font-bold tabular-nums">{Math.ceil(timeRemaining)}s</div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className="inline-block bg-black/30 backdrop-blur-md rounded-xl px-4 py-2 text-white/70 text-xs">
          Kéo thả rác vào đúng thùng: 🟢 Hữu cơ &nbsp;|&nbsp; ⚪ Vô cơ &nbsp;|&nbsp; 🔵 Tái chế
        </div>
      </div>
    </motion.div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultScreen({ result, onReplay, onBack }) {
  if (!result) return null;

  const { distance, trashCollected, sortingScore, collectedTrash } = result;
  const total = sortingScore.correct + sortingScore.wrong;
  const accuracy = total > 0 ? Math.round((sortingScore.correct / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">🎉 Kết quả</h2>
        <p className="text-center text-gray-500 mb-6">Bạn đã hoàn thành mini-game!</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <div className="text-sm text-blue-600 mb-1">🏃 Quãng đường</div>
            <div className="text-2xl font-bold text-blue-700">{Math.floor(distance)}m</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <div className="text-sm text-green-600 mb-1">🗑️ Rác thu gom</div>
            <div className="text-2xl font-bold text-green-700">{trashCollected}</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <div className="text-sm text-emerald-600 mb-1">✅ Phân loại đúng</div>
            <div className="text-2xl font-bold text-emerald-700">{sortingScore.correct}</div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 text-center">
            <div className="text-sm text-amber-600 mb-1">🎯 Chính xác</div>
            <div className="text-2xl font-bold text-amber-700">{accuracy}%</div>
          </div>
        </div>

        {/* Trash breakdown */}
        {collectedTrash && collectedTrash.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Chi tiết rác thu gom
            </h3>
            <div className="space-y-1">
              {collectedTrash.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm py-1 px-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">{item.type.name}</span>
                  <span className="font-semibold text-gray-800">×{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onReplay}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/30"
          >
            🔄 Chơi lại
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
          >
            ← Quay về
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
        transition={{ duration: 0.3, ease: 'easeOut' }}
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
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        className="text-center text-white"
      >
        <div className="text-6xl mb-4">{stage === 'STAGE_2' ? '♻️' : '🎮'}</div>
        <div className="text-3xl font-bold mb-2">
          {stage === 'STAGE_2' ? 'Màn 2: Phân loại rác' : 'Bắt đầu!'}
        </div>
        <div className="text-lg opacity-70">
          {stage === 'STAGE_2'
            ? 'Kéo thả rác vào đúng thùng phân loại'
            : 'Thu gom rác và né vật cản!'}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main HUD Component ──────────────────────────────────────────────────────

export default function EcoGameHUD({ game, onBack, levelConfig }) {
  const [stage, setStage] = useState('STAGE_1');
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(levelConfig?.runner?.baseSpeed || 12);
  const [trashCount, setTrashCount] = useState(0);
  const [sortScore, setSortScore] = useState({ correct: 0, wrong: 0 });
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [result, setResult] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    if (!game) return;

    game.onDistanceUpdate((d, s) => {
      setDistance(d);
      setSpeed(s);
    });

    game.onTrashCollected((count) => {
      setTrashCount(count);
    });

    game.onSortingUpdate((score, remaining) => {
      setSortScore({ ...score });
      setItemsRemaining(remaining);
    });

    game.onTimerUpdate((time) => {
      setTimeRemaining(time);
    });

    game.onStageChange((newStage) => {
      if (newStage === 'STAGE_2') {
        // Initialize timer from config when entering stage 2
        const tl = levelConfig?.sorter?.timeLimit || 0;
        setTimeRemaining(tl > 0 ? tl : null);

        setShowGameOver(true);
        setTimeout(() => {
          setShowGameOver(false);
          setShowTransition(true);
          setTimeout(() => {
            setShowTransition(false);
            setStage('STAGE_2');
          }, 2000);
        }, 1200);
      } else if (newStage === 'RESULT') {
        setStage('RESULT');
      }
    });

    game.onResult((res) => {
      setResult(res);
    });
  }, [game, levelConfig]);

  const handleReplay = useCallback(() => {
    setStage('STAGE_1');
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
      {/* Back button - always visible */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/60 transition-colors"
        title="Quay về"
      >
        ✕
      </button>

      <AnimatePresence mode="wait">
        {stage === 'STAGE_1' && !showGameOver && !showTransition && (
          <RunnerHUD
            key="runner"
            distance={distance}
            speed={speed}
            trashCount={trashCount}
          />
        )}

        {stage === 'STAGE_2' && !result && (
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

      {stage === 'RESULT' && result && (
        <ResultScreen result={result} onReplay={handleReplay} onBack={onBack} />
      )}
    </>
  );
}
