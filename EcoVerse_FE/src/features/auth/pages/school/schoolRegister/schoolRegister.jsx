import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Input, Select, message, notification } from "antd";
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
import {
  getProvinces,
  getWards,
  uploadFile,
  schoolRegister,
} from "../../../services";

const { Option } = Select;
const { TextArea } = Input;

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
  const [vnProvinces, setVnProvinces] = useState([]);
  const [vnWards, setVnWards] = useState([]);
  const [pCode, setPCode] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    schoolName: "",
    contactEmail: sessionStorage.getItem("mail")
      ? sessionStorage.getItem("mail")
      : "",
    password: sessionStorage.getItem("pass")
      ? sessionStorage.getItem("pass")
      : "",
    phoneNumber: "",
    province: "",
    ward: "",
    streetAddress: "",
    principalName: "",
    position: "",
    schoolType: "PUBLIC",
    linkWeb: "",
    taxCode: "",
    description: "",
    otp: sessionStorage.getItem("otpCode")
      ? sessionStorage.getItem("otpCode")
      : "",
    logoUrl: "",
    licenseUrl: "",
  });

  const fetchVietNamDivisions = async () => {
    try {
      const res1 = await getProvinces();
      const res2 = await getWards();

      setVnProvinces(res1);
      setVnWards(res2);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchVietNamDivisions();
  }, []);

  const [errors, setErrors] = useState({});

  const availableWards = formData.province
    ? vnWards.filter((item) => item.province_code === pCode) || []
    : [];

  const buildFullAddress = () => {
    const parts = [];
    if (formData.streetAddress) parts.push(formData.streetAddress);
    if (formData.ward) parts.push(formData.ward);
    if (formData.province) parts.push(formData.province);

    return parts.join(", ");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field, value) => {
    if (field === "province") {
      const province = vnProvinces.find((p) => p.name === value);
      setPCode(province?.code);
      setFormData((prev) => ({ ...prev, province: value, ward: "" }));
    } else if (field === "ward") {
      const ward = vnWards.find((w) => w.name === value);
      setFormData((prev) => ({
        ...prev,
        ward: ward?.name || value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

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
      console.log(error);
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
        message.success("Giấy phép lao động tải lên thành công!");
        setFormData((prev) => ({ ...prev, licenseUrl: res.data.url }));
      } else {
        message.error("Giấy phép lao động tải lên thất bại!");
      }
    } catch (error) {
      console.log(error);
    }
    setLicenseFile(file);
  };

  const validateStep1 = () => {
    const e = {};
    e.school_name = validate.minLen(
      formData.schoolName,
      3,
      "Tên trường phải có ít nhất 3 ký tự",
    );
    e.email = validate.email(formData.contactEmail);
    e.phone = validate.phone(formData.phoneNumber);
    e.province = validate.required(
      formData.province,
      "Vui lòng chọn tỉnh/thành phố",
    );
    e.ward = validate.required(formData.ward, "Vui lòng chọn phường/xã");
    e.street_address = validate.minLen(
      formData.streetAddress,
      5,
      "Địa chỉ phải có ít nhất 5 ký tự",
    );
    e.principalName = validate.minLen(
      formData.principalName,
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
      const res = await schoolRegister(formData);
      if (res) {
        notification.success({
          message: "Đăng ký thành công!",
          description: "Đơn đăng ký đang chờ Admin duyệt.",
        });
        navigate("/auth/school/pending");
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
                  className="rounded-3xl shadow-xl border-0 sm:[&>.ant-card-body]:!p-8"
                  bodyStyle={{ padding: "1.5rem" }}
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
                        name="schoolName"
                        placeholder="VD: Trường Tiểu học Nguyễn Du"
                        value={formData.schoolName}
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
                          name="contactEmail"
                          type="email"
                          placeholder="contact@school.edu.vn"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          prefix={<Mail className="w-4 h-4 text-gray-400" />}
                          className={cls}
                          size="large"
                          disabled
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
                          name="phoneNumber"
                          placeholder="0123 456 789"
                          value={formData.phoneNumber}
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
                            {vnProvinces.map((p) => (
                              <Option key={p.code} value={p.name}>
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
                                  <Option key={w.code} value={w.name}>
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
                          name="streetAddress"
                          placeholder="VD: 123 Nguyễn Văn Linh"
                          value={formData.streetAddress}
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
                      {(formData.streetAddress ||
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
                          name="principalName"
                          placeholder="Họ và tên"
                          value={formData.principalName}
                          onChange={handleInputChange}
                          prefix={<User className="w-4 h-4 text-gray-400" />}
                          className={cls}
                          size="large"
                        />
                        {errors.principalName && (
                          <p className="text-xs text-red-500">
                            {errors.principalName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Chức vụ
                        </label>
                        <Input
                          name="position"
                          placeholder="VD: Hiệu trưởng"
                          value={formData.position}
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
                  className="rounded-3xl shadow-xl border-0 sm:[&>.ant-card-body]:!p-8"
                  bodyStyle={{ padding: "1.5rem" }}
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
                          value={formData.schoolType}
                          onChange={(v) => handleSelectChange("schoolType", v)}
                        >
                          <Option value="PUBLIC">Công lập</Option>
                          <Option value="PRIVATE">Tư thục</Option>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Website
                        </label>
                        <Input
                          name="linkWeb"
                          placeholder="https://school.edu.vn"
                          value={formData.linkWeb}
                          onChange={handleInputChange}
                          prefix={<Globe className="w-4 h-4 text-gray-400" />}
                          className={cls}
                          size="large"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Mã số thuế
                        </label>
                        <Input
                          name="taxCode"
                          placeholder="VD: 0123456789"
                          value={formData.taxCode}
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
