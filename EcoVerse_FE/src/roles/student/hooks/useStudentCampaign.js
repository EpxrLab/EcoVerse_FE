import { useState, useEffect } from "react";
import { getAllCampaigns } from "../services";

const MOCK_API = [
  {
    id: "c1-invited-001",
    campaignCode: "CAMP_MAR_INV_01",
    campaignName: "Hội thảo Định hướng Nghề nghiệp 2026",
    campaignType: "SCHOOL_INTERNAL",
    description:
      "Chương trình giúp học sinh định hướng nghề nghiệp và chọn khối thi phù hợp.",
    status: "INVITED",
    startDate: "2026-03-25T08:00:00.000Z",
    endDate: "2026-03-28T17:00:00.000Z",
    invitationDate: "2026-03-20T08:00:00.000Z",
    invitationDeadline: "2026-03-24T23:59:59.000Z",
    topRankingCount: 10,
    totalRounds: 2,
    rounds: [
      {
        id: "r1-c1",
        roundNumber: 1,
        roundName: "Trắc nghiệm Holland",
        status: "UPCOMING",
        startTime: "2026-03-25T09:00:00.000Z",
        endTime: "2026-03-25T11:00:00.000Z",
        gameTypeId: "game-quiz-001",
        gameTypeName: "Quiz Logic",
        difficultyOverride: "EASY",
        resolvedDifficulty: "EASY",
        coinPerSession: 50,
        selectedPresetIds: ["preset-001"],
        presetSubCategoryConfig: {},
        quizzes: [
          {
            quizId: "quiz-101",
            title: "Khám phá bản thân",
            difficulty: "EASY",
            displayOrder: 1,
            maxAttempts: 1,
            isRequired: true,
          },
        ],
      },
      {
        id: "r2-c1",
        roundNumber: 2,
        roundName: "Phỏng vấn 1-1 với Chuyên gia",
        status: "UPCOMING",
        startTime: "2026-03-28T09:00:00.000Z",
        endTime: "2026-03-28T16:00:00.000Z",
        gameTypeId: "game-live-001",
        gameTypeName: "Live Interview",
        difficultyOverride: "MEDIUM",
        resolvedDifficulty: "MEDIUM",
        coinPerSession: 100,
        selectedPresetIds: [],
        presetSubCategoryConfig: {},
        quizzes: [],
      },
    ],
    participants: [
      {
        studentId: "std-001",
        studentCode: "STUDENT_2026_01",
        fullName: "Nguyễn Văn A",
        gradeLevel: "12",
        className: "12A1",
        parentApprovalStatus: "INVITED",
      },
    ],
  },
  {
    id: "c2-ongoing-002",
    campaignCode: "CAMP_MAR_ONG_02",
    campaignName: "Giải chạy Marathon Liên trường Khu vực",
    campaignType: "INTER_SCHOOL",
    description:
      "Sự kiện thể thao kết nối học sinh giữa các trường trong khu vực.",
    status: "ON_GOING",
    startDate: "2026-03-10T06:00:00.000Z",
    endDate: "2026-03-31T18:00:00.000Z",
    invitationDate: "2026-03-01T08:00:00.000Z",
    invitationDeadline: "2026-03-05T23:59:59.000Z",
    topRankingCount: 50,
    totalRounds: 3,
    rounds: [
      {
        id: "r1-c2",
        roundNumber: 1,
        roundName: "Vòng loại: Chạy tiếp sức",
        status: "COMPLETED",
        startTime: "2026-03-10T06:00:00.000Z",
        endTime: "2026-03-12T18:00:00.000Z",
        gameTypeId: "game-run-001",
        gameTypeName: "Marathon Tracking",
        difficultyOverride: "MEDIUM",
        resolvedDifficulty: "MEDIUM",
        coinPerSession: 100,
        selectedPresetIds: ["preset-002"],
        presetSubCategoryConfig: {},
        quizzes: [],
      },
      {
        id: "r2-c2",
        roundNumber: 2,
        roundName: "Vòng đối đầu: Leo núi giả lập",
        status: "ACTIVE",
        startTime: "2026-03-15T06:00:00.000Z",
        endTime: "2026-03-25T18:00:00.000Z",
        gameTypeId: "game-climb-001",
        gameTypeName: "Virtual Climbing",
        difficultyOverride: "HARD",
        resolvedDifficulty: "HARD",
        coinPerSession: 200,
        selectedPresetIds: ["preset-005"],
        presetSubCategoryConfig: {},
        quizzes: [
          {
            quizId: "quiz-202",
            title: "Kiến thức sơ cứu cơ bản",
            difficulty: "MEDIUM",
            displayOrder: 1,
            maxAttempts: 2,
            isRequired: true,
          },
        ],
      },
      {
        id: "r3-c2",
        roundNumber: 3,
        roundName: "Vòng đặc biệt: Kỹ năng sinh tồn",
        status: "CANCELLED",
        startTime: "2026-03-28T06:00:00.000Z",
        endTime: "2026-03-31T18:00:00.000Z",
        gameTypeId: "game-survival-001",
        gameTypeName: "Survival Skill",
        difficultyOverride: "HARD",
        resolvedDifficulty: "HARD",
        coinPerSession: 500,
        selectedPresetIds: [],
        presetSubCategoryConfig: {},
        quizzes: [],
      },
    ],
    participants: [
      {
        studentId: "std-001",
        studentCode: "STUDENT_2026_01",
        fullName: "Nguyễn Văn A",
        gradeLevel: "12",
        className: "12A1",
        parentApprovalStatus: "APPROVED",
      },
    ],
  },
  {
    id: "c4-completed-004",
    campaignCode: "CAMP_MAR_COM_04",
    campaignName: "Cuộc thi Sáng tạo Robot 2026",
    campaignType: "SCHOOL_INTERNAL",
    description:
      "Sân chơi sáng tạo khoa học kỹ thuật dành cho học sinh yêu thích STEM.",
    status: "COMPLETED",
    startDate: "2026-03-01T08:00:00.000Z",
    endDate: "2026-03-15T17:00:00.000Z",
    invitationDate: "2026-02-20T08:00:00.000Z",
    invitationDeadline: "2026-02-25T23:59:59.000Z",
    topRankingCount: 5,
    totalRounds: 2,
    rounds: [
      {
        id: "r1-c4",
        roundNumber: 1,
        roundName: "Thiết kế & Lập trình",
        status: "COMPLETED",
        startTime: "2026-03-01T08:00:00.000Z",
        endTime: "2026-03-05T17:00:00.000Z",
        gameTypeId: "game-stem-001",
        gameTypeName: "Coding Challenge",
        difficultyOverride: "MEDIUM",
        resolvedDifficulty: "MEDIUM",
        coinPerSession: 300,
        selectedPresetIds: ["preset-004"],
        presetSubCategoryConfig: {},
        quizzes: [
          {
            quizId: "quiz-401",
            title: "Kiến thức C++ cơ bản",
            difficulty: "MEDIUM",
            displayOrder: 1,
            maxAttempts: 1,
            isRequired: true,
          },
        ],
      },
      {
        id: "r2-c4",
        roundNumber: 2,
        roundName: "Chung kết: Đối kháng Robot",
        status: "COMPLETED",
        startTime: "2026-03-10T08:00:00.000Z",
        endTime: "2026-03-15T17:00:00.000Z",
        gameTypeId: "game-robot-001",
        gameTypeName: "Robot Battle",
        difficultyOverride: "HARD",
        resolvedDifficulty: "HARD",
        coinPerSession: 1000,
        selectedPresetIds: ["preset-009"],
        presetSubCategoryConfig: {},
        quizzes: [],
      },
    ],
    participants: [
      {
        studentId: "std-001",
        studentCode: "STUDENT_2026_01",
        fullName: "Nguyễn Văn A",
        gradeLevel: "12",
        className: "12A1",
        parentApprovalStatus: "COMPLETED",
      },
    ],
  },
];

export function useStudentCampaigns() {
  const [campaigns, setCampaigns] = useState(MOCK_API);
  const [loading, setLoading] = useState(false);

  // const fetchCampaigns = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await getAllCampaigns();
  //     setCampaigns(res.data);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchCampaigns();
  // }, []);

  const getActiveCampaigns = () =>
    campaigns.filter((c) => c.status === "active");

  const getUpcomingCampaigns = () =>
    campaigns.filter((c) => c.status === "upcoming");

  const getCompletedCampaigns = () =>
    campaigns.filter((c) => c.status === "completed");

  const getCampaignById = (id) => campaigns.find((c) => c.id === id);

  return {
    campaigns,
    loading,
    getActiveCampaigns,
    getUpcomingCampaigns,
    getCompletedCampaigns,
    getCampaignById,
  };
}
