import React, { useState, useRef } from "react";
import { Card, Button, Progress } from "antd";
import {
  StarOutlined,
  StarFilled,
  DollarOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const wasteItems = [
  {
    id: 1,
    name: "Chai nhựa",
    emoji: "🧴",
    correctBin: "plastic",
    funFact: "Chai nhựa mất 450 năm để phân hủy!",
  },
  {
    id: 2,
    name: "Giấy báo",
    emoji: "📰",
    correctBin: "paper",
    funFact: "Giấy có thể tái chế đến 7 lần!",
  },
  {
    id: 3,
    name: "Vỏ chuối",
    emoji: "🍌",
    correctBin: "organic",
    funFact: "Vỏ chuối làm phân bón tự nhiên tốt!",
  },
  {
    id: 4,
    name: "Pin cũ",
    emoji: "🔋",
    correctBin: "others",
    funFact: "Pin chứa chất độc, cần xử lý đặc biệt!",
  },
  {
    id: 5,
    name: "Hộp carton",
    emoji: "📦",
    correctBin: "paper",
    funFact: "Tái chế 1 tấn carton tiết kiệm 17 cây!",
  },
];

const bins = [
  { type: "plastic", name: "Nhựa", color: "bg-[#2d6a4f]", emoji: "♻️" },
  { type: "paper", name: "Giấy", color: "bg-[#1f5e44]", emoji: "📄" },
  { type: "organic", name: "Hữu cơ", color: "bg-[#765b07]", emoji: "🍂" },
  { type: "others", name: "Khác", color: "bg-[#5b605c]", emoji: "🗑️" },
];

const GameDemo = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showFact, setShowFact] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredBin, setHoveredBin] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const binRefs = useRef({});

  const currentItem = wasteItems[currentIndex];
  const progress = (currentIndex / wasteItems.length) * 100;

  // Desktop drag handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, binType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHoveredBin(binType);
  };

  const handleDragLeave = () => {
    setHoveredBin(null);
  };

  const handleDrop = (e, binType) => {
    e.preventDefault();
    setHoveredBin(null);
    setIsDragging(false);

    if (!draggedItem) return;
    processAnswer(binType);
  };

  // Mobile touch handlers
  const handleTouchStart = (e, item) => {
    setDraggedItem(item);
    setIsDragging(true);
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });

    // Detect bin hover
    let foundBin = null;
    Object.entries(binRefs.current).forEach(([binType, ref]) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          foundBin = binType;
        }
      }
    });
    setHoveredBin(foundBin);
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    let droppedBin = null;

    Object.entries(binRefs.current).forEach(([binType, ref]) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          droppedBin = binType;
        }
      }
    });

    setIsDragging(false);
    setHoveredBin(null);
    setDraggedItem(null);

    if (droppedBin) {
      processAnswer(droppedBin);
    }
  };

  const processAnswer = (binType) => {
    if (feedback) return;

    const isCorrect = currentItem.correctBin === binType;

    if (isCorrect) {
      setScore(score + 1);
      setCoins(coins + 10);
      setFeedback({ type: "correct", message: "Tuyệt vời! 🎉" });
      setShowFact(true);
    } else {
      setFeedback({ type: "wrong", message: "Thử lại nhé! 💪" });
    }

    setTimeout(
      () => {
        if (isCorrect) {
          if (currentIndex < wasteItems.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            setCompleted(true);
          }
          setShowFact(false);
        }
        setFeedback(null);
        setDraggedItem(null);
      },
      isCorrect ? 2500 : 1000
    );
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setCoins(0);
    setFeedback(null);
    setShowFact(false);
    setCompleted(false);
    setGameStarted(true);
    setDraggedItem(null);
    setHoveredBin(null);
  };

  // Start Screen
  if (!gameStarted) {
    return (
      <section className="py-32 bg-[#f9faf6] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 font-greenhouse-heading tracking-tight text-[#2e3430]">
              Thử{" "}
              <span className="bg-gradient-to-r from-[#2d6a4f] to-[#1f5e44] bg-clip-text text-transparent">
                Chơi Game
              </span>{" "}
              Ngay!
            </h2>
            <p className="text-xl text-[#5b605c] mb-12 font-greenhouse-body leading-relaxed">
              Trải nghiệm thực tế kỹ năng phân loại rác qua mini-game tương tác. 
              Ghi điểm và nhận những huy hiệu danh dự đầu tiên của bạn!
            </p>
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={() => setGameStarted(true)}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-[#2d6a4f] to-[#1f5e44] border-none rounded-full shadow-lg shadow-green-900/20 transform transition-all active:scale-95 font-greenhouse-heading"
            >
              Bắt đầu trải nghiệm
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  // Completion Screen
  if (completed) {
    return (
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto text-center border-none rounded-[3rem] shadow-[0_32px_64px_rgba(45,106,79,0.15)] bg-white overflow-hidden">
              <div className="p-16">
                <div className="text-7xl mb-8">🎊</div>
                <h2 className="text-4xl font-black mb-4 font-greenhouse-heading text-[#2e3430]">
                  Thật Tuyệt Vời!
                </h2>
                <p className="text-xl text-[#5b605c] mb-10 font-greenhouse-body">
                  Bạn đã xuất sắc phân loại đúng {score}/{wasteItems.length} vật phẩm.
                </p>

                <div className="flex items-center justify-center gap-12 mb-12">
                  <div className="text-center">
                    <div className="text-4xl font-black text-[#2d6a4f] mb-2 font-greenhouse-heading">
                      {Math.round((score / wasteItems.length) * 100)}%
                    </div>
                    <div className="text-sm font-bold text-[#5b605c] uppercase">Chính xác</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-[#765b07] mb-2 font-greenhouse-heading">
                      +{coins}
                    </div>
                    <div className="text-sm font-bold text-[#5b605c] uppercase">Huy hiệu hạt mầm</div>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={resetGame}
                  className="h-14 px-10 bg-gradient-to-r from-[#2d6a4f] to-[#1f5e44] border-none rounded-full font-bold shadow-lg shadow-green-900/20 font-greenhouse-heading"
                >
                  Chơi lại
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  // Game Screen
  return (
    <section className="py-32 bg-[#f9faf6] relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 font-greenhouse-heading tracking-tight text-[#2e3430]">
            Trải Nghiệm{" "}
            <span className="bg-gradient-to-r from-[#2d6a4f] to-[#1f5e44] bg-clip-text text-transparent">
              Phân Loại Rác
            </span>
          </h2>
          <p className="text-xl text-[#5b605c] font-greenhouse-body">Kéo rác vào thùng phù hợp dưới đây 👇</p>
        </div>

        <Card className="max-w-4xl mx-auto border-none rounded-[3rem] shadow-[0_32px_64px_rgba(45,106,79,0.1)] bg-white/60 backdrop-blur-xl overflow-hidden">
          <div className="p-8">
            {/* Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#b1f0ce]/30 text-[#2d6a4f] font-bold">
                    <StarFilled />
                    <span>
                      {score}/{wasteItems.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#ffd97d]/30 text-[#765b07] font-bold">
                    <DollarOutlined />
                    <span>{coins}</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-[#5b605c] uppercase tracking-wider">
                  Vật phẩm {currentIndex + 1}/{wasteItems.length}
                </div>
              </div>

            {/* Progress */}
            <Progress
              percent={Math.round(progress)}
              strokeColor={{
                '0%': '#2d6a4f',
                '100%': '#1f5e44',
              }}
              strokeWidth={12}
              className="mb-12 greenhouse-progress"
            />

            {/* Current Item */}
            <div className="text-center mb-8">
              <motion.div
                draggable
                onDragStart={(e) => handleDragStart(e, currentItem)}
                onTouchStart={(e) => handleTouchStart(e, currentItem)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`inline-flex items-center justify-center w-40 h-40 rounded-[2.5rem] bg-[#f2f4f0] text-8xl mb-6 cursor-grab active:cursor-grabbing shadow-lg shadow-gray-200/50 select-none ${
                  feedback?.type === "correct"
                    ? "scale-110"
                    : feedback?.type === "wrong"
                    ? "animate-shake"
                    : ""
                }`}
                animate={
                  feedback?.type === "correct" ? { scale: [1, 1.2, 1] } : {}
                }
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                {currentItem.emoji}
              </motion.div>
              <h3 className="text-3xl font-black text-[#2e3430] font-greenhouse-heading">{currentItem.name}</h3>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      feedback.type === "correct"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {feedback.type === "correct" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )}
                    <span className="font-semibold">{feedback.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fun Fact */}
              <AnimatePresence>
                {showFact && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 mx-auto max-w-md"
                  >
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-100 text-left">
                      <BulbOutlined className="text-2xl text-green-600 mt-1" />
                      <div>
                        <div className="font-semibold text-green-700 mb-1">
                          Bạn có biết?
                        </div>
                        <p className="text-sm text-gray-700">
                          {currentItem.funFact}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bins */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {bins.map((bin) => (
                <motion.div
                  key={bin.type}
                  ref={(el) => (binRefs.current[bin.type] = el)}
                  onDragOver={(e) => handleDragOver(e, bin.type)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, bin.type)}
                  className={`relative p-6 rounded-2xl ${
                    bin.color
                  } text-white text-center cursor-pointer transition-all ${
                    hoveredBin === bin.type
                      ? "scale-105 ring-4 ring-white/50"
                      : ""
                  }`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-4xl mb-2">{bin.emoji}</div>
                  <div className="font-bold">{bin.name}</div>
                </motion.div>
              ))}
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <Button
                icon={<ReloadOutlined />}
                onClick={resetGame}
                className="text-gray-600"
              >
                Chơi lại từ đầu
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Dragging Ghost (Mobile) */}
      {isDragging && draggedItem && (
        <div
          style={{
            position: "fixed",
            left: dragPosition.x - 40,
            top: dragPosition.y - 40,
            width: 80,
            height: 80,
            pointerEvents: "none",
            zIndex: 9999,
            fontSize: "60px",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          {draggedItem.emoji}
        </div>
      )}
    </section>
  );
};

export default GameDemo;
