import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Input, Select, notification } from "antd";
import {
  Loader2,
  School,
  Upload,
  CheckCircle2,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
} from "lucide-react";

const { Option } = Select;
const { TextArea } = Input;

// ─── Dữ liệu địa chính sau sáp nhập — chỉ 2 cấp: Tỉnh/TP → Phường/Xã ────────
const PROVINCES = [
  { code: "HCM", name: "TP. Hồ Chí Minh" },
  { code: "HN", name: "Hà Nội" },
  { code: "DN", name: "Đà Nẵng" },
  { code: "HP", name: "Hải Phòng" },
  { code: "CT", name: "Cần Thơ" },
  { code: "BD", name: "Bình Dương" },
  { code: "DNG", name: "Đồng Nai" },
  { code: "LA", name: "Long An" },
  { code: "AG", name: "An Giang" },
  { code: "BR", name: "Bà Rịa - Vũng Tàu" },
  { code: "BG", name: "Bắc Giang" },
  { code: "BN", name: "Bắc Ninh" },
  { code: "BL", name: "Bạc Liêu" },
  { code: "BDH", name: "Bình Định" },
  { code: "BTH", name: "Bình Thuận" },
  { code: "BP", name: "Bình Phước" },
  { code: "CM", name: "Cà Mau" },
  { code: "CB", name: "Cao Bằng" },
  { code: "DL", name: "Đắk Lắk" },
  { code: "DKN", name: "Đắk Nông" },
  { code: "DB", name: "Điện Biên" },
  { code: "DT", name: "Đồng Tháp" },
  { code: "GL", name: "Gia Lai" },
  { code: "HG", name: "Hà Giang" },
  { code: "HNM", name: "Hà Nam" },
  { code: "HT", name: "Hà Tĩnh" },
  { code: "HD", name: "Hải Dương" },
  { code: "HBH", name: "Hòa Bình" },
  { code: "HU", name: "Huế" },
  { code: "HY", name: "Hưng Yên" },
  { code: "HGG", name: "Hậu Giang" },
  { code: "KH", name: "Khánh Hòa" },
  { code: "KG", name: "Kiên Giang" },
  { code: "KT", name: "Kon Tum" },
  { code: "LC", name: "Lai Châu" },
  { code: "LD", name: "Lâm Đồng" },
  { code: "LS", name: "Lạng Sơn" },
  { code: "LCA", name: "Lào Cai" },
  { code: "ND", name: "Nam Định" },
  { code: "NA", name: "Nghệ An" },
  { code: "NB", name: "Ninh Bình" },
  { code: "NT", name: "Ninh Thuận" },
  { code: "PT", name: "Phú Thọ" },
  { code: "PY", name: "Phú Yên" },
  { code: "QB", name: "Quảng Bình" },
  { code: "QN", name: "Quảng Nam" },
  { code: "QNG", name: "Quảng Ngãi" },
  { code: "QNH", name: "Quảng Ninh" },
  { code: "QT", name: "Quảng Trị" },
  { code: "ST", name: "Sóc Trăng" },
  { code: "SL", name: "Sơn La" },
  { code: "TN", name: "Tây Ninh" },
  { code: "TB", name: "Thái Bình" },
  { code: "TNG", name: "Thái Nguyên" },
  { code: "TH", name: "Thanh Hóa" },
  { code: "TG", name: "Tiền Giang" },
  { code: "TV", name: "Trà Vinh" },
  { code: "TQ", name: "Tuyên Quang" },
  { code: "VL", name: "Vĩnh Long" },
  { code: "VP", name: "Vĩnh Phúc" },
  { code: "YB", name: "Yên Bái" },
];

