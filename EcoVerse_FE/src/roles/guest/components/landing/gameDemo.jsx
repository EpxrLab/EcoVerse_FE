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
  { type: "plastic", name: "Nhựa", color: "bg-blue-500", emoji: "♻️" },
  { type: "paper", name: "Giấy", color: "bg-green-500", emoji: "📄" },
  { type: "organic", name: "Hữu cơ", color: "bg-amber-500", emoji: "🍂" },
  { type: "others", name: "Khác", color: "bg-red-500", emoji: "🗑️" },
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
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Thử{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                chơi game
              </span>{" "}
              ngay!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Kéo thả vật phẩm vào thùng rác phù hợp để phân loại rác thải. Học
              nhiều điều thú vị về môi trường!
            </p>
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={() => setGameStarted(true)}
              className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700 border-none"
            >
              Bắt đầu chơi
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
            <Card className="max-w-2xl mx-auto text-center shadow-2xl">
              <div className="p-12">
                <div className="text-6xl mb-6">🎊</div>
                <h2 className="text-3xl font-bold mb-4">
                  Hoàn thành xuất sắc!
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Bạn đã phân loại đúng {score}/{wasteItems.length} vật phẩm
                </p>

                <div className="flex items-center justify-center gap-8 mb-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-green-600 mb-2">
                      <StarFilled />
                      {Math.round((score / wasteItems.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Độ chính xác</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-orange-600 mb-2">
                      <DollarOutlined />+{coins}
                    </div>
                    <div className="text-sm text-gray-600">Coins kiếm được</div>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={resetGame}
                  className="h-12 px-6 bg-green-600 hover:bg-green-700 border-none"
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
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Thử{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              chơi game
            </span>{" "}
            ngay!
          </h2>
          <p className="text-gray-600">Kéo rác vào thùng phù hợp 👇</p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-xl">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100">
                  <StarFilled className="text-green-600" />
                  <span className="font-bold text-green-600">
                    {score}/{wasteItems.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100">
                  <DollarOutlined className="text-orange-600" />
                  <span className="font-bold text-orange-600">{coins}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Vật phẩm {currentIndex + 1}/{wasteItems.length}
              </div>
            </div>

            {/* Progress */}
            <Progress
              percent={Math.round(progress)}
              strokeColor="#16a34a"
              className="mb-8"
            />

            {/* Current Item */}
            <div className="text-center mb-8">
              <motion.div
                draggable
                onDragStart={(e) => handleDragStart(e, currentItem)}
                onTouchStart={(e) => handleTouchStart(e, currentItem)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gray-100 text-7xl mb-4 cursor-grab active:cursor-grabbing select-none ${
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
              <h3 className="text-2xl font-bold">{currentItem.name}</h3>

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
