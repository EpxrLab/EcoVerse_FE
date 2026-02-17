import React from "react";
import { motion } from "framer-motion";
import { Card, Button, Statistic } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  RiseOutlined,
  AimOutlined,
  FileTextOutlined,
  BankOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  stats,
  revenueData,
  subscriptionData,
  userGrowthData,
  topSchools,
  recentTransactions,
} from "../../data/dashboard.data";

const AdminDashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Tổng quan hoạt động hệ thống EcoVerse
          </p>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="large"
          className="bg-green-600 hover:bg-green-700"
        >
          Xuất báo cáo
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card
                hoverable
                className="border-0 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`text-2xl ${stat.color}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                    {stat.change}
                  </div>
                </div>
                <Statistic
                  value={stat.value}
                  valueStyle={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#1f2937",
                  }}
                />
                <p className="text-sm text-gray-600 mt-2">{stat.title}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue & Subscription Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card
            title={
              <div className="flex items-center gap-2">
                <DollarOutlined className="text-green-600" />
                <span>Doanh thu theo tháng (triệu VNĐ)</span>
              </div>
            }
            className="shadow-md"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ fill: "#16a34a", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <AimOutlined className="text-blue-600" />
                <span>Phân bố gói đăng ký</span>
              </div>
            }
            className="shadow-md"
          >
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {subscriptionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* User Growth Chart */}
      <motion.div variants={itemVariants}>
        <Card
          title={
            <div className="flex items-center gap-2">
              <RiseOutlined className="text-purple-600" />
              <span>Tăng trưởng người dùng</span>
            </div>
          }
          className="shadow-md"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="students"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Học sinh"
                />
                <Bar
                  yAxisId="right"
                  dataKey="schools"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                  name="Trường học"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Top Schools & Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <BankOutlined className="text-orange-600" />
                <span>Top trường hoạt động</span>
              </div>
            }
            extra={
              <Button type="text" size="small">
                Xem tất cả
              </Button>
            }
            className="shadow-md"
          >
            <div className="space-y-3">
              {topSchools.map((school, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {school.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {school.students} học sinh
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {school.accuracy}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {(school.items / 1000).toFixed(1)}K items
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-blue-600" />
                <span>Giao dịch gần đây</span>
              </div>
            }
            extra={
              <Button type="text" size="small">
                Xem tất cả
              </Button>
            }
            className="shadow-md"
          >
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    <FileTextOutlined className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {tx.school}
                    </p>
                    <p className="text-sm text-gray-500">
                      Gói {tx.plan} • {tx.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{tx.amount}</p>
                    <p
                      className={`text-xs ${
                        tx.status === "completed"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {tx.status === "completed" ? "Hoàn thành" : "Đang xử lý"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
