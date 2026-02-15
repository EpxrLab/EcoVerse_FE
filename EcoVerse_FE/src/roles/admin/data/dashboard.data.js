import { School, Users, DollarSign, TrendingUp } from "lucide-react";

export const stats = [
  {
    title: "Tổng trường học",
    value: "52",
    change: "+12%",
    trend: "up",
    icon: School,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Học sinh hoạt động",
    value: "12,450",
    change: "+8%",
    trend: "up",
    icon: Users,
    color: "text-eco-blue",
    bgColor: "bg-eco-blue/10",
  },
  {
    title: "Doanh thu tháng",
    value: "₫125.5M",
    change: "+23%",
    trend: "up",
    icon: DollarSign,
    color: "text-eco-green",
    bgColor: "bg-eco-green/10",
  },
  {
    title: "Tỷ lệ gia hạn",
    value: "94%",
    change: "-2%",
    trend: "down",
    icon: TrendingUp,
    color: "text-eco-orange",
    bgColor: "bg-eco-orange/10",
  },
];

export const revenueData = [
  { month: "T1", revenue: 85 },
  { month: "T2", revenue: 92 },
  { month: "T3", revenue: 78 },
  { month: "T4", revenue: 105 },
  { month: "T5", revenue: 112 },
  { month: "T6", revenue: 98 },
  { month: "T7", revenue: 125 },
  { month: "T8", revenue: 132 },
  { month: "T9", revenue: 118 },
  { month: "T10", revenue: 142 },
  { month: "T11", revenue: 155 },
  { month: "T12", revenue: 168 },
];

export const userGrowthData = [
  { month: "T7", students: 8500, schools: 35 },
  { month: "T8", students: 9200, schools: 38 },
  { month: "T9", students: 10500, schools: 42 },
  { month: "T10", students: 11200, schools: 46 },
  { month: "T11", students: 11800, schools: 49 },
  { month: "T12", students: 12450, schools: 52 },
];

export const subscriptionData = [
  { name: "Basic", value: 18, color: "hsl(200, 80%, 55%)" },
  { name: "Pro", value: 24, color: "hsl(145, 63%, 42%)" },
  { name: "Enterprise", value: 10, color: "hsl(35, 90%, 55%)" },
];

export const topSchools = [
  { name: "TH Lê Lợi", students: 450, accuracy: 89, items: 45200 },
  { name: "TH Nguyễn Huệ", students: 380, accuracy: 87, items: 38500 },
  { name: "TH Trần Hưng Đạo", students: 320, accuracy: 91, items: 35800 },
  { name: "TH Quang Trung", students: 290, accuracy: 85, items: 28900 },
  { name: "TH Hoàng Văn Thụ", students: 275, accuracy: 88, items: 27500 },
];

export const recentTransactions = [
  {
    id: "TX001",
    school: "TH Lê Lợi",
    plan: "Pro",
    amount: "₫3,500,000",
    status: "completed",
    date: "05/12/2024",
  },
  {
    id: "TX002",
    school: "TH Nguyễn Huệ",
    plan: "Enterprise",
    amount: "₫8,000,000",
    status: "completed",
    date: "04/12/2024",
  },
  {
    id: "TX003",
    school: "TH Quang Trung",
    plan: "Basic",
    amount: "₫1,200,000",
    status: "pending",
    date: "03/12/2024",
  },
  {
    id: "TX004",
    school: "TH Phan Chu Trinh",
    plan: "Pro",
    amount: "₫3,500,000",
    status: "completed",
    date: "02/12/2024",
  },
];
