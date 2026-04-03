import { useEffect, useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  School,
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
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useProfile } from "../../hooks";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";



// ─── Constants & Mappings ──────────────────────────────────────────────────

const schoolTypeMap = {
  'PRIVATE': 'Tư thục',
  'PUBLIC': 'Công lập',
  'INTERNATIONAL': 'Quốc tế'
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SchoolProfile() {
  const navigate = useNavigate();
  const { 
    profile, 
    isLoading, 
    isUpdating, 
    isUploadingFile,
    provinces,
    wards,
    fetchProfile, 
    updateProfile,
    handleFileUpload 
  } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [localPreviews, setLocalPreviews] = useState({ logoUrl: null, licenseUrl: null });
  
  // Cleanup object URLs when component unmounts or editing is finished
  useEffect(() => {
    return () => {
      if (localPreviews.logoUrl) URL.revokeObjectURL(localPreviews.logoUrl);
      if (localPreviews.licenseUrl) URL.revokeObjectURL(localPreviews.licenseUrl);
    };
  }, [localPreviews]);

  const handleBack = () => {
    navigate("/school");
  };

  const startEditing = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData(null);
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
    setLocalPreviews(prev => ({ ...prev, [field]: previewUrl }));

    const url = await handleFileUpload(file);
    if (url) {
      setFormData((prev) => ({ ...prev, [field]: url }));
      toast.success(`Đã tải lên ${field === 'logoUrl' ? 'Logo' : 'Giấy phép'} thành công!`);
    } else {
      // If upload fails, revert local preview
      setLocalPreviews(prev => ({ ...prev, [field]: null }));
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async () => {
    const { success } = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-2xl border-2 border-eco-green/10">
          <div className="w-20 h-20 bg-eco-green/10 rounded-full flex items-center justify-center mx-auto text-eco-green animate-pulse">
            <School className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Không tải được thông tin</h2>
            <p className="text-muted-foreground">Chúng tôi không thể tìm thấy dữ liệu hồ sơ trường học vào lúc này.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => fetchProfile()} className="w-full bg-eco-green hover:bg-eco-green/90">
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Back Button */}
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
                <School className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ trường học"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEditing ? "Cập nhật thông tin chi tiết của trường" : "Thông tin chi tiết về trường"}
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
                    profile.approvalStatus === 'APPROVED' ? "bg-eco-green/10 text-eco-green border-eco-green/20" : "bg-amber-100 text-amber-600 border-amber-200"
                  )}
                >
                  Trạng thái: {profile.approvalStatus === 'APPROVED' ? 'Đã duyệt' : profile.approvalStatus}
                </Badge>
                <Button onClick={startEditing} className="bg-eco-green hover:bg-eco-green/90 rounded-xl gap-2 shadow-lg shadow-eco-green/20">                
                  Chỉnh sửa
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={cancelEditing} className="rounded-xl" disabled={isUpdating || isUploadingFile}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit} className="bg-eco-green hover:bg-eco-green/90 rounded-xl gap-2 shadow-lg shadow-eco-green/20" disabled={isUpdating || isUploadingFile}>
                  {isUpdating || isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Lưu thay đổi
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-eco-green/15 overflow-hidden rounded-3xl bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative p-6 md:p-10">
                {/* Decorative Graphics */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-eco-green/15 to-transparent rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-eco-blue/15 to-transparent rounded-full blur-3xl -z-10" />

                {!isEditing ? (
                  /* Viewing Mode Rendering */
                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-8">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative group">
                          <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-eco-green to-eco-blue p-1.5 shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
                            <div className="w-full h-full rounded-[2.2rem] bg-card border-4 border-white overflow-hidden flex items-center justify-center">
                              {profile.logoPresignedUrl || profile.logoUrl ? (
                                <img src={profile.logoPresignedUrl || profile.logoUrl} alt="School Logo" className="w-full h-full object-cover" />
                              ) : (
                                <School className="w-16 h-16 text-eco-green" />
                              )}
                            </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white shadow-xl border-2 border-eco-green/20 flex items-center justify-center">
                             <ShieldCheck className="w-6 h-6 text-eco-green" />
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                          <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                              {profile.schoolName}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                              <div className="flex items-center gap-2 bg-eco-green/8 text-eco-green px-4 py-1.5 rounded-full border border-eco-green/15 text-sm font-bold">
                                <Building2 className="w-4 h-4" />
                                Loại: {schoolTypeMap[profile.schoolType] || profile.schoolType}
                              </div>
                              <div className="flex items-center gap-2 bg-eco-blue/8 text-eco-blue px-4 py-1.5 rounded-full border border-eco-blue/15 text-sm font-bold">
                                <Tag className="w-4 h-4" />
                                Mã số thuế: {profile.taxCode}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-muted-foreground pt-4">
                            <div className="flex items-start gap-3">
                               <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-primary" /></div>
                               <div className="flex flex-col">
                                 <span className="font-bold text-foreground">Địa chỉ</span>
                                 <span>{profile.address}, {profile.ward}, {profile.province}</span>
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-primary" /></div>
                               <div className="flex flex-col">
                                 <span className="font-bold text-foreground">Số điện thoại</span>
                                 <span>{profile.phoneNumber}</span>
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 text-primary" /></div>
                               <div className="flex flex-col">
                                 <span className="font-bold text-foreground">Email liên hệ</span>
                                 <span>{profile.contactEmail}</span>
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><Globe className="w-4 h-4 text-primary" /></div>
                               <div className="flex flex-col">
                                 <span className="font-bold text-foreground">Website</span>
                                 <a href={profile.linkWeb?.startsWith('http') ? profile.linkWeb : `https://${profile.linkWeb}`} target="_blank" rel="noopener noreferrer" className="hover:text-eco-green underline decoration-eco-green/30 decoration-2 underline-offset-4">
                                  {profile.linkWeb}
                                 </a>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="border-border/50 bg-background/50 rounded-2xl overflow-hidden shadow-sm">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hiệu trưởng / Đại diện</p>
                                <p className="text-lg font-bold text-foreground">{profile.principalName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                              <ShieldCheck className="w-4 h-4 text-eco-green" />
                              <span>Chức vụ: {profile.position}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-background/50 rounded-2xl overflow-hidden shadow-sm">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center text-eco-blue">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Giấy phép thành lập</p>
                                <p className="text-sm font-medium text-foreground truncate max-w-[200px]">Link giấy phép</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-xl" asChild>
                              <a href={profile.licensePresignedUrl || profile.licenseUrl} target="_blank" rel="noopener noreferrer">Xem tài liệu</a>
                            </Button>
                          </CardContent>
                        </Card>

                         <Card className="lg:col-span-3 border-border/50 bg-background/50 rounded-2xl overflow-hidden shadow-sm">
                          <CardContent className="p-6 space-y-2">
                             <h3 className="font-bold text-foreground flex items-center gap-2 underline decoration-primary/20 decoration-4 underline-offset-4">
                               <Sparkles className="w-4 h-4 text-primary" />
                               Giới thiệu về trường
                             </h3>
                             <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                               {profile.description || "Chưa có thông tin giới thiệu."}
                             </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Editing Mode Rendering */
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {/* Basic Info */}
                       <div className="space-y-6">
                         <h3 className="text-lg font-bold text-eco-green flex items-center gap-2 border-b-2 border-eco-green/10 pb-2">
                           <Building2 className="w-5 h-5" /> Thông tin cơ bản
                         </h3>
                         <div className="grid gap-5">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">Tên trường</label>
                              <input 
                                name="schoolName" 
                                value={formData.schoolName} 
                                onChange={handleInputChange} 
                                placeholder="Nhập tên trường..."
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-eco-green focus:bg-background outline-none transition-all shadow-inner" 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground uppercase">Loại trường</label>
                                <select 
                                  name="schoolType" 
                                  value={formData.schoolType} 
                                  onChange={handleInputChange} 
                                  className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-4 py-3 focus:border-eco-green focus:bg-background outline-none transition-all shadow-inner font-medium"
                                >
                                  <option value="PUBLIC">Công lập</option>
                                  <option value="PRIVATE">Tư thục</option>
                                  <option value="INTERNATIONAL">Quốc tế</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground uppercase">Mã số thuế</label>
                                <input 
                                  name="taxCode" 
                                  value={formData.taxCode} 
                                  onChange={handleInputChange} 
                                  placeholder="Nhập mã số thuế..."
                                  className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-eco-green focus:bg-background outline-none transition-all shadow-inner" 
                                />
                              </div>
                            </div>
                         </div>
                       </div>

                       {/* Contact Info */}
                       <div className="space-y-6">
                         <h3 className="text-lg font-bold text-eco-blue flex items-center gap-2 border-b-2 border-eco-blue/10 pb-2">
                           <Phone className="w-5 h-5" /> Liên hệ & Website
                         </h3>
                         <div className="grid gap-5">
                            <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground uppercase">Số điện thoại</label>
                                <input 
                                  name="phoneNumber" 
                                  value={formData.phoneNumber} 
                                  onChange={handleInputChange} 
                                  placeholder="Nhập số điện thoại..."
                                  className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner" 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground uppercase">Email</label>
                                <input 
                                  name="contactEmail" 
                                  disabled
                                  value={formData.contactEmail} 
                                  onChange={handleInputChange} 
                                  placeholder="Nhập email liên hệ..."
                                  className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner" 
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">Website (LinkWeb)</label>
                              <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input 
                                  name="linkWeb" 
                                  value={formData.linkWeb} 
                                  onChange={handleInputChange} 
                                  placeholder="www.example.edu.vn"
                                  className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl pl-11 pr-5 py-3 focus:border-eco-blue focus:bg-background outline-none transition-all shadow-inner" 
                                />
                              </div>
                            </div>
                         </div>
                       </div>

                       {/* Address Info */}
                       <div className="space-y-6 md:col-span-2">
                         <h3 className="text-lg font-bold text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                           <MapPin className="w-5 h-5" /> Địa chỉ chi tiết
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">Số nhà / Tên đường</label>
                              <input 
                                name="address" 
                                value={formData.address} 
                                onChange={handleInputChange} 
                                placeholder="VD: 123 Võ Văn Ngân"
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-primary focus:bg-background outline-none transition-all shadow-inner" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">Tỉnh / Thành phố</label>
                              <select 
                                name="province" 
                                value={formData.province} 
                                onChange={handleInputChange} 
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-4 py-3 focus:border-primary focus:bg-background outline-none transition-all shadow-inner font-medium"
                              >
                                <option value="">Chọn Tỉnh / Thành phố</option>
                                {provinces.map((p) => (
                                  <option key={p.code} value={p.name}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">Phường / Xã</label>
                              <select 
                                name="ward" 
                                value={formData.ward} 
                                onChange={handleInputChange} 
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-4 py-3 focus:border-primary focus:bg-background outline-none transition-all shadow-inner font-medium"
                              >
                                <option value="">Chọn Phường / Xã</option>
                                {wards.map((w) => (
                                  <option key={w.code} value={w.name}>{w.name}</option>
                                ))}
                              </select>
                            </div>
                         </div>
                       </div>

                       {/* Representative Info */}
                       <div className="space-y-6">
                         <h3 className="text-lg font-bold text-orange-500 flex items-center gap-2 border-b-2 border-orange-500/10 pb-2">
                           <User className="w-5 h-5" /> Đại diện trường
                         </h3>
                         <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">Họ và tên</label>
                              <input 
                                name="principalName" 
                                value={formData.principalName} 
                                onChange={handleInputChange} 
                                placeholder="Nhập tên đại diện..."
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-orange-500 focus:bg-background outline-none transition-all shadow-inner font-bold" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-muted-foreground uppercase">Chức vụ</label>
                              <input 
                                name="position" 
                                value={formData.position} 
                                onChange={handleInputChange} 
                                placeholder="VD: Hiệu trưởng"
                                className="w-full bg-muted/30 border-2 border-border/50 rounded-2xl px-5 py-3 focus:border-orange-500 focus:bg-background outline-none transition-all shadow-inner font-bold" 
                              />
                            </div>
                         </div>
                       </div>

                       {/* Media URLs */}
                       <div className="space-y-6">
                         <h3 className="text-lg font-bold text-purple-500 flex items-center gap-2 border-b-2 border-purple-500/10 pb-2">
                           <FileText className="w-5 h-5" /> Hình ảnh & Tài liệu
                         </h3>
                         <div className="grid gap-6">
                            {/* Logo Upload Block */}
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Logo trường</label>
                              <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-eco-green/20 overflow-hidden flex items-center justify-center bg-muted/20 shrink-0 shadow-inner group transition-all hover:border-eco-green/40">
                                  {localPreviews.logoUrl || profile.logoPresignedUrl || profile.logoUrl ? (
                                    <img src={localPreviews.logoUrl || profile.logoPresignedUrl || profile.logoUrl} alt="Logo Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                  ) : (
                                    <School className="w-8 h-8 text-muted-foreground/40" />
                                  )}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <input 
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="logo-upload"
                                    onChange={(e) => handleFileChange(e, 'logoUrl')}
                                    disabled={isUploadingFile}
                                  />
                                  <label 
                                    htmlFor="logo-upload"
                                    className={cn(
                                      "cursor-pointer flex items-center justify-center h-12 px-6 border-2 border-eco-green/20 border-dashed rounded-2xl text-sm font-bold hover:bg-eco-green/5 hover:border-eco-green/40 transition-all",
                                      isUploadingFile && "opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                    {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2 text-eco-green" />}
                                    Chọn ảnh Logo mới
                                  </label>
                                  <p className="text-[10px] text-muted-foreground italic px-1">Định dạng hỗ trợ: JPG, PNG, WEBP. Dung lượng tối đa 5MB.</p>
                                </div>
                              </div>
                            </div>

                            {/* License Upload Block */}
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Giấy phép thành lập (PNG/JPG)</label>
                              <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-eco-green/20 overflow-hidden flex items-center justify-center bg-muted/20 shrink-0 shadow-inner group transition-all hover:border-eco-green/40">
                                  {localPreviews.licenseUrl || profile.licensePresignedUrl ? (
                                    <img src={localPreviews.licenseUrl || profile.licensePresignedUrl} alt="License Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
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
                                    onChange={(e) => handleFileChange(e, 'licenseUrl')}
                                    disabled={isUploadingFile}
                                  />
                                  <label 
                                    htmlFor="license-upload"
                                    className={cn(
                                      "cursor-pointer flex items-center justify-center h-12 px-6 border-2 border-eco-green/20 border-dashed rounded-2xl text-sm font-bold hover:bg-eco-green/5 hover:border-eco-green/40 transition-all",
                                      isUploadingFile && "opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                    {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" />}
                                    Cập nhật tài liệu giấy phép
                                  </label>
                                  {formData.licenseUrl && (
                                    <div className="flex items-center gap-2 px-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-eco-green" />
                                      <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">Đã có tài liệu hợp lệ</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                         </div>
                       </div>

                       <div className="space-y-3 md:col-span-2">
                         <label className="text-sm font-bold text-muted-foreground uppercase">Giới thiệu về trường</label>
                         <textarea 
                           name="description" 
                           value={formData.description} 
                           onChange={handleInputChange} 
                           rows={6} 
                           placeholder="Mô tả tóm tắt về lịch sử, sứ mệnh và thành tựu của trường..."
                           className="w-full bg-muted/30 border-2 border-border/50 rounded-[2rem] px-6 py-4 focus:border-eco-green focus:bg-background outline-none transition-all shadow-inner resize-none leading-relaxed" 
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
