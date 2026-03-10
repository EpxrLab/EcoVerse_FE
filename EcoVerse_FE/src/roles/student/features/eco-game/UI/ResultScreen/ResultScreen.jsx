import { motion, AnimatePresence } from "framer-motion";
export function ResultScreen({ result, onReplay, onBack }) {
  if (!result) return null;

  const { distance, trashCollected, sortingScore, collectedTrash } = result;
  const total = sortingScore.correct + sortingScore.wrong;
  const accuracy =
    total > 0 ? Math.round((sortingScore.correct / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          🎉 Kết quả
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Bạn đã hoàn thành mini-game!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <div className="text-sm text-blue-600 mb-1">🏃 Quãng đường</div>
            <div className="text-2xl font-bold text-blue-700">
              {Math.floor(distance)}m
            </div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <div className="text-sm text-green-600 mb-1">🗑️ Rác thu gom</div>
            <div className="text-2xl font-bold text-green-700">
              {trashCollected}
            </div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <div className="text-sm text-emerald-600 mb-1">
              ✅ Phân loại đúng
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {sortingScore.correct}
            </div>
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
                  <span className="font-semibold text-gray-800">
                    ×{item.count}
                  </span>
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
