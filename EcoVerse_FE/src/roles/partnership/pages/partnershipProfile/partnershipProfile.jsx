import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Handshake,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  FileText,
  Building2,
  Tag,
  Loader2,
  Network,
  LocateFixed,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/components/ui/skeleton";
// ─── Services ─────────────────────────────────────────────────────────────────
import {
  getAuthenticatedPartnership,
  updatePartnershipProfile,
} from "../../services";
import {
  getProvinces,
  getWards,
  uploadFile,
} from "../../../../features/auth/services";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTNERSHIP_TYPE_MAP = {
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PartnershipProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [pCode, setPCode] = useState(null);
  const [wards, setWards] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [localPreviews, setLocalPreviews] = useState({
    logoUrl: null,
    licenseUrl: null,
  });

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (localPreviews.logoUrl) URL.revokeObjectURL(localPreviews.logoUrl);
      if (localPreviews.licenseUrl)
        URL.revokeObjectURL(localPreviews.licenseUrl);
    };
  }, [localPreviews]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!formData?.geographicScopeProvince) {
      setWards([]);
      setPCode(null);
      return;
    }
    const found = provinces.find(
      (p) => p.name === formData.geographicScopeProvince,
    );
    if (found) {
      setPCode(found.code);
      fetchWards(found.code);
    }
  }, [formData?.geographicScopeProvince]);

  const availableWards = pCode
    ? wards.filter((w) => w.province_code === pCode)
    : wards;

  // ─── API calls ───────────────────────────────────────────────────────────────

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getAuthenticatedPartnership();
      setProfile(res?.data || res || null);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được hồ sơ đối tác!");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await getProvinces();
      setProvinces(res || []);
    } catch (err) {
      console.error("Không tải được danh sách tỉnh:", err);
    }
  };

  // provinceCode truyền vào để getWards lọc đúng tỉnh
  const fetchWards = async (provinceCode) => {
    try {
      const res = await getWards(provinceCode);
      setWards(res || []);
    } catch (err) {
      console.error("Không tải được danh sách phường/xã:", err);
    }
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleBack = () => navigate("/partnership");

  const startEditing = () => {
    fetchProvinces();
    // Khởi tạo formData đúng theo BE schema — giữ đúng field names
    setFormData({
      organizationName: profile.organizationName ?? "",
      partnershipType: profile.partnershipType ?? "",
      contactEmail: profile.contactEmail ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      registeredAddress: profile.registeredAddress ?? "",
      geographicScopeWard: profile.geographicScopeWard ?? "",
      geographicScopeProvince: profile.geographicScopeProvince ?? "",
      contactPerson: profile.contactPerson ?? "",
      position: profile.position ?? "",
      taxCode: profile.taxCode ?? "",
      linkWeb: profile.linkWeb ?? "",
      description: profile.description ?? "",
      logoUrl: profile.logoUrl ?? "",
      licenseUrl: profile.licenseUrl ?? "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData(null);
    setWards([]);
    setPCode(null);
    // Cleanup local previews
    if (localPreviews.logoUrl) URL.revokeObjectURL(localPreviews.logoUrl);
    if (localPreviews.licenseUrl) URL.revokeObjectURL(localPreviews.licenseUrl);
    setLocalPreviews({ logoUrl: null, licenseUrl: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setLocalPreviews((prev) => ({ ...prev, [field]: previewUrl }));

    setIsUploadingFile(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await uploadFile(uploadData);
      const status = response?.status;
      if (status == 200 || status == 0 || status === "200" || status === "0") {
        const url = response?.data?.url || response?.url;
        if (url) {
          setFormData((prev) => ({ ...prev, [field]: url }));
          toast.success(
            `Đã tải lên ${field === "logoUrl" ? "Logo" : "Giấy phép"} thành công!`,
          );
        }
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.error("Tải file thất bại!");
      // If upload fails, revert local preview
      setLocalPreviews((prev) => ({ ...prev, [field]: null }));
      URL.revokeObjectURL(previewUrl);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      const res = await updatePartnershipProfile(formData);
      if (res) {
        toast.success("Cập nhật hồ sơ thành công!");
        setProfile({ ...profile, ...formData });
        setIsEditing(false);
        setFormData(null);
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi cập nhật!");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── No profile state ──
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-2xl border-2 border-eco-green/10">
          <div className="w-20 h-20 bg-eco-green/10 rounded-full flex items-center justify-center mx-auto text-eco-green animate-pulse">
            <Handshake className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Không tải được thông tin
            </h2>
            <p className="text-muted-foreground">
              Chúng tôi không thể tìm thấy dữ liệu hồ sơ đối tác vào lúc này.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={fetchProfile}
              className="w-full bg-eco-green hover:bg-eco-green/90"
            >
              Thử lại
            </Button>
            <Button onClick={handleBack} variant="outline" className="w-full">
              Quay lại Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const fullAddress = [
    profile.registeredAddress,
    profile.geographicScopeWard,
    profile.geographicScopeProvince,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={isEditing ? cancelEditing : handleBack}
              className="rounded-xl border-2 border-border/50 hover:border-border hover:bg-muted/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-eco-green flex items-center justify-center">
                <Handshake className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ đối tác"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEditing
                    ? "Cập nhật thông tin chi tiết của tổ chức"
                    : "Thông tin chi tiết về tổ chức đối tác"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-4 py-1.5 rounded-full font-bold h-9",
                    profile.approvalStatus === "APPROVED"
                      ? "bg-eco-blue/10 text-eco-blue border-eco-blue/20"
                      : "bg-amber-100 text-amber-600 border-amber-200",
                  )}
                >
                  Trạng thái:{" "}
                  {profile.approvalStatus === "APPROVED"
                    ? "Đã duyệt"
                    : profile.approvalStatus}
                </Badge>
                <Button
                  onClick={startEditing}
                  className="bg-eco-blue hover:bg-eco-blue/90 rounded-xl gap-2 shadow-lg shadow-eco-blue/20"
                >
                  Chỉnh sửa
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  className="rounded-xl"
                  disabled={isUpdating || isUploadingFile}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-eco-blue hover:bg-eco-blue/90 rounded-xl gap-2 shadow-lg shadow-eco-blue/20"
                  disabled={isUpdating || isUploadingFile}
                >
                  {isUpdating || isUploadingFile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  Lưu thay đổi
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-eco-blue/15 overflow-hidden rounded-3xl bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative p-6 md:p-10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-eco-blue/15 to-transparent rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-eco-blue/15 to-transparent rounded-full blur-3xl -z-10" />

                {/* ══ VIEW MODE ══ */}
                {!isEditing ? (
                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-8">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Logo */}
                        <div className="relative group">
                          <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-eco-green to-eco-blue p-1.5 shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
                            <div className="w-full h-full rounded-[2.2rem] bg-card border-4 border-white overflow-hidden flex items-center justify-center">
                              {profile.logoUrl ? (
                                <img
                                  src={profile.logoUrl}
                                  alt="Logo"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Handshake className="w-16 h-16 text-eco-blue" />
                              )}
                            </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white shadow-xl border-2 border-eco-blue/20 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-eco-blue" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                          <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                              {profile.organizationName}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                              <div className="flex items-center gap-2 bg-eco-blue/8 text-eco-blue px-4 py-1.5 rounded-full border border-eco-blue/15 text-sm font-bold">
                                <Network className="w-4 h-4" />
                                {PARTNERSHIP_TYPE_MAP[
                                  profile.partnershipType
                                ] ?? profile.partnershipType}
                              </div>
                              {profile.taxCode && (
                                <div className="flex items-center gap-2 bg-eco-blue/8 text-eco-blue px-4 py-1.5 rounded-full border border-eco-blue/15 text-sm font-bold">
                                  <Tag className="w-4 h-4" />
                                  Mã số thuế: {profile.taxCode}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-muted-foreground pt-4">
                            {fullAddress && (
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                  <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground">
                                    Địa chỉ
                                  </span>
                                  <span>{fullAddress}</span>
                                </div>
                              </div>
                            )}
                            {profile.geographicScopeProvince && (
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                  <LocateFixed className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground">
                                    Phạm vi hoạt động
                                  </span>
                                  <span>
                                    {[
                                      profile.geographicScopeWard,
                                      profile.geographicScopeProvince,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Phone className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground">
                                  Số điện thoại
                                </span>
                                <span>{profile.phoneNumber || "—"}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground">
                                  Email liên hệ
                                </span>
                                <span>{profile.contactEmail || "—"}</span>
                              </div>
                            </div>
                            {profile.linkWeb && (
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                  <Globe className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground">
                                    Website
                                  </span>
                                  <a
                                    href={
                                      profile.linkWeb?.startsWith("http")
                                        ? profile.linkWeb
                                        : `https://${profile.linkWeb}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-eco-blue underline decoration-eco-blue/30 decoration-2 underline-offset-4"
                                  >
                                    {profile.linkWeb}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom cards */}
                      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="border-border/50 bg-background/50 rounded-2xl overflow-hidden shadow-sm">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                  Người liên hệ
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                  {profile.contactPerson || "—"}
                                </p>
                              </div>
                            </div>
                            {profile.position && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                                <ShieldCheck className="w-4 h-4 text-eco-blue" />
                                <span>Chức vụ: {profile.position}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {profile.licenseUrl && (
                          <Card className="border-border/50 bg-background/50 rounded-2xl overflow-hidden shadow-sm">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center text-eco-blue">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Giấy phép hoạt động
                                  </p>
                                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                    Link giấy phép
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                className="w-full rounded-xl"
                                asChild
                              >
                                <a
                                  href={profile.licenseUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Xem tài liệu
                                </a>
                              </Button>
                            </CardContent>
                          </Card>
                        )}

                        <Card className="lg:col-span-3 border-border/50 bg-background/50 rounded-2xl overflow-hidden shadow-sm">
                          <CardContent className="p-6 space-y-2">
                            <h3 className="font-bold text-foreground flex items-center gap-2 underline decoration-primary/20 decoration-4 underline-offset-4">
                              Giới thiệu về tổ chức
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {profile.description ||
                                "Chưa có thông tin giới thiệu."}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ══ EDIT MODE ══ */
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Basic Info */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-eco-blue flex items-center gap-2 border-b-2 border-eco-blue/10 pb-2">
                          <Building2 className="w-5 h-5" /> Thông tin cơ bản
                        </h3>
                        <div className="grid gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                              Tên tổ chức
                            </label>
                            <input
                              name="organizationName"
                              value={formData.organizationName}
                              onChange={handleInputChange}
                              placeholder="Nhập tên tổ chức..."
                              className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">
                                Loại đối tác
                              </label>
                              <select
                                name="partnershipType"
                                value={formData.partnershipType}
                                onChange={handleInputChange}
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-4 py-3 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner font-medium"
                              >
                                {Object.entries(PARTNERSHIP_TYPE_MAP).map(
                                  ([val, label]) => (
                                    <option key={val} value={val}>
                                      {label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">
                                Mã số thuế
                              </label>
                              <input
                                name="taxCode"
                                value={formData.taxCode}
                                onChange={handleInputChange}
                                placeholder="Nhập mã số thuế..."
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-eco-blue flex items-center gap-2 border-b-2 border-eco-blue/10 pb-2">
                          <Phone className="w-5 h-5" /> Liên hệ & Website
                        </h3>
                        <div className="grid gap-5">
                          <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">
                                Số điện thoại
                              </label>
                              <input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Nhập số điện thoại..."
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">
                                Email
                              </label>
                              <input
                                name="contactEmail"
                                disabled
                                value={formData.contactEmail}
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 outline-none shadow-inner opacity-60 cursor-not-allowed"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                              Website
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                name="linkWeb"
                                value={formData.linkWeb}
                                onChange={handleInputChange}
                                placeholder="www.example.org"
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl pl-11 pr-5 py-3 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-6 md:col-span-2">
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                          <MapPin className="w-5 h-5" /> Địa chỉ & Phạm vi hoạt
                          động
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                              Địa chỉ đăng ký
                            </label>
                            <input
                              name="registeredAddress"
                              value={formData.registeredAddress}
                              onChange={handleInputChange}
                              placeholder="VD: 123 Nguyễn Trãi"
                              className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-primary focus:bg-background outline-none transition-all shadow-inner"
                            />
                          </div>

                          {/* Tỉnh/Thành phố */}
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                              Tỉnh / Thành phố
                            </label>
                            <select
                              name="geographicScopeProvince"
                              value={formData.geographicScopeProvince}
                              onChange={handleInputChange}
                              className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-4 py-3 focus:border-primary focus:bg-background outline-none transition-all shadow-inner font-medium"
                            >
                              <option value="">Chọn Tỉnh / Thành phố</option>
                              {provinces.map((p) => (
                                <option key={p.code} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Phường/Xã — dùng availableWards (đã lọc theo pCode) */}
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                              Phường / Xã
                            </label>
                            <select
                              name="geographicScopeWard"
                              value={formData.geographicScopeWard}
                              onChange={handleInputChange}
                              disabled={!formData.geographicScopeProvince}
                              className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-4 py-3 focus:border-primary focus:bg-background outline-none transition-all shadow-inner font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {formData.geographicScopeProvince
                                  ? "Chọn Phường / Xã"
                                  : "Chọn tỉnh trước"}
                              </option>
                              {availableWards.map((w) => (
                                <option key={w.code} value={w.name}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Contact person */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-orange-500 flex items-center gap-2 border-b-2 border-orange-500/10 pb-2">
                          <User className="w-5 h-5" /> Người đại diện
                        </h3>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                              Họ và tên
                            </label>
                            <input
                              name="contactPerson"
                              value={formData.contactPerson}
                              onChange={handleInputChange}
                              placeholder="Nhập tên người liên hệ..."
                              className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-orange-500 focus:bg-background outline-none transition-all shadow-inner font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase">
                              Chức vụ
                            </label>
                            <input
                              name="position"
                              value={formData.position}
                              onChange={handleInputChange}
                              placeholder="VD: Giám đốc"
                              className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-orange-500 focus:bg-background outline-none transition-all shadow-inner font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Media / Docs */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-purple-500 flex items-center gap-2 border-b-2 border-purple-500/10 pb-2">
                          <FileText className="w-5 h-5" /> Hình ảnh & Tài liệu
                        </h3>
                        <div className="grid gap-6">
                          {/* Logo */}
                          <div className="space-y-3">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                              Logo tổ chức
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-eco-blue/20 overflow-hidden flex items-center justify-center bg-muted/20 shrink-0 shadow-inner group transition-all hover:border-eco-blue/40">
                                {localPreviews.logoUrl || formData.logoUrl ? (
                                  <img
                                    src={
                                      localPreviews.logoUrl || formData.logoUrl
                                    }
                                    alt="Logo Preview"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  />
                                ) : (
                                  <Handshake className="w-8 h-8 text-muted-foreground/40" />
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id="logo-upload"
                                  onChange={(e) =>
                                    handleFileChange(e, "logoUrl")
                                  }
                                  disabled={isUploadingFile}
                                />
                                <label
                                  htmlFor="logo-upload"
                                  className={cn(
                                    "cursor-pointer flex items-center justify-center h-12 px-6 border-2 border-eco-blue/20 border-dashed rounded-2xl text-sm font-bold hover:bg-eco-blue/5 hover:border-eco-blue/40 transition-all",
                                    isUploadingFile &&
                                      "opacity-50 cursor-not-allowed",
                                  )}
                                >
                                  {isUploadingFile ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 mr-2 text-eco-blue" />
                                  )}
                                  Chọn ảnh Logo mới
                                </label>
                                <p className="text-[10px] text-muted-foreground italic px-1">
                                  Định dạng hỗ trợ: JPG, PNG, WEBP. Tối đa 5MB.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* License */}
                          <div className="space-y-3">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                              Giấy phép hoạt động (PNG/JPG)
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-eco-blue/20 overflow-hidden flex items-center justify-center bg-muted/20 shrink-0 shadow-inner group transition-all hover:border-eco-blue/40">
                                {localPreviews.licenseUrl ||
                                formData.licenseUrl ? (
                                  <img
                                    src={
                                      localPreviews.licenseUrl ||
                                      formData.licenseUrl
                                    }
                                    alt="License Preview"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  />
                                ) : (
                                  <FileText className="w-8 h-8 text-muted-foreground/40" />
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id="license-upload"
                                  onChange={(e) =>
                                    handleFileChange(e, "licenseUrl")
                                  }
                                  disabled={isUploadingFile}
                                />
                                <label
                                  htmlFor="license-upload"
                                  className={cn(
                                    "cursor-pointer flex items-center justify-center h-12 px-6 border-2 border-eco-blue/20 border-dashed rounded-2xl text-sm font-bold hover:bg-eco-blue/5 hover:border-eco-blue/40 transition-all",
                                    isUploadingFile &&
                                      "opacity-50 cursor-not-allowed",
                                  )}
                                >
                                  {isUploadingFile ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" />
                                  )}
                                  Cập nhật tài liệu giấy phép
                                </label>
                                {formData.licenseUrl && (
                                  <div className="flex items-center gap-2 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-eco-blue" />
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                      Đã có tài liệu hợp lệ
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase">
                          Giới thiệu về tổ chức
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={6}
                          placeholder="Mô tả tóm tắt về sứ mệnh, hoạt động và thành tựu của tổ chức..."
                          className="w-full bg-muted/30 border-2 border-border/50 rounded-[2rem] px-6 py-4 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
