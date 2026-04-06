import React from "react";
import { useParams, useNavigate } from "react-router";
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Statistic,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  HeartOutlined,
  StarOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const DIFFICULTY_COLOR = {
  EASY: "green",
  MEDIUM: "orange",
  HARD: "red",
};

const WASTE_TYPE_LABEL = {
  RECYCLABLE: "Rác tái chế",
  NON_RECYCLABLE: "Rác không tái chế",
  ORGANIC: "Rác hữu cơ",
  HAZARDOUS: "Rác nguy hại",
};

function StudentRoundDetails() {
  const { campaignId, roundId } = useParams();
  const navigate = useNavigate();

  const mockData = {
    campaignId: campaignId,
    roundId: roundId,
    roundNumber: 1,
    roundName: "Cuộc chiến phân loại rác",
    roundStartTime: "2026-04-05T04:13:42.272Z",
    roundEndTime: "2026-04-10T04:13:42.272Z",
    secondsToNextRound: 3600,
    games: [
      {
        roundGameConfigId: "g1",
        gameTypeName: "Phân loại rác (Eco-Sort)",
        resolvedDifficulty: "EASY",
        coinPerSession: 100,
        presets: [
          {
            presetId: "p1",
            difficulty: "EASY",
            items: [
              {
                levelNumber: 1,
                itemCount: 20,
                timeLimitSeconds: 60,
                scorePerCorrect: 10,
                lives: 3,
                wasteCategories: ["RECYCLABLE", "ORGANIC"],
                coinReceived: true,
              },
            ],
          },
        ],
      },
    ],
    quizzes: [
      {
        quizId: "q1",
        title: "Kiến thức về nhựa dùng một lần",
        difficulty: "EASY",
        displayOrder: 1,
        maxAttempts: 3,
        isRequired: true,
      },
    ],
  };

  const data = mockData;

  if (!data) return <Empty description="Không tìm thấy thông tin vòng đấu" />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Điều hướng */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/student/campaign/${campaignId}`)}
        className="mb-2 border-none bg-transparent shadow-none hover:text-green-600"
      >
        Quay lại chiến dịch
      </Button>

      {/* Hero Section - Thông tin chung của Vòng */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="rounded-3xl border-2 shadow-sm bg-gradient-to-r from-green-50 to-blue-50 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Space direction="vertical" size={0}>
                <Text className="text-green-600 font-bold uppercase tracking-wider text-xs">
                  Vòng số {data.roundNumber}
                </Text>
                <Title level={2} style={{ margin: 0 }}>
                  {data.roundName}
                </Title>
                <Space className="mt-2 text-gray-500">
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    Kết thúc lúc:{" "}
                    {new Date(data.roundEndTime).toLocaleString("vi-VN")}
                  </Text>
                </Space>
              </Space>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-inner flex gap-6">
              <Statistic
                title="Game"
                value={data.games.length}
                prefix={<PlayCircleOutlined />}
              />
              <Divider type="vertical" style={{ height: "auto" }} />
              <Statistic
                title="Quiz"
                value={data.quizzes.length}
                prefix={<BookOutlined />}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* CỘT TRÁI: DANH SÁCH GAME */}
        <Col xs={24} lg={15} className="space-y-6">
          <Title level={4} className="flex items-center gap-2">
            <ThunderboltOutlined className="text-amber-500" /> Hoạt động Game
          </Title>

          {data.games.map((game, idx) => (
            <Card
              key={idx}
              className="rounded-2xl border-2 hover:border-green-300 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <Space direction="vertical" size={0}>
                  <Title level={5} style={{ margin: 0 }}>
                    {game.gameTypeName}
                  </Title>
                  <Space split={<Divider type="vertical" />}>
                    <Tag color={DIFFICULTY_COLOR[game.resolvedDifficulty]}>
                      Độ khó: {game.resolvedDifficulty}
                    </Tag>
                    <Text className="text-amber-600 font-bold">
                      <StarOutlined /> +{game.coinPerSession} xu/phiên
                    </Text>
                  </Space>
                </Space>
                <Button
                  type="primary"
                  size="large"
                  className="rounded-xl bg-green-500 border-none px-8 font-bold"
                  onClick={() =>
                    navigate(`/student/campaign/${campaignId}/game`)
                  }
                >
                  Chơi ngay
                </Button>
              </div>

              {/* Chi tiết cấu hình levels/presets */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <Text strong className="text-gray-400 text-xs uppercase">
                  Cấu hình thử thách:
                </Text>
                {game.presets.map((p) =>
                  p.items.map((item, i) => (
                    <Row key={i} gutter={[16, 16]} className="text-center">
                      <Col span={6}>
                        <div className="bg-white p-2 rounded-lg border">
                          <Text type="secondary" size="small" block>
                            Mạng:
                          </Text>
                          <Text strong className="text-red-500">
                            {item.lives} <HeartOutlined />
                          </Text>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="bg-white p-2 rounded-lg border">
                          <Text type="secondary" size="small" block>
                            Thời gian:
                          </Text>
                          <Text strong> {item.timeLimitSeconds}s</Text>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="bg-white p-2 rounded-lg border">
                          <Text type="secondary" size="small" block>
                            Số vật phẩm:
                          </Text>
                          <Text strong> {item.itemCount}</Text>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="bg-white p-2 rounded-lg border">
                          <Text type="secondary" size="small" block>
                            Điểm/câu
                          </Text>
                          <Text strong className="text-blue-500">
                            +{item.scorePerCorrect}
                          </Text>
                        </div>
                      </Col>
                      <Col span={24}>
                        <div className="flex gap-2 flex-wrap items-center">
                          <Text className="text-xs text-gray-400">
                            Loại rác xuất hiện:
                          </Text>
                          {item.wasteCategories.map((cat) => (
                            <Tag
                              key={cat}
                              className="rounded-md border-none bg-gray-200 text-gray-700"
                            >
                              {WASTE_TYPE_LABEL[cat] || cat}
                            </Tag>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  )),
                )}
              </div>
            </Card>
          ))}
        </Col>

        {/* CỘT PHẢI: DANH SÁCH QUIZ */}
        <Col xs={24} lg={9} className="space-y-6">
          <Title level={4} className="flex items-center gap-2">
            <BookOutlined className="text-blue-500" /> Bài Quiz bắt buộc
          </Title>

          {data.quizzes.map((quiz, idx) => (
            <Card
              key={idx}
              className={`rounded-2xl border-2 transition-all ${quiz.isRequired ? "border-blue-100" : ""}`}
              bodyStyle={{ padding: "20px" }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <Tag color={quiz.isRequired ? "red" : "default"}>
                    {quiz.isRequired ? "Bắt buộc" : "Tự chọn"}
                  </Tag>
                  <Text type="secondary">Thứ tự: {quiz.displayOrder}</Text>
                </div>

                <Title level={5} style={{ margin: 0 }}>
                  {quiz.title}
                </Title>

                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span>
                    <TrophyOutlined /> Độ khó: {quiz.difficulty}
                  </span>
                  <span>
                    <ClockCircleOutlined /> Lượt thử: {quiz.maxAttempts}
                  </span>
                </div>

                <Button
                  block
                  className="rounded-xl border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold mt-2"
                  icon={<RightOutlined />}
                  iconPosition="end"
                  onClick={() =>
                    navigate(
                      `/student/campaign/${campaignId}/round/${roundId}/quiz/${quiz.quizId}`,
                    )
                  }
                >
                  Bắt đầu Quiz
                </Button>
              </div>
            </Card>
          ))}

          {data.quizzes.length === 0 && (
            <Empty description="Không có bài quiz nào" />
          )}
        </Col>
      </Row>
    </div>
  );
}

export default StudentRoundDetails;
