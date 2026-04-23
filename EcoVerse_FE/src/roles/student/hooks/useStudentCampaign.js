import { useState, useEffect } from "react";
import { getAllCampaigns } from "../services";
import { toLocalISO } from "@/utils/dateUtils";

export function useStudentCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await getAllCampaigns();
      const mappedData = (res.data || []).map(c => ({
        ...c,
        startDate: toLocalISO(c.startDate),
        endDate: toLocalISO(c.endDate),
        invitationDeadline: toLocalISO(c.invitationDeadline)
      }));
      setCampaigns(mappedData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
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
