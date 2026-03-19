import { usePartnership } from "../../hooks";
import { PartnershipStats } from "../../features/dashboard/components";

export default function PartnershipDashboard() {
  const { partnershipInfo, getPartnershipTypeLabel } = usePartnership();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Chào mừng, {partnershipInfo?.organizationName || "Đối tác"}!
        </h2>
        <p className="text-muted-foreground">
          Quản lý hợp tác và theo dõi hoạt động của bạn với EcoVerse
        </p>
      </div>

      {/* Stats Cards */}
      <PartnershipStats
        partnershipType={getPartnershipTypeLabel(
          partnershipInfo?.partnershipType || "",
        )}
        schoolsCount="Đang cập nhật"
        campaignsCount="Đang cập nhật"
        joinDate={
          partnershipInfo?.createdAt
            ? new Date(partnershipInfo.createdAt).toLocaleDateString("vi-VN")
            : "N/A"
        }
      />
    </div>
  );
}