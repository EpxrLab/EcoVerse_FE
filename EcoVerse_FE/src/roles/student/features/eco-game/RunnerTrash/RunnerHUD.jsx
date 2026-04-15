import { motion } from "framer-motion";
export function RunnerHUD({ distance, speed, trashCount, totalTrash }) {
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
          <div className="text-xs opacity-70 uppercase tracking-wider">
            Quãng đường
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {Math.floor(distance)}m
          </div>
        </div>

        {/* Trash collected */}
        <div className="bg-primary/80 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-90 uppercase tracking-wider">
            🗑️ Rác thu gom
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {trashCount}
            {totalTrash > 0 && (
              <span className="text-sm opacity-70 font-normal">
                {" "}
                / {totalTrash}
              </span>
            )}
          </div>
        </div>

        {/* Speed */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
          <div className="text-xs opacity-70 uppercase tracking-wider">
            Tốc độ
          </div>
          <div className="text-lg font-bold tabular-nums">
            {speed.toFixed(1)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
