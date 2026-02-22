import { createContext, useContext, useState } from "react";

// Tạo context
const StudentContext = createContext(undefined);

// Mock student data - Primary school student
const mockStudentData = {
  id: "student-001",
  name: "Nguyễn Minh An",
  email: "minhan@student.edu.vn",
  phone: "0123456789",
  grade: 3,
  class: "3A",
  school: "Tiểu học Nguyễn Huệ",
  avatar: "👦",
  coins: 2450,
  rank: 3,
  joinedDate: "2024-01-15",
  stats: {
    campaignsJoined: 5,
    quizzesCompleted: 23,
    gamesPlayed: 15,
    totalCoinsEarned: 3200,
    averageQuizScore: 85,
    currentStreak: 7,
  },
  achievements: [
    {
      id: 1,
      name: "Phân loại Rác 2025",
      icon: "♻️",
      description: "Chiến dịch hoàn thành",
      earned: "2025",
    },
    {
      id: 2,
      name: "Tiết kiệm Nước",
      icon: "💧",
      description: "Chiến dịch hoàn thành",
      earned: "2024",
    },
    {
      id: 3,
      name: "Trồng Cây Xanh",
      icon: "🌳",
      description: "Chiến dịch hoàn thành",
      earned: "2024",
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: "quiz",
      title: "Hoàn thành Quiz: Ô nhiễm không khí",
      coins: 25,
      date: "2024-01-20",
    },
    {
      id: 2,
      type: "game",
      title: "Chơi Game: Thu gom rác",
      coins: 15,
      date: "2024-01-19",
    },
    {
      id: 3,
      type: "reward",
      title: "Đổi quà: Avatar Gấu Xanh",
      coins: -500,
      date: "2024-01-18",
    },
    {
      id: 4,
      type: "quiz",
      title: "Hoàn thành Quiz: Tiết kiệm năng lượng",
      coins: 25,
      date: "2024-01-17",
    },
  ],
};

export function StudentProvider({ children }) {
  const [currentStudent, setCurrentStudent] = useState(mockStudentData);

  const updateCoins = (amount) => {
    setCurrentStudent((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      stats: {
        ...prev.stats,
        totalCoinsEarned:
          prev.stats.totalCoinsEarned + (amount > 0 ? amount : 0),
      },
    }));
  };

  const updateStats = (stats) => {
    setCurrentStudent((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        ...stats,
      },
    }));
  };

  const updateRank = (rank) => {
    setCurrentStudent((prev) => ({
      ...prev,
      rank,
    }));
  };

  return (
    <StudentContext.Provider
      value={{ currentStudent, updateCoins, updateStats, updateRank }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudentContext() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudentContext must be used within a StudentProvider");
  }
  return context;
}
