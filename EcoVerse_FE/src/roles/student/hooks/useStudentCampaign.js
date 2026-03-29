import { useState, useEffect } from "react";

// Mock campaigns data
const MOCK_API = [
  {
    id: "c1-invited-001",
    campaignCode: "CAMP_MAR_INV_01",
    campaignName: "Hội thảo Định hướng Nghề nghiệp 2026",
    campaignType: "SCHOOL_INTERNAL", // Trong trường
    status: "INVITED",
    startDate: "2026-03-25T08:00:00.000Z",
    endDate: "2026-03-26T17:00:00.000Z",
    invitationDeadline: "2026-03-24T23:59:59.000Z", // Sắp hết hạn đăng ký
  },
  {
    id: "c2-ongoing-002",
    campaignCode: "CAMP_MAR_ONG_02",
    campaignName: "Giải chạy Marathon Liên trường Khu vực",
    campaignType: "INTER_SCHOOL", // Liên trường
    status: "ON_GOING",
    startDate: "2026-03-10T06:00:00.000Z",
    endDate: "2026-03-31T18:00:00.000Z",
    invitationDeadline: "2026-03-05T23:59:59.000Z",
  },
  {
    id: "c3-partner-003",
    campaignCode: "CAMP_MAR_ONG_03",
    campaignName: "Ngày hội Tuyển dụng Công nghệ - Partnership",
    campaignType: "PARTNERSHIP_EVENT", // Ngoài trường / Đối tác
    status: "ON_GOING",
    startDate: "2026-03-15T09:00:00.000Z",
    endDate: "2026-03-30T17:00:00.000Z",
    invitationDeadline: "2026-03-12T23:59:59.000Z",
  },
  {
    id: "c4-completed-004",
    campaignCode: "CAMP_MAR_COM_04",
    campaignName: "Cuộc thi Sáng tạo Robot 2026",
    campaignType: "SCHOOL_INTERNAL",
    status: "COMPLETED",
    startDate: "2026-03-01T08:00:00.000Z",
    endDate: "2026-03-05T17:00:00.000Z",
    invitationDeadline: "2026-02-25T23:59:59.000Z",
  },
  {
    id: "c5-invited-005",
    campaignCode: "CAMP_MAR_INV_05",
    campaignName: "Workshop Kỹ năng mềm: Giao tiếp hiệu quả",
    campaignType: "PARTNERSHIP_EVENT",
    status: "INVITED",
    startDate: "2026-03-28T13:00:00.000Z",
    endDate: "2026-03-28T16:00:00.000Z",
    invitationDeadline: "2026-03-27T10:00:00.000Z",
  },
];

export function useStudentCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCampaigns(MOCK_API);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

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
