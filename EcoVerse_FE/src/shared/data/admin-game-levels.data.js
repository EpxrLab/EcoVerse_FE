// Centralized admin-created game levels data
// Admin creates these levels, School and Partnership only select from them when creating campaigns

// This data is managed by Admin via AdminGameLevels page
// In production, this will come from the database
export const adminGameLevelsData = [
  // School levels
  { id: 1, name: 'Cấp 1 - Cơ bản', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic'], items: 10, difficulty: 'Dễ', passRate: '70%', coinsReward: 50, description: 'Phân loại cơ bản với 3 thùng rác', target: 'school' },
  { id: 2, name: 'Cấp 2 - Nâng cao', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic'], items: 10, difficulty: 'Dễ', passRate: '70%', coinsReward: 75, description: 'Thêm nhiều vật phẩm phức tạp hơn', target: 'school' },
  { id: 3, name: 'Cấp 3 - Chạy & Phân loại', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 15, difficulty: 'Trung bình', passRate: '70%', coinsReward: 100, description: 'Chạy và phân loại rác nhanh', target: 'school' },
  { id: 4, name: 'Cấp 4 - Thử thách', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 15, difficulty: 'Trung bình', passRate: '70%', coinsReward: 125, description: 'Vật phẩm khó phân biệt hơn', target: 'school' },
  { id: 5, name: 'Cấp 5 - Chuyên gia', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 15, difficulty: 'Khó', passRate: '70%', coinsReward: 150, description: 'Thử thách cuối cùng!', target: 'school' },
  { id: 6, name: 'Cấp 6 - Phân loại nhanh', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 20, difficulty: 'Khó', passRate: '75%', coinsReward: 175, description: 'Phân loại nâng cao tốc độ', target: 'school' },
  { id: 7, name: 'Cấp 7 - Chạy cơ bản', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic'], items: 10, difficulty: 'Dễ', passRate: '70%', coinsReward: 60, description: 'Chạy và phân loại cơ bản', target: 'school' },

  // Partnership levels
  { id: 101, name: 'Thu thập cơ bản - Cấp 1', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic'], items: 10, difficulty: 'Dễ', passRate: '70%', coinsReward: 50, description: 'Thu thập và phân loại cơ bản', target: 'partnership' },
  { id: 102, name: 'Thu thập cơ bản - Cấp 2', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic'], items: 12, difficulty: 'Dễ', passRate: '70%', coinsReward: 65, description: 'Thu thập cơ bản nâng cao', target: 'partnership' },
  { id: 103, name: 'Thu thập nâng cao - Cấp 1', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 15, difficulty: 'Trung bình', passRate: '75%', coinsReward: 100, description: 'Thêm thùng rác thứ 4', target: 'partnership' },
  { id: 104, name: 'Thu thập nâng cao - Cấp 2', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 18, difficulty: 'Trung bình', passRate: '75%', coinsReward: 120, description: 'Nâng cao độ phức tạp', target: 'partnership' },
  { id: 105, name: 'Thu thập chuyên nghiệp - Cấp 1', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 20, difficulty: 'Khó', passRate: '80%', coinsReward: 150, description: 'Thu thập chuyên nghiệp', target: 'partnership' },
  { id: 106, name: 'Thu thập chuyên nghiệp - Cấp 2', gameType: 'sorting', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 25, difficulty: 'Khó', passRate: '80%', coinsReward: 175, description: 'Thử thách thu thập cuối cùng', target: 'partnership' },
  { id: 107, name: 'Chạy & Phân loại - Cấp 1', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic'], items: 12, difficulty: 'Dễ', passRate: '70%', coinsReward: 60, description: 'Chạy và phân loại cơ bản', target: 'partnership' },
  { id: 108, name: 'Chạy & Phân loại - Cấp 2', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic'], items: 14, difficulty: 'Dễ', passRate: '70%', coinsReward: 75, description: 'Chạy nhanh hơn', target: 'partnership' },
  { id: 109, name: 'Chạy nhanh & Phân loại - Cấp 1', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 16, difficulty: 'Trung bình', passRate: '75%', coinsReward: 110, description: 'Chạy nhanh với 4 thùng', target: 'partnership' },
  { id: 110, name: 'Chạy nhanh & Phân loại - Cấp 2', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 18, difficulty: 'Trung bình', passRate: '75%', coinsReward: 130, description: 'Nâng cao tốc độ chạy', target: 'partnership' },
  { id: 111, name: 'Siêu tốc & Phân loại - Cấp 1', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 20, difficulty: 'Khó', passRate: '80%', coinsReward: 160, description: 'Siêu tốc phân loại', target: 'partnership' },
  { id: 112, name: 'Siêu tốc & Phân loại - Cấp 2', gameType: 'runner', binTypes: ['plastic', 'paper', 'organic', 'others'], items: 25, difficulty: 'Khó', passRate: '80%', coinsReward: 200, description: 'Thử thách siêu tốc cuối cùng', target: 'partnership' },
];

// Helper functions
export function getGameLevelsForSchool() {
  return adminGameLevelsData.filter(l => l.target === 'school');
}

export function getGameLevelsForPartnership() {
  return adminGameLevelsData.filter(l => l.target === 'partnership');
}