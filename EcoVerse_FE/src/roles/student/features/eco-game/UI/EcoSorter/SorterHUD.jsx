import { motion } from "framer-motion";
export function SorterHUD({ itemsRemaining, correct, wrong, timeRemaining }) {
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
        <div className="bg-primary/80 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-90 uppercase tracking-wider">
            Còn lại
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {itemsRemaining}
          </div>
        </div>

        {/* Score */}
        <div className="bg-primary/80 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-90 uppercase tracking-wider">
            ✅ Đúng
          </div>
          <div className="text-2xl font-bold tabular-nums">{correct}</div>
        </div>

        {/* Wrong */}
        <div className="bg-red-500/80 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-90 uppercase tracking-wider">
            ❌ Sai
          </div>
          <div className="text-2xl font-bold tabular-nums">{wrong}</div>
        </div>

        {/* Accuracy */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-70 uppercase tracking-wider">
            Chính xác
          </div>
          <div className="text-lg font-bold tabular-nums">{accuracy}%</div>
        </div>

        {/* Timer (only shown if timeLimit > 0) */}
        {hasTimer && (
          <div
            className={`backdrop-blur-md rounded-2xl px-4 py-2 text-white ${
              isLowTime ? "bg-red-600/90 animate-pulse" : "bg-primary/80"
            }`}
          >
            <div className="text-xs opacity-90 uppercase tracking-wider">
              ⏱️ Thời gian
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {Math.ceil(timeRemaining)}s
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className="inline-block bg-black/30 backdrop-blur-md rounded-xl px-4 py-2 text-white/70 text-xs">
          Kéo thả rác vào đúng thùng: 🟢 Hữu cơ &nbsp;|&nbsp; ⚪ Vô cơ
          &nbsp;|&nbsp; 🔵 Tái chế
        </div>
      </div>
    </motion.div>
  );
}
