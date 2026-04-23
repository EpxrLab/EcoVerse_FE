import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Spin, Result, Button, Modal } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import QuizPlay from "../../features/quizzes/components/QuizPlay";
import { startQuiz } from "../../services";

export default function StudentQuizPlay() {
  const navigate = useNavigate();
  const { campaignId, roundId, quizId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizInfo, setQuizInfo] = useState(null);

  const fetchQuizData = async (cId, rId, qId) => {
    setLoading(true);
    try {
      const res = await startQuiz(cId, rId, qId);
      setQuizInfo(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData(campaignId, roundId, quizId);
  }, [quizId]);

  const handleFinish = (result) => {
    navigate(-1);
  };

  const handleCancel = () => {
    Modal.confirm({
      title: "Xác nhận rời đi?",
      content:
        "Tiến độ làm bài sẽ không được lưu. Bạn chắc chắn muốn thoát chứ?",
      okText: "Rời đi",
      okType: "danger",
      cancelText: "Ở lại",
      zIndex: 11000,
      onOk() {
        navigate(-1);
      },
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[10000]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 64, color: "var(--primary)" }}
                spin
              />
            }
          />
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
              className="h-14 px-10 rounded-2xl font-black bg-primary border-none shadow-lg"
            >
              Quay về Dashboard
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <QuizPlay quiz={quizInfo} onFinish={handleFinish} onCancel={handleCancel} />
  );
}
