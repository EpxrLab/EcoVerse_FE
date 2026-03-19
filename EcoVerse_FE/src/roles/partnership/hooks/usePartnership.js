import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAuthenticatedPartnership } from "../services";

export function usePartnership() {
  const navigate = useNavigate();
  const [partnershipInfo, setPartnershipInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getAuthenticatedPartnership();
        const data = res?.data || res;

        if (!data) {
          navigate("/auth/partnership");
          return;
        }

        // Logic check status (example)
        if (data.status === "pending") {
          navigate("/auth/partnership/pending");
          return;
        }
        if (data.status === "rejected") {
          navigate("/auth/partnership/rejected");
          return;
        }

        setPartnershipInfo(data);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth/partnership");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // TODO: Call API logout endpoint, e.g.:
      // await api.post('/auth/logout');

      // Clear local auth state (token, etc.) here if needed
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/auth/partnership');
  };

  const getPartnershipTypeLabel = (type) => {
    const types = {
      SPONSOR: "Nhà tài trợ",
      NGO: "Tổ chức phi chính phủ",
      MEDIA: "Truyền thông",
      TECHNOLOGY: "Công nghệ",
      EDUCATION: "Giáo dục",
      YOUTH_UNION: "Đoàn thanh niên",
      WARD_GOVERNMENT: "Chính quyền phường/xã",
      PUBLIC_ORGANIZATION: "Tổ chức công",
      OTHER: "Khác",
    };
    // Safe check in case backend returns lowercase
    const upperType = type?.toString().toUpperCase();
    return types[upperType] || type;
  };

  return {
    partnershipInfo,
    isLoading,
    handleLogout,
    getPartnershipTypeLabel,
  };
}