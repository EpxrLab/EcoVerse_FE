import { useState, lazy, Suspense, useEffect } from "react";
import {
  Card,
  Button,
  Skeleton,
  Tag,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  HomeOutlined,
  BookOutlined,
  RocketOutlined,
  CrownOutlined,
  CalendarOutlined,
  RiseOutlined,
  BankOutlined,
  IdcardOutlined,
  ManOutlined,
  WomanOutlined,
  EnvironmentOutlined,
  LockOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { getAuthenticatedStudentProfile } from "../../services";
import toast from "react-hot-toast";
import { changePassword } from "../../../../features/auth/services";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const GENDER_MAP = {
  MALE: { label: "Nam", icon: <ManOutlined />, color: "blue" },
  FEMALE: { label: "Nữ", icon: <WomanOutlined />, color: "pink" },
};

// ─── Demo Data (shape matches BE response) ────────────────────────────────────

const ACTIVITY_ICONS = {
  quiz: <BookOutlined />,
  game: <RocketOutlined />,
  reward: <CrownOutlined />,
};
const ACTIVITY_COLORS = {
  quiz: { bg: "bg-blue-50", text: "text-blue-500" },
  game: { bg: "bg-purple-50", text: "text-purple-500" },
  reward: { bg: "bg-amber-50", text: "text-amber-500" },
};
 
const ACHIEVEMENT_IMAGES = {
  MOST_GAMES_COMPLETED: "/image/MOST_COMPLETED.png",
  BEST_ACCURACY_AND_TIME: "/image/BEST_ACCURACY_TIME.png",
  HIGHEST_ACCURACY: "/image/HIGHEST_ACCURACY.png",
  FASTEST_COMPLETION: "/image/FASTEST_COMPETION.png",
  MOST_QUIZZES_PASSED: "/image/MOST_QUIZ_PASSED.png",
};

// ─── CoinIcon ────────────────────────────────────────────────────────────────

const CoinIcon = ({ className = "w-8 h-8 text-white" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" opacity="0.2" />
    <circle cx="12" cy="12" r="8" />
    <text
      x="12"
      y="16"
      fontSize="10"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      ₫
    </text>
  </svg>
);

// ─── Avatar fallback ─────────────────────────────────────────────────────────

function StudentAvatar({ avatarUrl, fullName }) {
  const initials = fullName
    ? fullName
        .split(" ")
        .map((w) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "??";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className="w-32 h-32 rounded-3xl object-cover shadow-2xl border-4 border-white"
      />
    );
  }
  return (
    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-2xl border-4 border-white">
      <span className="text-4xl font-bold text-white">{initials}</span>
    </div>
  );
}

// ─── Achievement Card (lazy) ─────────────────────────────────────────────────

const AchievementCard = lazy(() =>
  Promise.resolve({
    default: ({ achievement }) => (
      <motion.div
        whileHover={{ scale: 1.05, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className="border-2 border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 hover:shadow-lg transition-shadow overflow-hidden"
          bodyStyle={{ padding: "0px", textAlign: "center" }}
        >
          <div className="relative group">
            {/* Image display based on criteriaType */}
            <div className="h-44 w-full bg-white flex items-center justify-center p-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 z-10" />
              <img 
                src={ACHIEVEMENT_IMAGES[achievement.criteriaType] || "/image/MOST_COMPLETED.png"} 
                alt={achievement.titleName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.svgrepo.com/show/452030/avatar-default.svg";
                }}
                className="h-full w-full object-cover filter brightness-105 group-hover:scale-110 transition-all duration-500 transform"
              />
            </div>
            
            <div className="p-4 space-y-1">
              <h3 className="font-bold text-sm text-gray-800 line-clamp-1">
                {achievement.titleName}
              </h3>
              <p className="text-[10px] text-gray-500 font-medium">
                {achievement.campaignName}
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-green-500 text-white shadow-sm shadow-green-100 italic">
                   {formatDate(achievement.earnedAt?.split('T')[0])}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    ),
  }),
);

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentProfile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm] = Form.useForm();
  const [loadingPassword, setLoadingPassword] = useState(false);

  const fetchStudentProfile = async () => {
    try {
      const res = await getAuthenticatedStudentProfile();
      setStudent(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const handleChangePassword = async (values) => {
    setLoadingPassword(true);
    try {
      const res = await changePassword(values);

      if (res) {
        toast.success("Đổi mật khẩu thành công!");
      } else {
        toast.error("Đổi mật khẩu thất bại!");
      }

      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error("Đổi mật khẩu thất bại. Vui lòng kiểm tra lại!");
    } finally {
      setLoadingPassword(false);
    }
  };

  const gender = GENDER_MAP[student?.gender] ?? {
    label: student?.gender ?? "—",
    color: "default",
  };
  const age = calcAge(student?.dateOfBirth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-gray-400"
        >
          <Button
            type="text"
            size="small"
            icon={<HomeOutlined />}
            onClick={() => navigate("/student")}
            className="text-gray-400 hover:text-gray-700"
          >
            Home
          </Button>
          <span>/</span>
          <span className="text-gray-700 font-medium">Hồ sơ</span>
        </motion.div>
        {/* ── Profile Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-2 shadow-lg overflow-hidden rounded-3xl"
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
              {/* decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />

              <div className="relative flex flex-col lg:flex-row items-start gap-6">
                {/* Avatar */}
                <StudentAvatar
                  avatarUrl={student?.avatarPresignedUrl}
                  fullName={student?.fullName}
                />

                {/* Info block */}
                <div className="flex-1 space-y-4">
                  <div>
                    {/* Name + first-login badge */}
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h1 className="text-4xl font-bold text-gray-800">
                        {student?.fullName}
                      </h1>
                      {student?.isFirstLogin && (
                        <Tag
                          color="volcano"
                          className="rounded-full font-semibold"
                        >
                          Lần đầu đăng nhập
                        </Tag>
                      )}
                    </div>

                    {/* School + class + grade */}
                    <div className="flex items-center gap-3 flex-wrap text-gray-500 text-sm">
                      <div className="flex items-center gap-1.5">
                        <BankOutlined />
                        <span>{student?.school?.schoolName ?? "—"}</span>
                      </div>
                      <Tag color="blue" className="rounded-full">
                        Lớp {student?.className}
                      </Tag>
                      <Tag color="green" className="rounded-full">
                        Khối {student?.gradeLevel}
                      </Tag>
                    </div>
                  </div>

                  {/* Detail grid — chỉ hiển thị field có trong BE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    {/* Mã học sinh */}
                    <div className="flex items-center gap-2">
                      <IdcardOutlined className="text-gray-400" />
                      <span className="text-gray-400">Mã HS:</span>
                      <span className="font-mono font-semibold text-gray-700">
                        {student?.studentCode}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200/50">
                      <Button
                        icon={<KeyOutlined />}
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="rounded-xl border-gray-300 hover:border-blue-500 hover:text-blue-500 shadow-sm"
                      >
                        Đổi mật khẩu
                      </Button>
                    </div>

                    {/* Ngày sinh + tuổi */}
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-gray-400" />
                      <span className="text-gray-400">Ngày sinh:</span>
                      <span>
                        {formatDate(student?.dateOfBirth)}
                        {age ? ` (${age} tuổi)` : ""}
                      </span>
                    </div>

                    {/* Giới tính */}
                    <div className="flex items-center gap-2">
                      {gender.icon && (
                        <span className="text-gray-400">{gender.icon}</span>
                      )}
                      <span className="text-gray-400">Giới tính:</span>
                      <Tag color={gender.color} className="rounded-full m-0">
                        {gender.label}
                      </Tag>
                    </div>

                    {/* Địa chỉ — hiện nếu có, ẩn nếu null */}
                    {student?.address && (
                      <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-gray-400" />
                        <span className="text-gray-400">Địa chỉ:</span>
                        <span>{student?.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coin card */}
                <Card
                  className="border-2 border-amber-300 shadow-xl rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex-shrink-0"
                  bodyStyle={{ padding: "24px" }}
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <CoinIcon />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Tổng xu</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {(student?.totalCoins ?? 0).toLocaleString()}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Achievements + Recent Activities ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Achievements */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="border-2 rounded-3xl"
              title={
                <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <CrownOutlined className="text-green-500" />
                  Thành tựu
                </div>
              }
              bodyStyle={{ padding: "24px" }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {student?.earnedTitles?.map((achievement) => (
                  <Suspense
                    key={achievement.studentTitleId}
                    fallback={
                      <Card
                        className="rounded-2xl border-2"
                        bodyStyle={{ padding: 60 }}
                      >
                        <Skeleton.Avatar
                          active
                          size={40}
                          className="mx-auto mb-2"
                        />
                        <Skeleton active paragraph={{ rows: 2 }} />
                      </Card>
                    }
                  >
                    <AchievementCard achievement={achievement} />
                  </Suspense>
                ))}
                {(!student?.earnedTitles || student.earnedTitles.length === 0) && (
                   <div className="col-span-full py-12 text-center space-y-3">
                     <div className="text-4xl opacity-20">🏆</div>
                     <p className="text-gray-400 text-sm">Chưa có thành tựu nào đạt được</p>
                   </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              className="border-2 rounded-3xl"
              title={
                <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <RiseOutlined className="text-blue-500" />
                  Hoạt động gần đây
                </div>
              }
              bodyStyle={{ padding: "20px" }}
            >
              <div className="space-y-3">
                {student?.recentActivities?.map((activity) => {
                  const colors =
                    ACTIVITY_COLORS[activity.type] ?? ACTIVITY_COLORS.quiz;
                  return (
                    <motion.div
                      key={activity.id}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}
                      >
                        {ACTIVITY_ICONS[activity.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-semibold ${activity.coins > 0 ? "text-green-600" : "text-red-500"}`}
                          >
                            {activity.coins > 0 ? "+" : ""}
                            {activity.coins} xu
                          </span>
                          <span className="text-xs text-gray-400">
                            {activity.date}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            <LockOutlined className="text-blue-500" />
            <span>Thiết lập mật khẩu mới</span>
          </div>
        }
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
        centered
        className="rounded-3xl overflow-hidden"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="mt-4"
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="oldPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="••••••••"
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message:
                  "Mật khẩu phải tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)",
              },
            ]}
            hasFeedback // Thêm icon tích xanh khi thỏa mãn điều kiện
          >
            <Input.Password
              prefix={<KeyOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu mới"
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!"),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined className="text-gray-400" />}
              placeholder="••••••••"
              className="rounded-lg py-2"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-8">
            <Button
              onClick={() => setIsPasswordModalOpen(false)}
              className="rounded-xl px-6"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingPassword}
              className="rounded-xl px-6 bg-gradient-to-r from-blue-500 to-indigo-600 border-none"
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
