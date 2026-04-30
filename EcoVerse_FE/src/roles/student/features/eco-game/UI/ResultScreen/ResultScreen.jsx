import { motion } from "framer-motion";
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

  const isLoss = result.success === false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 p-2 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="bg-white rounded-[2rem] p-5 sm:p-6 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        <h2
          className={`text-2xl sm:text-3xl flex items-center justify-center font-bold text-center mb-1 sm:mb-2 ${isLoss ? "text-red-600" : "text-gray-800"}`}
        >
          {isLoss ? (
            <>
              <span className="mr-2 text-xl">💥</span> Thất bại{" "}
              <span className="ml-2 text-xl">💥</span>
            </>
          ) : (
            <>
              <span className="mr-2 text-xl">🎉</span> Kết quả{" "}
              <span className="ml-2 text-xl">🎉</span>
            </>
          )}
        </h2>
        {feedbackMessage && (
          <p
            className={`text-center text-sm font-medium mb-4 py-1.5 px-3 rounded-xl ${isLoss ? "text-red-700 bg-red-100" : "text-primary bg-primary/10"}`}
          >
            {feedbackMessage}
          </p>
        )}

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              {
                label: "🏃 Quãng đường",
                value: `${Math.floor(distance || 0)}m`,
                color: "primary",
              },
              {
                label: "🗑️ Thu gom",
                value: trashCollected || 0,
                color: "primary",
              },
              {
                label: "⏱️ Thời gian",
                value: `${timeTaken}s`,
                color: "primary",
              },
              {
                label: "✅ Đúng",
                value: `${correct}/${totalItems}`,
                color: "primary",
              },
              {
                label: "🎯 Chính xác",
                value: `${accuracy}%`,
                color: "amber",
                bg: "amber-50",
                text: "amber-700",
                labelColor: "amber-600",
              },
              {
                label: "💰 Thưởng",
                value: `+${coins}`,
                color: "yellow",
                bg: "yellow-50",
                text: "yellow-700",
                labelColor: "yellow-600",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`${stat.bg || "bg-primary/5"} rounded-2xl p-2 sm:p-3 text-center border border-transparent hover:border-gray-100 transition-colors`}
              >
                <div
                  className={`text-[9px] sm:text-[10px] font-bold ${stat.labelColor || "text-primary/60"} mb-0.5 uppercase tracking-wider truncate`}
                >
                  {stat.label}
                </div>
                <div
                  className={`text-sm sm:text-lg font-black ${stat.text || "text-primary"}`}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Trash breakdown */}
          {collectedTrash && collectedTrash.length > 0 && (
            <div className="flex flex-col min-h-0">
              <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-[0.15em]">
                Chi tiết rác thu gom
              </h3>
              <div className="overflow-y-auto pr-1 custom-scrollbar space-y-1.5 max-h-[140px] sm:max-h-[180px]">
                {collectedTrash.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-gray-50/80 rounded-xl py-2 px-3 border border-gray-100/50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-700 font-semibold">
                        {item.type.name}
                      </span>
                      <span className="font-black text-primary ml-2 bg-primary/10 px-2 py-0.5 rounded-lg">
                        ×{item.count}
                      </span>
                    </div>
                    {item.type.funFact && (
                      <p className="text-[9px] sm:text-[10px] text-gray-500 italic mt-1.5 leading-relaxed border-t border-gray-200/40 pt-1.5">
                        {item.type.funFact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onReplay}
            className="flex-1 py-2.5 sm:py-3.5 px-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all duration-300 shadow-xl shadow-primary/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="text-lg">🔄</span> Chơi lại
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-2.5 sm:py-3.5 px-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>←</span> Quay về
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
