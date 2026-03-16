import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Spin, Result, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import QuizPlay from "../../features/quizzes/components/QuizPlay";

// Enhanced mock questions for development
const QUIZ_QUESTIONS = {
  "1": [
    {
      id: "q001",
      content: "Hành động nào sau đây giúp giảm ô nhiễm không khí hiệu quả nhất?",
      options: [
        { id: "o1", text: "Đốt rác ngoài trời định kỳ" },
        { id: "o2", text: "Trồng thêm cây xanh và bảo tồn rừng" },
        { id: "o3", text: "Sử dụng bếp than tổ ong thay bếp gas" },
        { id: "o4", text: "Chạy xe nổ máy tại chỗ để làm nóng động cơ" }
      ]
    },
    {
      id: "q002",
      content: "Nguồn phát thải khí CO2 lớn nhất trong các hoạt động sau đây là gì?",
      options: [
        { id: "o5", text: "Hoạt động đun nấu trong gia đình" },
        { id: "o6", text: "Quá trình hô hấp của động vật" },
        { id: "o7", text: "Sử dụng năng lượng hóa thạch trong giao thông và công nghiệp" },
        { id: "o8", text: "Quá trình phân hủy rác hữu cơ tự nhiên" }
      ]
    },
    {
        id: "q003",
        content: "Hiện tượng 'Hiệu ứng nhà kính' chủ yếu do loại khí nào sau đây gây ra?",
        options: [
          { id: "o9", text: "Oxy (O2)" },
          { id: "o10", text: "Nitơ (N2)" },
          { id: "o11", text: "Cacbon đioxit (CO2)" },
          { id: "o12", text: "Hydro (H2)" }
        ]
    },
    {
        id: "q004",
        content: "Phân loại rác tại nguồn giúp ích gì cho môi trường?",
        options: [
          { id: "o13", text: "Tiết kiệm thời gian cho người thu gom" },
          { id: "o14", text: "Tăng hiệu quả tái chế và giảm lượng rác thải ra bãi chôn lấp" },
          { id: "o15", text: "Làm bãi rác trông đẹp hơn" },
          { id: "o16", text: "Không có lợi ích rõ rệt" }
        ]
    }
  ],
};

export default function StudentQuizPlay() {
  const navigate = useNavigate();
  const { campaignId, quizId } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quizTitle = searchParams.get("title") || "Hành trình Xanh";
  const timeLimit = Number(searchParams.get("time")) || 15;

  const quiz = useMemo(() => ({
    id: quizId,
    title: quizTitle,
    timeLimit: timeLimit,
    questions: QUIZ_QUESTIONS[quizId] || QUIZ_QUESTIONS["1"],
  }), [quizId, quizTitle, timeLimit]);

  useEffect(() => {
    // Simulate loading state for smoother transition
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFinish = (result) => {
    // Navigate back to quiz list after seeing results
    navigate(`/student/campaign/${campaignId}/quiz`);
  };

  const handleCancel = () => {
    navigate(`/student/campaign/${campaignId}/quiz`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[10000]">
        <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
            <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#6366f1' }} spin />} />
        </div>
        <p className="mt-8 text-slate-400 font-black uppercase tracking-[0.2em] text-sm animate-pulse">
            Chờ chút, kiến thức đang được tải về...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-6 z-[10000]">
        <Result
          status="warning"
          title={<span className="text-2xl font-black">Lỗi kết nối</span>}
          subTitle={<span className="text-slate-500 font-medium">{error}</span>}
          extra={[
            <Button 
                type="primary" 
                size="large" 
                key="back" 
                onClick={handleCancel} 
                className="h-14 px-10 rounded-2xl font-black bg-indigo-600 border-none shadow-lg"
            >
              Quay về Dashboard
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <QuizPlay 
      quiz={quiz} 
      onFinish={handleFinish} 
      onCancel={handleCancel} 
    />
  );
}