// Phường/Xã trực thuộc Tỉnh/TP (mẫu — bổ sung đầy đủ từ API địa chính)
const WARDS_BY_PROVINCE = {
  HCM: [
    { code: "BN", name: "Phường Bến Nghé" },
    { code: "BT", name: "Phường Bến Thành" },
    { code: "BT2", name: "Phường Bình Thạnh" },
    { code: "TB", name: "Phường Tân Bình" },
    { code: "TP", name: "Phường Tân Phú" },
    { code: "PN", name: "Phường Phú Nhuận" },
    { code: "GV", name: "Phường Gò Vấp" },
    { code: "TD", name: "Phường Thủ Đức" },
    { code: "BC", name: "Phường Bình Chánh" },
    { code: "HM", name: "Xã Hóc Môn" },
    { code: "CC", name: "Xã Củ Chi" },
    { code: "NB2", name: "Xã Nhà Bè" },
    { code: "CG", name: "Xã Cần Giờ" },
  ],
  HN: [
    { code: "HK", name: "Phường Hoàn Kiếm" },
    { code: "BDH", name: "Phường Ba Đình" },
    { code: "DD", name: "Phường Đống Đa" },
    { code: "HBT", name: "Phường Hai Bà Trưng" },
    { code: "HM", name: "Phường Hoàng Mai" },
    { code: "TX", name: "Phường Thanh Xuân" },
    { code: "CG", name: "Phường Cầu Giấy" },
    { code: "LB", name: "Phường Long Biên" },
    { code: "TL", name: "Phường Tây Hồ" },
    { code: "HD2", name: "Phường Hà Đông" },
    { code: "SS", name: "Xã Sóc Sơn" },
    { code: "DA", name: "Xã Đông Anh" },
    { code: "GL2", name: "Xã Gia Lâm" },
    { code: "TT", name: "Xã Thanh Trì" },
  ],
  DN: [
    { code: "HC", name: "Phường Hải Châu" },
    { code: "TK", name: "Phường Thanh Khê" },
    { code: "ST", name: "Phường Sơn Trà" },
    { code: "NK", name: "Phường Ngũ Hành Sơn" },
    { code: "LC", name: "Phường Liên Chiểu" },
    { code: "CM2", name: "Phường Cẩm Lệ" },
    { code: "HV", name: "Xã Hòa Vang" },
  ],
  HP: [
    { code: "HHB", name: "Phường Hồng Bàng" },
    { code: "LC", name: "Phường Lê Chân" },
    { code: "NQ", name: "Phường Ngô Quyền" },
    { code: "KA", name: "Phường Kiến An" },
    { code: "DK", name: "Phường Dương Kinh" },
    { code: "HA", name: "Phường Hải An" },
    { code: "TN2", name: "Xã Thủy Nguyên" },
    { code: "AD", name: "Xã An Dương" },
    { code: "VB", name: "Xã Vĩnh Bảo" },
    { code: "TL2", name: "Xã Tiên Lãng" },
    { code: "CH", name: "Xã Cát Hải" },
  ],
};

const validate = {
  required: (val, msg) => (!val || !String(val).trim() ? msg : ""),
  minLen: (val, len, msg) => (!val || val.trim().length < len ? msg : ""),
  email: (val) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? "Email không hợp lệ" : "",
  phone: (val) =>
    !val || val.trim().length < 10 ? "Số điện thoại không hợp lệ" : "",
};

