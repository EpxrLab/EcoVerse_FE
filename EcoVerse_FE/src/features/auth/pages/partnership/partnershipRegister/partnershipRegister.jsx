import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Input,
  Select,
  Button,
  Card,
  Steps,
  message,
  notification,
} from "antd";
import {
  TeamOutlined,
  BuildOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
// Lucide icons — giống SchoolRegister
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import {
  getProvinces,
  getWards,
  partnershipRegister,
  uploadFile,
} from "../../../services";

const { TextArea } = Input;
const { Step } = Steps;

// ─── BE enum values ───────────────────────────────────────────────────────────
const PARTNERSHIP_TYPES = [
  { value: "NGO", label: "Tổ chức phi chính phủ (NGO)" },
  { value: "WARD_GOVERNMENT", label: "Chính quyền phường" },
  { value: "PUBLIC_ORGANIZATION", label: "Tổ chức công cộng" },
  { value: "COMMUNE_GOVERNMENT", label: "Chính quyền cộng đồng" },
  { value: "YOUTH_UNION", label: "Đoàn Thanh Niên" },
  { value: "OTHER", label: "Khác" },
];

export default function PartnershipRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoFile, setLogoFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [vnProvinces, setVnProvinces] = useState([]);
  const [vnWards, setVnWards] = useState([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  // ── formData — đúng BE schema ────────────────────────────────────────────
  const [formData, setFormData] = useState({
    organizationName: "",
    contactEmail: sessionStorage.getItem("mail") || "",
    phoneNumber: "",
    province: "",
    ward: "",
    streetAddress: "",
    contactPerson: "",
    position: "",
    taxCode: "",
    linkWeb: "",
    description: "",
    partnershipType: "OTHER",
    logoUrl: "",
    licenseUrl: "",
    password: sessionStorage.getItem("pass") || "",
    otp: sessionStorage.getItem("otpCode") || "",
  });

  const [errors, setErrors] = useState({});

  // ── Fetch divisions ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const [provinces, wards] = await Promise.all([
          getProvinces(),
          getWards(),
        ]);
        setVnProvinces(provinces);
        setVnWards(wards);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (provinceCode) setWardCode("");
  }, [provinceCode]);

  useEffect(() => {
    const provinceName =
      vnProvinces.find((p) => p.code === provinceCode)?.name || "";
    const wardName = provinceCode
      ? vnWards
          .filter((w) => w.province_code === provinceCode)
          .find((w) => w.code === wardCode)?.name || ""
      : "";
    setFormData((prev) => ({
      ...prev,
      province: provinceName,
      ward: wardName,
    }));
  }, [provinceCode, wardCode, vnProvinces, vnWards]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Upload handlers — giống SchoolRegister (native input + uploadFile) ────
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notification.error({
        message: "File quá lớn",
        description: "Logo không được vượt quá 5MB",
      });
      return;
    }
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await uploadFile(data);
      if (res) {
        message.success("Logo tải lên thành công!");
        setFormData((prev) => ({ ...prev, logoUrl: res.data.url }));
      } else {
        message.error("Logo tải lên thất bại!");
      }
    } catch (error) {
      console.error(error);
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLicenseChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      notification.error({
        message: "File quá lớn",
        description: "Giấy phép không được vượt quá 10MB",
      });
      return;
    }
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await uploadFile(data);
      if (res) {
        message.success("Giấy phép tải lên thành công!");
        setFormData((prev) => ({ ...prev, licenseUrl: res.data.url }));
      } else {
        message.error("Giấy phép tải lên thất bại!");
      }
    } catch (error) {
      console.error(error);
    }
    setLicenseFile(file);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (
      !formData.organizationName.trim() ||
      formData.organizationName.trim().length < 3
    )
      e.organizationName = "Tên tổ chức phải có ít nhất 3 ký tự";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim()))
      e.contactEmail = "Email không hợp lệ";
    if (!formData.phoneNumber.trim() || formData.phoneNumber.trim().length < 10)
      e.phoneNumber = "Số điện thoại không hợp lệ";
    if (!provinceCode) e.province = "Vui lòng chọn Tỉnh/Thành phố";
    if (!wardCode) e.ward = "Vui lòng chọn Phường/Xã";
    if (
      !formData.streetAddress.trim() ||
      formData.streetAddress.trim().length < 5
    )
      e.streetAddress = "Địa chỉ phải có ít nhất 5 ký tự";
    if (
      !formData.contactPerson.trim() ||
      formData.contactPerson.trim().length < 2
    )
      e.contactPerson = "Tên người liên hệ phải có ít nhất 2 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await partnershipRegister(formData);
      if (res) {
        notification.success({
          message: "Đăng ký thành công!",
          description: "Đơn đăng ký đang chờ Admin duyệt.",
        });
        navigate("/auth/partnership/pending");
        sessionStorage.clear();
      } else {
        notification.error({
          message: "Lỗi",
          description: "Đã xảy ra lỗi khi đăng ký, vui lòng thử lại!",
        });
      }
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: err?.message || "Đã xảy ra lỗi khi đăng ký",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const wardOptions = provinceCode
    ? vnWards
        .filter((w) => w.province_code === provinceCode)
        .map((w) => ({ value: w.code, label: w.name }))
    : [];

  const fullAddressPreview = [
    formData.streetAddress,
    formData.ward,
    formData.province,
  ]
    .filter(Boolean)
    .join(", ");

  // Shared input className — giống SchoolRegister
  const cls =
    "rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4 shadow-md">
            <TeamOutlined className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Đăng ký Đối tác
          </h1>
          <p className="text-gray-500 mt-2">
            Điền đầy đủ thông tin để trở thành đối tác của EcoVerse
          </p>
        </motion.div>

        {/* Progress — giống SchoolRegister */}
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
                className={`flex items-center gap-2 ${currentStep + 1 >= num ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${currentStep + 1 >= num ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-400"}`}
                >
                  {currentStep + 1 > num ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    num
                  )}
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
            {currentStep === 0 && (
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
                      <BuildOutlined className="text-blue-500 text-lg" />
                      <h2 className="text-lg font-bold text-gray-800">
                        Thông tin cơ bản
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500 -mt-3">
                      Nhập thông tin cơ bản về tổ chức của bạn
                    </p>

                    {/* organizationName */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Tên tổ chức/công ty{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="organizationName"
                        placeholder="VD: Đoàn Thanh Niên Quận 1"
                        value={formData.organizationName}
                        className={cls}
                        size="large"
                        onChange={(e) =>
                          handleChange("organizationName", e.target.value)
                        }
                        status={errors.organizationName ? "error" : ""}
                        prefix={<BuildOutlined className="text-gray-400" />}
                      />
                      {errors.organizationName && (
                        <p className="text-xs text-red-500">
                          {errors.organizationName}
                        </p>
                      )}
                    </div>

                    {/* contactEmail + phoneNumber */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Email liên hệ <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="contactEmail"
                          type="email"
                          placeholder="partner@example.com"
                          value={formData.contactEmail}
                          className={cls}
                          size="large"
                          disabled
                          onChange={(e) =>
                            handleChange("contactEmail", e.target.value)
                          }
                          prefix={<MailOutlined className="text-gray-400" />}
                        />
                        {errors.contactEmail && (
                          <p className="text-xs text-red-500">
                            {errors.contactEmail}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="phoneNumber"
                          placeholder="0901234567"
                          value={formData.phoneNumber}
                          className={cls}
                          size="large"
                          onChange={(e) =>
                            handleChange("phoneNumber", e.target.value)
                          }
                          prefix={<PhoneOutlined className="text-gray-400" />}
                          status={errors.phoneNumber ? "error" : ""}
                        />
                        {errors.phoneNumber && (
                          <p className="text-xs text-red-500">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Địa chỉ 2 cấp */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-blue-500" />
                        <label className="text-sm font-bold text-gray-700">
                          Địa chỉ tổ chức{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-600">
                        <span className="text-sm mt-0.5">ℹ️</span>
                        <span>
                          Theo cơ cấu hành chính mới sau sáp nhập, địa chỉ gồm{" "}
                          <strong>Tỉnh/Thành phố</strong> và{" "}
                          <strong>Phường/Xã</strong> — không còn cấp Quận/Huyện.
                        </span>
                      </div>

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
                            value={provinceCode || undefined}
                            onChange={(v) => setProvinceCode(v)}
                            options={vnProvinces.map((p) => ({
                              value: p.code,
                              label: p.name,
                            }))}
                            showSearch
                            filterOption={(input, opt) =>
                              opt.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            status={errors.province ? "error" : ""}
                          />
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
                              provinceCode
                                ? "Chọn phường/xã"
                                : "Chọn tỉnh/thành phố trước"
                            }
                            value={wardCode || undefined}
                            onChange={(v) => setWardCode(v)}
                            options={
                              wardOptions.length > 0
                                ? wardOptions
                                : provinceCode
                                  ? [
                                      {
                                        value: "_other",
                                        label:
                                          "Khác (nhập trong địa chỉ cụ thể)",
                                      },
                                    ]
                                  : []
                            }
                            disabled={!provinceCode}
                            showSearch
                            filterOption={(input, opt) =>
                              opt.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            status={errors.ward ? "error" : ""}
                          />
                          {errors.ward && (
                            <p className="text-xs text-red-500">
                              {errors.ward}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* streetAddress */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">
                          Số nhà, tên đường
                        </label>
                        <Input
                          name="streetAddress"
                          placeholder="VD: 456 Nguyễn Huệ"
                          value={formData.streetAddress}
                          className={cls}
                          size="large"
                          onChange={(e) =>
                            handleChange("streetAddress", e.target.value)
                          }
                          prefix={
                            <EnvironmentOutlined className="text-gray-300" />
                          }
                          status={errors.streetAddress ? "error" : ""}
                        />
                        {errors.streetAddress && (
                          <p className="text-xs text-red-500">
                            {errors.streetAddress}
                          </p>
                        )}
                      </div>

                      {/* Address preview */}
                      {(formData.streetAddress ||
                        formData.ward ||
                        formData.province) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm"
                        >
                          <span className="text-gray-500">
                            Địa chỉ đầy đủ:{" "}
                          </span>
                          <span className="font-medium text-gray-700">
                            {fullAddressPreview || "Đang nhập..."}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* contactPerson + position */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Người liên hệ <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="contactPerson"
                          placeholder="Họ và tên"
                          value={formData.contactPerson}
                          className={cls}
                          size="large"
                          onChange={(e) =>
                            handleChange("contactPerson", e.target.value)
                          }
                          prefix={<UserOutlined className="text-gray-400" />}
                          status={errors.contactPerson ? "error" : ""}
                        />
                        {errors.contactPerson && (
                          <p className="text-xs text-red-500">
                            {errors.contactPerson}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Chức vụ
                        </label>
                        <Input
                          name="position"
                          placeholder="VD: Trưởng phòng"
                          value={formData.position}
                          className={cls}
                          size="large"
                          onChange={(e) =>
                            handleChange("position", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-md"
                      >
                        Tiếp tục →
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── Step 2 ── */}
            {currentStep === 1 && (
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
                      <FileTextOutlined className="text-blue-500 text-lg" />
                      <h2 className="text-lg font-bold text-gray-800">
                        Chi tiết & Tài liệu
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500 -mt-3">
                      Thông tin bổ sung và tài liệu đính kèm
                    </p>

                    {/* partnershipType + taxCode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Lĩnh vực <span className="text-red-500">*</span>
                        </label>
                        <Select
                          size="large"
                          className="w-full"
                          value={formData.partnershipType}
                          onChange={(v) => handleChange("partnershipType", v)}
                          options={PARTNERSHIP_TYPES.map((t) => ({
                            value: t.value,
                            label: t.label,
                          }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Mã số thuế
                        </label>
                        <Input
                          name="taxCode"
                          placeholder="VD: 0312345679"
                          value={formData.taxCode}
                          className={cls}
                          size="large"
                          onChange={(e) =>
                            handleChange("taxCode", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* linkWeb */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Website
                      </label>
                      <Input
                        name="linkWeb"
                        placeholder="https://partner.org.vn"
                        value={formData.linkWeb}
                        className={cls}
                        size="large"
                        onChange={(e) =>
                          handleChange("linkWeb", e.target.value)
                        }
                        prefix={<GlobalOutlined className="text-gray-400" />}
                      />
                    </div>

                    {/* description */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Mô tả về tổ chức
                      </label>
                      <TextArea
                        name="description"
                        placeholder="Giới thiệu ngắn về tổ chức/công ty..."
                        value={formData.description}
                        rows={4}
                        className={cls}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                      />
                    </div>

                    {/* ── Upload — giống hệt SchoolRegister ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Logo */}
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Logo tổ chức
                        </label>
                        <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-blue-400 transition-colors">
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

                      {/* License */}
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Giấy phép kinh doanh
                        </label>
                        <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-blue-400 transition-colors">
                          {licenseFile ? (
                            <div className="space-y-2">
                              <FileText className="w-8 h-8 mx-auto text-blue-500" />
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
                        onClick={() => setCurrentStep(0)}
                        className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
                      >
                        ← Quay lại
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.97 }}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="w-4 h-4 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
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
            onClick={() => navigate("/auth/partnership")}
            className="hover:text-blue-600 transition-colors underline underline-offset-2"
          >
            Đăng xuất
          </button>
        </p>
      </div>
    </div>
  );
}
