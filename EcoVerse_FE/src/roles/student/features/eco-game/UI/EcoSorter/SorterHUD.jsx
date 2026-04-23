import { motion } from "framer-motion";

export function SorterHUD({ itemsRemaining, correct, wrong, timeRemaining, totalItems }) {
  const accuracy = totalItems > 0 ? Math.round((correct / totalItems) * 100) : 0;
  const hasTimer = timeRemaining !== null && timeRemaining !== undefined;
  const isLowTime = hasTimer && timeRemaining < 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-0 left-0 right-0 p-4 pointer-events-none"
    >
      <div className="flex flex-wrap justify-center md:justify-between items-start max-w-2xl mx-auto gap-2">
        {/* Items remaining */}
        <div className="bg-primary/80 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-4 py-1 md:py-2 text-white min-w-[70px] md:min-w-[100px] text-center">
          <div className="text-[10px] md:text-xs opacity-90 uppercase tracking-wider">
            Còn lại
          </div>
          <div className="text-lg md:text-2xl font-bold tabular-nums">
            {itemsRemaining} / {totalItems}
          </div>
        </div>

        {/* Score */}
        <div className="bg-primary/80 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-4 py-1 md:py-2 text-white min-w-[70px] md:min-w-[100px] text-center">
          <div className="text-[10px] md:text-xs opacity-90 uppercase tracking-wider">
            ✅ Đúng
          </div>
          <div className="text-lg md:text-2xl font-bold tabular-nums">
            {correct}
          </div>
        </div>

        {/* Wrong */}
        <div className="bg-red-500/80 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-4 py-1 md:py-2 text-white min-w-[70px] md:min-w-[100px] text-center">
          <div className="text-[10px] md:text-xs opacity-90 uppercase tracking-wider">
            ❌ Sai
          </div>
          <div className="text-lg md:text-2xl font-bold tabular-nums">
            {wrong}
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-4 py-1 md:py-2 text-white min-w-[70px] md:min-w-[100px] text-center">
          <div className="text-[10px] md:text-xs opacity-70 uppercase tracking-wider">
            🎯 Chính xác
          </div>
          <div className="text-sm md:text-lg font-bold tabular-nums">
            {accuracy}%
          </div>
        </div>

        {/* Timer (only shown if timeLimit > 0) */}
        {hasTimer && (
          <div
            className={`backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-4 py-1 md:py-2 text-white min-w-[70px] md:min-w-[100px] text-center ${
              isLowTime ? "bg-red-600/90 animate-pulse" : "bg-primary/80"
            }`}
          >
            <div className="text-[10px] md:text-xs opacity-90 uppercase tracking-wider">
              ⏱️ Time
            </div>
            <div className="text-lg md:text-2xl font-bold tabular-nums">
              {Math.ceil(timeRemaining)}s
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
