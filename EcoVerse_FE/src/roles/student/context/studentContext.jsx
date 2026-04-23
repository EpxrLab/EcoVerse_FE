import { createContext, useContext, useEffect, useState } from "react";
import { getAuthenticatedStudentProfile } from "../services";

// Tạo context
const StudentContext = createContext(undefined);

export function StudentProvider({ children }) {
  const [currentStudent, setCurrentStudent] = useState(null);

  const fetchAuthenticatedStudent = async () => {
    try {
      const res = await getAuthenticatedStudentProfile();
      setCurrentStudent(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAuthenticatedStudent();
  }, []);

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
      value={{
        currentStudent,
        updateCoins,
        updateStats,
        updateRank,
        refreshStudentData: fetchAuthenticatedStudent,
      }}
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
