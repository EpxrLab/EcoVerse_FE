// Mock Data for Students
const students = [
  { id: "HS-001", name: "Nguyễn Văn An", class: "3A" },
  { id: "HS-002", name: "Trần Thị Bình", class: "3A" },
  { id: "HS-003", name: "Lê Hoàng Cường", class: "3B" },
  { id: "HS-004", name: "Phạm Minh Dũng", class: "4A" },
  { id: "HS-005", name: "Hoàng Thị Em", class: "4B" },
  { id: "HS-006", name: "Võ Văn Phúc", class: "5A" },
  { id: "HS-007", name: "Đặng Thị Giang", class: "5A" },
  { id: "HS-008", name: "Bùi Quốc Hùng", class: "5B" },
  { id: "HS-009", name: "Ngô Minh Tuấn", class: "5C" },
  { id: "HS-010", name: "Lý Thị Lan", class: "2A" },
];

// 1. Pending Rewards (Chờ duyệt)
export const pendingRewardsData = [
  { id: "RQ-001", studentId: "HS-001", student: "Nguyễn Văn An", class: "3A", reward: "Voucher Cafe", coins: 500, requestDate: "25/01/2026", expiresAt: "01/02/2026" },
  { id: "RQ-002", studentId: "HS-003", student: "Lê Hoàng Cường", class: "3B", reward: "Bút Bi Xanh", coins: 150, requestDate: "24/01/2026", expiresAt: "31/01/2026" },
  { id: "RQ-003", studentId: "HS-010", student: "Lý Thị Lan", class: "2A", reward: "Sticker Pack", coins: 100, requestDate: "24/01/2026", expiresAt: "31/01/2026" },
  { id: "RQ-004", studentId: "HS-004", student: "Phạm Minh Dũng", class: "4A", reward: "Notebook", coins: 200, requestDate: "23/01/2026", expiresAt: "30/01/2026" },
  { id: "RQ-005", studentId: "HS-006", student: "Võ Văn Phúc", class: "5A", reward: "Avatar Siêu Nhân", coins: 200, requestDate: "23/01/2026", expiresAt: "30/01/2026" },
];

// 2. Completed Rewards (Đã hoàn thành)
export const completedRewardsData = [
  { id: "RQ-101", studentId: "HS-005", student: "Hoàng Thị Em", class: "4B", reward: "Avatar Siêu Nhân", coins: 200, deliveredBy: "Admin Nguyễn", deliveredAt: "20/01/2026" },
  { id: "RQ-102", studentId: "HS-006", student: "Võ Văn Phúc", class: "5A", reward: "Theme Jungle", coins: 300, deliveredBy: "Admin Nguyễn", deliveredAt: "18/01/2026" },
  { id: "RQ-103", studentId: "HS-007", student: "Đặng Thị Giang", class: "5A", reward: "Bút Chì", coins: 100, deliveredBy: "Admin Lan", deliveredAt: "18/01/2026" },
  { id: "RQ-104", studentId: "HS-001", student: "Nguyễn Văn An", class: "3A", reward: "Voucher Cafe", coins: 500, deliveredBy: "Admin Lan", deliveredAt: "15/01/2026" },
  { id: "RQ-105", studentId: "HS-009", student: "Ngô Minh Tuấn", class: "5C", reward: "Bình nước Eco", coins: 400, deliveredBy: "Admin Nguyễn", deliveredAt: "12/01/2026" },
];

// 3. Cancelled Rewards (Đã hủy)
export const cancelledRewardsData = [
  { id: "RQ-201", studentId: "HS-008", student: "Bùi Quốc Hùng", class: "5B", reward: "Voucher Sách", coins: 400, reason: "Hết hạn", cancelledAt: "10/01/2026" },
  { id: "RQ-202", studentId: "HS-009", student: "Ngô Minh Tuấn", class: "5C", reward: "Sticker Set", coins: 150, reason: "Học sinh hủy", cancelledAt: "08/01/2026" },
  { id: "RQ-203", studentId: "HS-002", student: "Trần Thị Bình", class: "3A", reward: "Notebook", coins: 200, reason: "Hết hàng", cancelledAt: "05/01/2026" },
];

// 4. Marketplace Items (Cửa hàng)
export const marketplaceItemsData = [
  { id: "1", name: "Avatar Siêu Nhân", type: "virtual", coins: 200, stock: 9999, image: "🦸", active: true },
  { id: "2", name: "Theme Jungle", type: "virtual", coins: 300, stock: 9999, image: "🌴", active: true },
  { id: "3", name: "Theme Đại Dương", type: "virtual", coins: 350, stock: 9999, image: "🌊", active: true },
  { id: "4", name: "Voucher Cafe", type: "physical", coins: 500, stock: 20, image: "☕", active: true },
  { id: "5", name: "Bút Bi Xanh", type: "physical", coins: 150, stock: 45, image: "🖊️", active: true },
  { id: "6", name: "Notebook", type: "physical", coins: 200, stock: 28, image: "📓", active: true },
  { id: "7", name: "Sticker Pack", type: "physical", coins: 100, stock: 100, image: "⭐", active: true },
  { id: "8", name: "Bình nước Eco", type: "physical", coins: 400, stock: 15, image: "💧", active: true },
  { id: "9", name: "Móc khóa Ranger", type: "physical", coins: 120, stock: 50, image: "🔑", active: false },
];

// 5. Reward Stats
export const rewardStats = {
  pending: 5,
  completed: 124,
  expired: 12,
  coinsRedeemed: 28600,
};

// 6. Top Rewards
export const topRewardsData = [
  { name: "Voucher Cafe", count: 48 },
  { name: "Avatar Siêu Nhân", count: 42 },
  { name: "Bút Bi Xanh", count: 35 },
  { name: "Theme Jungle", count: 30 },
  { name: "Sticker Pack", count: 25 },
];

// 7. Status Distribution
export const statusDistributionData = [
  { name: "Hoàn thành", value: 88, color: "hsl(var(--eco-green))" },
  { name: "Đang chờ", value: 8, color: "hsl(var(--eco-orange))" },
  { name: "Hết hạn/Hủy", value: 4, color: "hsl(var(--destructive))" },
];

// 8. Partnership Rewards (Quà từ Chiến dịch)
export const partnershipRewardsData = [
  { id: "PR-001", studentId: "HS-005", student: "Hoàng Thị Em", class: "4B", campaignName: "Chiến dịch Xanh 2024", rewardName: "Voucher Highlands", receivedAt: "20/01/2026", collectedAt: "21/01/2026", status: 'collected' },
  { id: "PR-002", studentId: "HS-006", student: "Võ Văn Phúc", class: "5A", campaignName: "Tái chế Nhựa", rewardName: "Vé xem phim CGV", status: 'shipping' },
  { id: "PR-003", studentId: "HS-007", student: "Đặng Thị Giang", class: "5A", campaignName: "Sống Xanh", rewardName: "Bình nước cá nhân", receivedAt: "24/01/2026", status: 'at_school' },
  { id: "PR-004", studentId: "HS-001", student: "Nguyễn Văn An", class: "3A", campaignName: "Tái chế Nhựa", rewardName: "Sổ tay Tái chế", status: 'shipping' },
  { id: "PR-005", studentId: "HS-004", student: "Phạm Minh Dũng", class: "4A", campaignName: "Chiến dịch Xanh 2024", rewardName: "Voucher Tiki", receivedAt: "10/01/2026", collectedAt: "15/01/2026", status: 'collected' },
];