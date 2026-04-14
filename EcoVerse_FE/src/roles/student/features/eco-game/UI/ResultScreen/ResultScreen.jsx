import { motion, AnimatePresence } from "framer-motion";
export function ResultScreen({ result, onReplay, onBack }) {
  if (!result) return null;

  const { distance, trashCollected, sortingScore, collectedTrash, apiResult } =
    result;

  // Choose which values to display based on whether we have API result
  const totalItems = apiResult
    ? apiResult.totalItems
    : sortingScore.correct + sortingScore.wrong;
  const correct = apiResult ? apiResult.correctItems : sortingScore.correct;
  const accuracy = apiResult
    ? apiResult.accuracyPercentage
    : totalItems > 0
      ? Math.round((correct / totalItems) * 100)
      : 0;
  const coins = apiResult ? apiResult.coinAwarded : 0;
  const timeTaken = apiResult ? apiResult.timeTakenSeconds : 0;
  const feedbackMessage = apiResult?.feedbackMessage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl"
      >
        <h2 className="text-3xl flex items-center justify-center font-bold text-center mb-2 text-gray-800">
          <span className="mr-2">🎉</span> Kết quả{" "}
          <span className="ml-2">🎉</span>
        </h2>
        {feedbackMessage && (
          <p className="text-center font-medium text-emerald-600 mb-6 bg-emerald-50 py-2 rounded-lg">
            {feedbackMessage}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">
              🏃 Quãng đường
            </div>
            <div className="text-xl font-bold text-blue-700">
              {Math.floor(distance || 0)}m
            </div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wider">
              🗑️ Thu gom
            </div>
            <div className="text-xl font-bold text-green-700">
              {trashCollected || 0}
            </div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wider">
              ⏱️ Thời gian
            </div>
            <div className="text-xl font-bold text-purple-700">
              {timeTaken}s
            </div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">
              ✅ Đúng
            </div>
            <div className="text-xl font-bold text-emerald-700">
              {correct} / {totalItems}
            </div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-amber-600 mb-1 uppercase tracking-wider">
              🎯 Chính xác
            </div>
            <div className="text-xl font-bold text-amber-700">{accuracy}%</div>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-yellow-600 mb-1 uppercase tracking-wider">
              💰 Thưởng
            </div>
            <div className="text-xl font-bold text-yellow-700">
              +{coins} Coin
            </div>
          </div>
        </div>

        {/* Trash breakdown */}
        {collectedTrash && collectedTrash.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Chi tiết rác thu gom
            </h3>
            <div className="max-h-[160px] overflow-y-auto pr-1 custom-scrollbar space-y-1.5">
              {collectedTrash.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col bg-gray-50 rounded-xl py-2 px-3 border border-gray-100"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">{item.type.name}</span>
                    <span className="font-bold text-emerald-600 ml-2">
                      ×{item.count}
                    </span>
                  </div>
                  {item.type.funFact && (
                    <p className="text-[10px] text-gray-500 italic mt-1 leading-relaxed border-t border-gray-200/50 pt-1">
                      {item.type.funFact}
                    </p>
                  )}
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
