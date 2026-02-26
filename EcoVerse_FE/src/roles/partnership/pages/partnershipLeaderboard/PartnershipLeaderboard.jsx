import { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { usePartnershipCampaigns } from '../../features/campaigns/hooks/usePartnershipCampaigns';
import { LeaderboardFilters } from '../../features/leaderboard/components/LeaderboardFilters';
import { LeaderboardPodium } from '../../features/leaderboard/components/LeaderboardPodium';
import { LeaderboardTable } from '../../features/leaderboard/components/LeaderboardTable';

// Mock data generator
const generateMockLeaderboard = (campaignId, roundId) => {
  const count = 50;
  const schools = [
    'Trường Tiểu học Nguyễn Du',
    'Trường Tiểu học Lê Quý Đôn',
    'Trường Tiểu học Trần Hưng Đạo',
    'Trường Tiểu học Võ Thị Sáu',
    'Trường Tiểu học Kim Đồng'
  ];

  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const middleNames = ['Văn', 'Thị', 'Minh', 'Ngọc', 'Thanh', 'Đức', 'Thu', 'Hồng', 'Quang', 'Kim', 'Bảo', 'Gia', 'Tuấn', 'Hoài'];
  const firstNames = ['Anh', 'Chi', 'Bảo', 'Dung', 'Đạt', 'Giang', 'Hà', 'Hải', 'Hiếu', 'Hoà', 'Hùng', 'Huy', 'Khánh', 'Lan', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Nga', 'Ngọc', 'Nhi', 'Nhung', 'Oanh', 'Phát', 'Phương', 'Quân', 'Quang', 'Quốc', 'Quyên', 'Quỳnh', 'Sang', 'Sơn', 'Tài', 'Tâm', 'Tân', 'Thảo', 'Thịnh', 'Thu', 'Thuỷ', 'Thư', 'Tiên', 'Toàn', 'Trang', 'Trí', 'Trinh', 'Trung', 'Tú', 'Tuấn', 'Tùng', 'Tuyết', 'Uyên', 'Vân', 'Việt', 'Vinh', 'Vy', 'Xuân', 'Yến'];

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const generateName = () => `${getRandomItem(lastNames)} ${getRandomItem(middleNames)} ${getRandomItem(firstNames)}`;

  // Seeded random for consistent names based on index if desired, but for now simple random is fine as it's just mock data
  // To make it consistent across re-renders without a seed, we can just rely on the fact that useMemo will hold it.
  
  return Array.from({ length: count }).map((_, index) => {
    const rank = index + 1;
    let baseScore = 1500 - (index * 25);
    if (roundId !== 'all') baseScore -= Math.floor(Math.random() * 200);
    const quizScore = Math.floor(baseScore * 0.4);
    const gameScore = baseScore - quizScore;

    return {
      id: `${campaignId}-${roundId}-${index}`,
      rank,
      studentName: generateName(),
      schoolName: schools[index % schools.length],
      totalPoints: baseScore,
      quizScore,
      gameScore,
      level: rank <= 5 ? 'Xuất sắc' : rank <= 15 ? 'Giỏi' : rank <= 30 ? 'Khá' : 'Trung bình'
    };
  });
};

export default function PartnershipLeaderboard() {
  const { campaigns } = usePartnershipCampaigns();

  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [selectedRoundId, setSelectedRoundId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedCampaign = useMemo(() =>
    campaigns.find(c => c.id === selectedCampaignId),
    [campaigns, selectedCampaignId]
  );

  const rounds = useMemo(() => {
    if (!selectedCampaign) return [];
    return [
      { id: 'all', name: 'Toàn bộ chiến dịch' },
      ...(selectedCampaign.qualifying_rounds?.map(r => ({
        id: `qualifying-${r.round_number}`,
        name: r.round_name
      })) || []),
      { id: 'main', name: 'Vòng chính thức' }
    ];
  }, [selectedCampaign]);

  const leaderboardData = useMemo(() =>
    generateMockLeaderboard(selectedCampaignId, selectedRoundId),
    [selectedCampaignId, selectedRoundId]
  );

  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
  const currentData = leaderboardData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCampaignChange = (value) => {
    setSelectedCampaignId(value);
    setSelectedRoundId('all');
    setCurrentPage(1);
  };

  const handleRoundChange = (value) => {
    setSelectedRoundId(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 pb-12">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-eco-blue/10 to-accent/10 p-6 border border-border/50">
        <div className="absolute top-0 right-0 p-4 opacity-[0.06]">
          <Trophy className="w-48 h-48 text-foreground rotate-12" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-lg ring-4 ring-background">
            <Trophy className="w-6 h-6 text-accent-foreground drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Bảng xếp hạng</h1>
            <p className="text-sm text-muted-foreground">Vinh danh những Chiến binh Xanh xuất sắc nhất</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <LeaderboardFilters
        campaigns={campaigns}
        rounds={rounds}
        selectedCampaignId={selectedCampaignId}
        selectedRoundId={selectedRoundId}
        onCampaignChange={handleCampaignChange}
        onRoundChange={handleRoundChange}
      />

      {/* Podium - page 1 only */}
      {currentPage === 1 && <LeaderboardPodium top3={leaderboardData.slice(0, 3)} />}

      {/* Table */}
      <LeaderboardTable
        data={currentData}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={leaderboardData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}