export default function SchoolRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [logoFile, setLogoFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState({
    school_name: "",
    email: "",
    phone: "",
    province: "",
    ward: "",
    street_address: "",
    representative_name: "",
    representative_position: "",
    student_count: "",
    school_type: "public",
    website: "",
    tax_code: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const availableWards = formData.province
    ? WARDS_BY_PROVINCE[formData.province] || []
    : [];

  const buildFullAddress = () => {
    const parts = [];
    if (formData.street_address) parts.push(formData.street_address);
    if (formData.ward) {
      const w = availableWards.find((w) => w.code === formData.ward);
      if (w) parts.push(w.name);
    }
    if (formData.province) {
      const p = PROVINCES.find((p) => p.code === formData.province);
      if (p) parts.push(p.name);
    }
    return parts.join(", ");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field, value) => {
    if (field === "province") {
      setFormData((prev) => ({ ...prev, province: value, ward: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notification.error({
        message: "File quá lớn",
        description: "Logo không được vượt quá 5MB",
      });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLicenseChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      notification.error({
        message: "File quá lớn",
        description: "Giấy phép không được vượt quá 10MB",
      });
      return;
    }
    setLicenseFile(file);
  };

  const validateStep1 = () => {
    const e = {};
    e.school_name = validate.minLen(
      formData.school_name,
      3,
      "Tên trường phải có ít nhất 3 ký tự",
    );
    e.email = validate.email(formData.email);
    e.phone = validate.phone(formData.phone);
    e.province = validate.required(
      formData.province,
      "Vui lòng chọn tỉnh/thành phố",
    );
    e.ward = validate.required(formData.ward, "Vui lòng chọn phường/xã");
    e.street_address = validate.minLen(
      formData.street_address,
      5,
      "Địa chỉ phải có ít nhất 5 ký tự",
    );
    e.representative_name = validate.minLen(
      formData.representative_name,
      2,
      "Tên người đại diện phải có ít nhất 2 ký tự",
    );
    const filtered = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(filtered);
    return Object.keys(filtered).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      notification.success({
        message: "Đăng ký thành công!",
        description: "Đơn đăng ký đang chờ Admin duyệt.",
      });
      navigate("/auth/school/pending");
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: err?.message || "Đã xảy ra lỗi khi đăng ký",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cls =
    "rounded-xl border-gray-200 hover:border-green-400 focus:border-green-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4 shadow-md">
            <School className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Đăng ký Trường học
          </h1>
          <p className="text-gray-500 mt-2">
            Điền đầy đủ thông tin để đăng ký sử dụng EcoVerse
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {[
            { num: 1, label: "Thông tin cơ bản" },
            { num: 2, label: "Chi tiết & Tài liệu" },
          ].map(({ num, label }, i) => (
            <div key={num} className="flex items-center gap-2">
              {i > 0 && <div className="w-10 h-0.5 bg-gray-200" />}
              <div
                className={`flex items-center gap-2 ${step >= num ? "text-green-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step >= num ? "bg-green-500 text-white shadow-md" : "bg-gray-100 text-gray-400"}`}
                >
                  {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
                </div>
                <span className="font-medium text-sm hidden sm:block">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="rounded-3xl shadow-xl border-0"
                  bodyStyle={{ padding: "32px 28px" }}
                >
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-5 h-5 text-green-500" />
                      <h2 className="text-lg font-bold text-gray-800">
                        Thông tin cơ bản
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500 -mt-3">
                      Nhập thông tin cơ bản về trường học của bạn
                    </p>

                    {/* Tên trường */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Tên trường học <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="school_name"
                        placeholder="VD: Trường Tiểu học Nguyễn Du"
                        value={formData.school_name}
                        onChange={handleInputChange}
                        className={cls}
                        size="large"
                      />
                      {errors.school_name && (
                        <p className="text-xs text-red-500">
                          {errors.school_name}
                        </p>
                      )}
                    </div>

                    {/* Email & SĐT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Email liên hệ <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="contact@school.edu.vn"
                          value={formData.email}
                          onChange={handleInputChange}
                          prefix={<Mail className="w-4 h-4 text-gray-400" />}
                          className={cls}
                          size="large"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500">{errors.email}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="phone"
                          placeholder="0123 456 789"
                          value={formData.phone}
                          onChange={handleInputChange}
                          prefix={<Phone className="w-4 h-4 text-gray-400" />}
                          className={cls}
                          size="large"
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-500">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* ── Địa chỉ 2 cấp ── */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <label className="text-sm font-bold text-gray-700">
                          Địa chỉ trường học{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>

                      {/* Banner thông báo cơ cấu mới */}
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-600">
                        <span className="text-sm mt-0.5">ℹ️</span>
                        <span>
                          Theo cơ cấu hành chính mới sau sáp nhập, địa chỉ gồm{" "}
                          <strong>Tỉnh/Thành phố</strong> và{" "}
                          <strong>Phường/Xã</strong> — không còn cấp Quận/Huyện.
                        </span>
                      </div>

                      {/* Tỉnh/TP và Phường/Xã — 2 cột */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">
                            Tỉnh/Thành phố{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <Select
                            className="w-full"
                            size="large"
                            placeholder="Chọn tỉnh/thành phố"
                            value={formData.province || undefined}
                            onChange={(v) => handleSelectChange("province", v)}
                            showSearch
                            optionFilterProp="children"
                          >
                            {PROVINCES.map((p) => (
                              <Option key={p.code} value={p.code}>
                                {p.name}
                              </Option>
                            ))}
                          </Select>
                          {errors.province && (
                            <p className="text-xs text-red-500">
                              {errors.province}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">
                            Phường/Xã <span className="text-red-400">*</span>
                          </label>
                          <Select
                            className="w-full"
                            size="large"
                            placeholder={
                              formData.province
                                ? "Chọn phường/xã"
                                : "Chọn tỉnh/thành phố trước"
                            }
                            value={formData.ward || undefined}
                            onChange={(v) => handleSelectChange("ward", v)}
                            disabled={!formData.province}
                            showSearch
                            optionFilterProp="children"
                          >
                            {availableWards.length > 0
                              ? availableWards.map((w) => (
                                  <Option key={w.code} value={w.code}>
                                    {w.name}
                                  </Option>
                                ))
                              : formData.province && (
                                  <Option value="_other">
                                    Khác (nhập trong địa chỉ cụ thể)
                                  </Option>
                                )}
                          </Select>
                          {errors.ward && (
                            <p className="text-xs text-red-500">
                              {errors.ward}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Số nhà, tên đường — full width */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">
                          Số nhà, tên đường
                        </label>
                        <Input
                          name="street_address"
                          placeholder="VD: 123 Nguyễn Văn Linh"
                          value={formData.street_address}
                          onChange={handleInputChange}
                          prefix={<MapPin className="w-4 h-4 text-gray-300" />}
                          className={cls}
                          size="large"
                        />
                        {errors.street_address && (
                          <p className="text-xs text-red-500">
                            {errors.street_address}
                          </p>
                        )}
                      </div>

                      {/* Preview địa chỉ */}
                      {(formData.street_address ||
                        formData.ward ||
                        formData.province) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm"
                        >
                          <span className="text-gray-500">
                            Địa chỉ đầy đủ:{" "}
                          </span>
                          <span className="font-medium text-gray-700">
                            {buildFullAddress() || "Đang nhập..."}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Người đại diện */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Người đại diện <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="representative_name"
                          placeholder="Họ và tên"
                          value={formData.representative_name}
                          onChange={handleInputChange}
                          prefix={<User className="w-4 h-4 text-gray-400" />}
                          className={cls}
                          size="large"
                        />
                        {errors.representative_name && (
                          <p className="text-xs text-red-500">
                            {errors.representative_name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Chức vụ
                        </label>
                        <Input
                          name="representative_position"
                          placeholder="VD: Hiệu trưởng"
                          value={formData.representative_position}
                          onChange={handleInputChange}
                          className={cls}
                          size="large"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (validateStep1()) setStep(2);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-all shadow-md"
                      >
                        Tiếp tục →
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="rounded-3xl shadow-xl border-0"
                  bodyStyle={{ padding: "32px 28px" }}
                >
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-5 h-5 text-green-500" />
                      <h2 className="text-lg font-bold text-gray-800">
                        Chi tiết & Tài liệu
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500 -mt-3">
                      Thông tin bổ sung và tài liệu đính kèm
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Loại trường <span className="text-red-500">*</span>
                        </label>
                        <Select
                          className="w-full"
                          size="large"
                          value={formData.school_type}
                          onChange={(v) => handleSelectChange("school_type", v)}
                        >
                          <Option value="public">Công lập</Option>
                          <Option value="private">Tư thục</Option>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Số lượng học sinh
                        </label>
                        <Input
                          name="student_count"
                          type="number"
                          placeholder="VD: 500"
                          value={formData.student_count}
                          onChange={handleInputChange}
                          className={cls}
                          size="large"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Website
                        </label>
                        <Input
                          name="website"
                          placeholder="https://school.edu.vn"
                          value={formData.website}
                          onChange={handleInputChange}
                          prefix={<Globe className="w-4 h-4 text-gray-400" />}
                          className={cls}
                          size="large"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Mã số thuế
                        </label>
                        <Input
                          name="tax_code"
                          placeholder="VD: 0123456789"
                          value={formData.tax_code}
                          onChange={handleInputChange}
                          className={cls}
                          size="large"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Mô tả về trường
                      </label>
                      <TextArea
                        name="description"
                        placeholder="Giới thiệu ngắn về trường học..."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={cls}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Logo trường
                        </label>
                        <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-green-400 transition-colors">
                          {logoPreview ? (
                            <div className="space-y-2">
                              <img
                                src={logoPreview}
                                alt="Logo"
                                className="w-20 h-20 mx-auto object-contain rounded-xl"
                              />
                              <p className="text-xs text-gray-500 truncate">
                                {logoFile?.name}
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-400">
                                Tải lên logo
                              </p>
                              <p className="text-xs text-gray-300">
                                Tối đa 5MB
                              </p>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Giấy phép hoạt động
                        </label>
                        <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-green-400 transition-colors">
                          {licenseFile ? (
                            <div className="space-y-2">
                              <FileText className="w-8 h-8 mx-auto text-green-500" />
                              <p className="text-xs text-gray-500 truncate">
                                {licenseFile.name}
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-400">
                                Tải lên giấy phép
                              </p>
                              <p className="text-xs text-gray-300">
                                PDF, tối đa 10MB
                              </p>
                            </>
                          )}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleLicenseChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setStep(1)}
                        className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
                      >
                        ← Quay lại
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.97 }}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          "Gửi đăng ký"
                        )}
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          <button
            onClick={() => navigate("/auth/school")}
            className="hover:text-green-600 transition-colors underline underline-offset-2"
          >
            Đăng xuất
          </button>
        </p>
      </div>
    </div>
  );
}
