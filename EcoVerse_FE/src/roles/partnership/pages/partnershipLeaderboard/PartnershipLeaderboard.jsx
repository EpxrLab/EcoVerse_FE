import { useState, useMemo, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { usePartnershipCampaigns } from '../../features/campaigns/hooks/usePartnershipCampaigns';
import { partnershipCampaignService } from '../../services/partnershipCampaign.service';
import { LeaderboardFilters } from '../../features/leaderboard/components/LeaderboardFilters';
import { LeaderboardPodium } from '../../features/leaderboard/components/LeaderboardPodium';
import { LeaderboardTable } from '../../features/leaderboard/components/LeaderboardTable';

// Remove mock data generator if no longer needed

export default function PartnershipLeaderboard() {
  const { campaigns: allCampaigns } = usePartnershipCampaigns();

  const campaigns = useMemo(() => 
    allCampaigns.filter(c => c.status === 'on_going' || c.status === 'completed'),
    [allCampaigns]
  );

  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [selectedRoundId, setSelectedRoundId] = useState('all');
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedCampaign = useMemo(() =>
    campaigns.find(c => c.id === selectedCampaignId),
    [campaigns, selectedCampaignId]
  );

  const rounds = useMemo(() => {
    const baseRounds = [{ id: 'all', name: 'Toàn bộ chiến dịch' }];
    if (!selectedCampaignDetail) return baseRounds;

    const campaignRounds = (selectedCampaignDetail.rounds || selectedCampaignDetail.qualifying_rounds || []).map(r => ({
      id: r.id,
      name: r.roundName
    }));

    return [...baseRounds, ...campaignRounds];
  }, [selectedCampaignDetail]);

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    const fetchCampaignDetail = async () => {
      if (!selectedCampaignId) {
        setSelectedCampaignDetail(null);
        return;
      }
      try {
        const res = await partnershipCampaignService.getCampaignById(selectedCampaignId);
        setSelectedCampaignDetail(res.data?.data);
      } catch (error) {
        console.error('Failed to fetch campaign detail', error);
        setSelectedCampaignDetail(null);
      }
    };
    fetchCampaignDetail();
  }, [selectedCampaignId]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedCampaignId) return;
      
      try {
        setLoading(true);
        let response;
        if (selectedRoundId === 'all') {
          response = await partnershipCampaignService.getCampaignLeaderboard(selectedCampaignId);
        } else {
          response = await partnershipCampaignService.getRoundLeaderboard(selectedCampaignId, selectedRoundId);
        }
        
        const data = response.data?.data || [];
        // Map rank-based levels since API doesn't provide them
        const dataWithLevels = data.map(item => ({
          ...item,
          level: item.rank <= 5 ? 'Xuất sắc' : item.rank <= 15 ? 'Giỏi' : item.rank <= 30 ? 'Khá' : 'Trung bình'
        }));
        setLeaderboardData(dataWithLevels);
      } catch (error) {
        console.error('Failed to fetch leaderboard data', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedCampaignId, selectedRoundId]);

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