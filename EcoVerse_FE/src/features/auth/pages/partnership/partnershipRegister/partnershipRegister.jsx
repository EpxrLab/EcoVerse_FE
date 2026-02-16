import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Select, Button, Card, Steps, Upload, message } from "antd";
import {
  TeamOutlined,
  BuildOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  FileTextOutlined,
  UploadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { z } from "zod";
import {
  VIETNAM_PROVINCES,
  VIETNAM_DISTRICTS,
  VIETNAM_WARDS,
} from "./data/vietnam-divisions";

const { TextArea } = Input;
const { Step } = Steps;

const PARTNERSHIP_TYPES = [
  { value: "sponsor", label: "Nhà tài trợ" },
  { value: "ngo", label: "Tổ chức phi chính phủ (NGO)" },
  { value: "media", label: "Truyền thông" },
  { value: "technology", label: "Công nghệ" },
  { value: "education", label: "Giáo dục" },
  { value: "other", label: "Khác" },
];

const registrationSchema = z.object({
  organization_name: z
    .string()
    .trim()
    .min(3, { message: "Tên tổ chức phải có ít nhất 3 ký tự" })
    .max(200),
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Số điện thoại không hợp lệ" })
    .max(15),
  address: z
    .string()
    .trim()
    .min(5, { message: "Địa chỉ không hợp lệ" })
    .max(500),
  representative_name: z
    .string()
    .trim()
    .min(2, { message: "Tên người đại diện phải có ít nhất 2 ký tự" })
    .max(100),
  representative_position: z.string().optional(),
  partnership_type: z.enum([
    "sponsor",
    "ngo",
    "media",
    "technology",
    "education",
    "other",
  ]),
  website: z.string().url().optional().or(z.literal("")),
  tax_code: z.string().optional(),
  description: z.string().max(1000).optional(),
  collaboration_proposal: z.string().max(2000).optional(),
});

export default function PartnershipRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoFile, setLogoFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Location state
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  const [formData, setFormData] = useState({
    organization_name: "",
    email: "",
    phone: "",
    address: "",
    representative_name: "",
    representative_position: "",
    partnership_type: "other",
    website: "",
    tax_code: "",
    description: "",
    collaboration_proposal: "",
  });

  const [errors, setErrors] = useState({});

  // Reset district/ward on province change
  useEffect(() => {
    if (province) {
      setDistrict("");
      setWard("");
    }
  }, [province]);
  useEffect(() => {
    if (district) setWard("");
  }, [district]);

  // Build full address
  useEffect(() => {
    const pName =
      VIETNAM_PROVINCES.find((p) => p.code === province)?.name || "";
    const dName = province
      ? VIETNAM_DISTRICTS[province]?.find((d) => d.code === district)?.name ||
        ""
      : "";
    const wName = district
      ? VIETNAM_WARDS[district]?.find((w) => w.code === ward)?.name || ""
      : "";
    const parts = [streetAddress, wName, dName, pName].filter((s) => s.trim());
    setFormData((prev) => ({ ...prev, address: parts.join(", ") }));
  }, [province, district, ward, streetAddress]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogoChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file.size > 5 * 1024 * 1024) {
      message.error("Logo không được vượt quá 5MB");
      return false;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
    return false;
  };

  const handleLicenseChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file.size > 10 * 1024 * 1024) {
      message.error("Giấy phép không được vượt quá 10MB");
      return false;
    }
    setLicenseFile(file);
    return false;
  };

  const validateStep1 = () => {
    const errs = {};
    if (
      !formData.organization_name.trim() ||
      formData.organization_name.trim().length < 3
    )
      errs.organization_name = "Tên tổ chức phải có ít nhất 3 ký tự";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      errs.email = "Email không hợp lệ";
    if (!formData.phone.trim() || formData.phone.trim().length < 10)
      errs.phone = "Số điện thoại không hợp lệ";
    if (!province) errs.province = "Vui lòng chọn Tỉnh/Thành phố";
    if (!district) errs.district = "Vui lòng chọn Quận/Huyện";
    if (!streetAddress.trim())
      errs.streetAddress = "Vui lòng nhập số nhà, tên đường";
    if (
      !formData.representative_name.trim() ||
      formData.representative_name.trim().length < 2
    )
      errs.representative_name = "Tên người đại diện phải có ít nhất 2 ký tự";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setCurrentStep(1);
  };

  const handleSubmit = async () => {
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const fe = {};
      result.error.errors.forEach((e) => {
        fe[e.path[0]] = e.message;
      });
      setErrors(fe);
      result.error.errors.forEach((e) => message.error(e.message));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 2000));
      message.success(
        "Đăng ký thành công! Đơn đăng ký của bạn đang chờ Admin duyệt.",
      );
      navigate("/partnership/pending");
    } catch (err) {
      message.error(err.message || "Đã xảy ra lỗi khi đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  const provinceOptions = VIETNAM_PROVINCES.map((p) => ({
    value: p.code,
    label: p.name,
  }));
  const districtOptions = province
    ? (VIETNAM_DISTRICTS[province] || []).map((d) => ({
        value: d.code,
        label: d.name,
      }))
    : [];
  const wardOptions = district
    ? (VIETNAM_WARDS[district] || []).map((w) => ({
        value: w.code,
        label: w.name,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <motion.div
        className="max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4">
            <TeamOutlined className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Đăng ký Đối tác</h1>
          <p className="text-gray-600 mt-2">
            Điền đầy đủ thông tin để trở thành đối tác của EcoVerse
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <Steps current={currentStep} className="px-4">
            <Step
              title="Thông tin cơ bản"
              icon={
                currentStep > 0 ? <CheckCircleOutlined /> : <BuildOutlined />
              }
            />
            <Step
              title="Chi tiết & Tài liệu"
              icon={
                currentStep > 1 ? <CheckCircleOutlined /> : <FileTextOutlined />
              }
            />
          </Steps>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Step 1 ── */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card
                className="shadow-lg"
                title={
                  <div className="flex items-center gap-2">
                    <BuildOutlined className="text-blue-600" />
                    <span>Thông tin cơ bản</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Org name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tên tổ chức/công ty *
                    </label>
                    <Input
                      prefix={<BuildOutlined className="text-gray-400" />}
                      placeholder="VD: Công ty TNHH ABC"
                      size="large"
                      value={formData.organization_name}
                      onChange={(e) =>
                        handleChange("organization_name", e.target.value)
                      }
                      status={errors.organization_name ? "error" : ""}
                    />
                    {errors.organization_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.organization_name}
                      </p>
                    )}
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email liên hệ *
                      </label>
                      <Input
                        prefix={<MailOutlined className="text-gray-400" />}
                        type="email"
                        placeholder="contact@company.com"
                        size="large"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        status={errors.email ? "error" : ""}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số điện thoại *
                      </label>
                      <Input
                        prefix={<PhoneOutlined className="text-gray-400" />}
                        placeholder="0123 456 789"
                        size="large"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        status={errors.phone ? "error" : ""}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">
                      Địa chỉ *
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Tỉnh/Thành phố
                        </label>
                        <Select
                          className="w-full"
                          size="large"
                          placeholder="Chọn Tỉnh/Thành"
                          value={province || undefined}
                          onChange={(v) => setProvince(v)}
                          options={provinceOptions}
                          showSearch
                          filterOption={(input, opt) =>
                            opt.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          status={errors.province ? "error" : ""}
                        />
                        {errors.province && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.province}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Quận/Huyện
                        </label>
                        <Select
                          className="w-full"
                          size="large"
                          placeholder="Chọn Quận/Huyện"
                          value={district || undefined}
                          onChange={(v) => setDistrict(v)}
                          options={districtOptions}
                          disabled={!province}
                          showSearch
                          filterOption={(input, opt) =>
                            opt.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          status={errors.district ? "error" : ""}
                        />
                        {errors.district && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.district}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Phường/Xã (nếu có)
                        </label>
                        <Select
                          className="w-full"
                          size="large"
                          placeholder={
                            district && !wardOptions.length
                              ? "Không có dữ liệu"
                              : "Chọn Phường/Xã"
                          }
                          value={ward || undefined}
                          onChange={(v) => setWard(v)}
                          options={wardOptions}
                          disabled={!district || !wardOptions.length}
                          showSearch
                          filterOption={(input, opt) =>
                            opt.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Số nhà, tên đường
                      </label>
                      <Input
                        prefix={
                          <EnvironmentOutlined className="text-gray-400" />
                        }
                        placeholder="VD: 123 Đường Nguyễn Huệ"
                        size="large"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        status={errors.streetAddress ? "error" : ""}
                      />
                      {errors.streetAddress && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.streetAddress}
                        </p>
                      )}
                    </div>

                    {formData.address && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs text-blue-500 mb-1">
                          Địa chỉ đầy đủ:
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {formData.address}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Representative */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Người đại diện *
                      </label>
                      <Input
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder="Họ và tên"
                        size="large"
                        value={formData.representative_name}
                        onChange={(e) =>
                          handleChange("representative_name", e.target.value)
                        }
                        status={errors.representative_name ? "error" : ""}
                      />
                      {errors.representative_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.representative_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Chức vụ
                      </label>
                      <Input
                        placeholder="VD: Giám đốc"
                        size="large"
                        value={formData.representative_position}
                        onChange={(e) =>
                          handleChange(
                            "representative_position",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Step 2 ── */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card
                className="shadow-lg"
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-blue-600" />
                    <span>Chi tiết & Tài liệu</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Partnership type + Tax code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Lĩnh vực *
                      </label>
                      <Select
                        size="large"
                        className="w-full"
                        value={formData.partnership_type}
                        onChange={(v) => handleChange("partnership_type", v)}
                        options={PARTNERSHIP_TYPES.map((t) => ({
                          value: t.value,
                          label: t.label,
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mã số thuế
                      </label>
                      <Input
                        placeholder="VD: 0123456789"
                        size="large"
                        value={formData.tax_code}
                        onChange={(e) =>
                          handleChange("tax_code", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website
                    </label>
                    <Input
                      prefix={<GlobalOutlined className="text-gray-400" />}
                      placeholder="https://company.com"
                      size="large"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      status={errors.website ? "error" : ""}
                    />
                    {errors.website && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.website}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mô tả về tổ chức
                    </label>
                    <TextArea
                      placeholder="Giới thiệu ngắn về tổ chức/công ty..."
                      rows={4}
                      size="large"
                      maxLength={1000}
                      showCount
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                    />
                  </div>

                  {/* Collaboration proposal */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Đề xuất hợp tác
                    </label>
                    <TextArea
                      placeholder="Mô tả cách bạn muốn hợp tác với EcoVerse (tài trợ, đồng tổ chức sự kiện, hỗ trợ công nghệ, v.v.)"
                      rows={5}
                      size="large"
                      maxLength={2000}
                      showCount
                      value={formData.collaboration_proposal}
                      onChange={(e) =>
                        handleChange("collaboration_proposal", e.target.value)
                      }
                    />
                  </div>

                  {/* Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Logo tổ chức
                      </label>
                      <Upload
                        beforeUpload={handleLogoChange}
                        maxCount={1}
                        accept="image/*"
                        listType="picture-card"
                        showUploadList={false}
                      >
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <UploadOutlined className="text-2xl mb-2" />
                            <div className="text-xs text-gray-600">
                              Tải lên logo
                              <br />
                              (tối đa 5MB)
                            </div>
                          </div>
                        )}
                      </Upload>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Giấy phép kinh doanh
                      </label>
                      <Upload
                        beforeUpload={handleLicenseChange}
                        maxCount={1}
                        accept=".pdf,.jpg,.jpeg,.png"
                      >
                        <Button icon={<UploadOutlined />} size="large" block>
                          {licenseFile ? licenseFile.name : "Tải lên giấy phép"}
                        </Button>
                      </Upload>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button size="large" onClick={() => setCurrentStep(0)}>
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSubmit}
                      loading={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? "Đang gửi..." : "Gửi đăng ký"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          className="text-center text-sm text-gray-600 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => message.info("Đăng xuất thành công")}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Đăng xuất
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
