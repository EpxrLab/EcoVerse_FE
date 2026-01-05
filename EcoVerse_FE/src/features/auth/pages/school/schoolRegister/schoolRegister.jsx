import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Select, Button, Upload, Card, Steps, message } from "antd";
import {
  HomeOutlined,
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
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Step } = Steps;

const registrationSchema = z.object({
  school_name: z
    .string()
    .trim()
    .min(3, { message: "Tên trường phải có ít nhất 3 ký tự" })
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
    .min(10, { message: "Địa chỉ phải có ít nhất 10 ký tự" })
    .max(500),
  representative_name: z
    .string()
    .trim()
    .min(2, { message: "Tên người đại diện phải có ít nhất 2 ký tự" })
    .max(100),
  representative_position: z.string().optional(),
  student_count: z.number().min(1).optional(),
  school_type: z.enum(["public", "private"]),
  website: z.string().url().optional().or(z.literal("")),
  tax_code: z.string().optional(),
  description: z.string().max(1000).optional(),
});

export default function SchoolRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoFile, setLogoFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    school_name: "",
    email: "",
    phone: "",
    address: "",
    representative_name: "",
    representative_position: "",
    student_count: "",
    school_type: "public",
    website: "",
    tax_code: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
    const step1Schema = z.object({
      school_name: registrationSchema.shape.school_name,
      email: registrationSchema.shape.email,
      phone: registrationSchema.shape.phone,
      address: registrationSchema.shape.address,
      representative_name: registrationSchema.shape.representative_name,
    });

    const result = step1Schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    const result = registrationSchema.safeParse({
      ...formData,
      student_count: formData.student_count
        ? parseInt(formData.student_count)
        : undefined,
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      result.error.errors.forEach((err) => {
        message.error(err.message);
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      message.success(
        "Đăng ký thành công! Đơn đăng ký của bạn đang chờ Admin duyệt."
      );
      navigate("/school/auth");
    } catch (error) {
      message.error(error.message || "Đã xảy ra lỗi khi đăng ký");
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
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
            <HomeOutlined className="text-3xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Đăng ký Trường học
          </h1>
          <p className="text-gray-600 mt-2">
            Điền đầy đủ thông tin để đăng ký sử dụng EcoVerse
          </p>
        </motion.div>

        {/* Progress Steps */}
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
          {/* Step 1: Basic Info */}
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
                    <BuildOutlined className="text-green-600" />
                    <span>Thông tin cơ bản</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tên trường học *
                    </label>
                    <Input
                      prefix={<HomeOutlined />}
                      placeholder="VD: Trường Tiểu học Nguyễn Du"
                      size="large"
                      value={formData.school_name}
                      onChange={(e) =>
                        handleChange("school_name", e.target.value)
                      }
                      status={errors.school_name ? "error" : ""}
                    />
                    {errors.school_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.school_name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email liên hệ *
                      </label>
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="contact@school.edu.vn"
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
                        prefix={<PhoneOutlined />}
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

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Địa chỉ *
                    </label>
                    <TextArea
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      rows={3}
                      size="large"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      status={errors.address ? "error" : ""}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Người đại diện *
                      </label>
                      <Input
                        prefix={<UserOutlined />}
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
                        placeholder="VD: Hiệu trưởng"
                        size="large"
                        value={formData.representative_position}
                        onChange={(e) =>
                          handleChange(
                            "representative_position",
                            e.target.value
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
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Details & Documents */}
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
                    <FileTextOutlined className="text-green-600" />
                    <span>Chi tiết & Tài liệu</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Loại trường *
                      </label>
                      <Select
                        size="large"
                        className="w-full"
                        value={formData.school_type}
                        onChange={(value) => handleChange("school_type", value)}
                      >
                        <Select.Option value="public">Công lập</Select.Option>
                        <Select.Option value="private">Tư thục</Select.Option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số lượng học sinh
                      </label>
                      <Input
                        type="number"
                        placeholder="VD: 500"
                        size="large"
                        value={formData.student_count}
                        onChange={(e) =>
                          handleChange("student_count", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Website
                      </label>
                      <Input
                        prefix={<GlobalOutlined />}
                        placeholder="https://school.edu.vn"
                        size="large"
                        value={formData.website}
                        onChange={(e) =>
                          handleChange("website", e.target.value)
                        }
                        status={errors.website ? "error" : ""}
                      />
                      {errors.website && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.website}
                        </p>
                      )}
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

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mô tả về trường
                    </label>
                    <TextArea
                      placeholder="Giới thiệu ngắn về trường học..."
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Logo trường
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
                            alt="Logo preview"
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
                        Giấy phép hoạt động
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
                      className="bg-green-600 hover:bg-green-700"
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
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            Đăng xuất
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
