import { useState, useEffect } from 'react';
import { rewardService } from '../../../services/reward.service';
import { 
  rewardStats,
  topRewardsData,
  statusDistributionData,
  partnershipRewardsData
} from '../../../data/reward.data';

export function useRewards() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  const [partnershipRewards, setPartnershipRewards] = useState(partnershipRewardsData);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  
  const [pendingRewards, setPendingRewards] = useState([]);
  const [approvedRewards, setApprovedRewards] = useState([]);
  const [deliveredRewards, setDeliveredRewards] = useState([]);
  const [confirmedRewards, setConfirmedRewards] = useState([]);
  const [rejectedRewards, setRejectedRewards] = useState([]);
  const [cancelledRewards, setCancelledRewards] = useState([]);
  const [localStats, setLocalStats] = useState(rewardStats);
  const [localTopRewards, setLocalTopRewards] = useState(topRewardsData);

  const fetchRewards = async () => {
    try {
      const res = await rewardService.getRewards();
      const rewardsList = res.data?.data || [];
      const mapped = rewardsList.map(r => ({
        id: r.id,
        name: r.rewardName,
        coins: r.coinCost,
        stock: r.isUnlimited ? '∞' : r.stockQuantity,
        image: r.imageUrl,
        active: r.isActive,
        type: r.rewardType || 'PHYSICAL',
        ...r
      }));
      setMarketplaceItems(mapped);
    } catch (e) {
      console.error('Failed to fetch rewards', e);
    }
  };

  const fetchRewardRequests = async () => {
    try {
      const res = await rewardService.getRewardRequests();
      const requests = res.data?.data || [];
      
      const pending = [];
      const approved = [];
      const delivered = [];
      const confirmed = [];
      const cancelled = [];
      const rejected = [];

      requests.forEach(req => {
        const item = {
          ...req,
          id: req.id,
          requestCode: req.requestCode,
          studentId: req.studentId,
          student: req.studentName,
          studentCode: req.studentCode,
          rewardId: req.rewardId,
          reward: req.rewardName,
          coins: req.totalCoins,
          status: req.status.toLowerCase(),
          rawStatus: req.status,
          requestDate: new Date(req.createdAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
          }).replace(',', ''),
          expiresAt: req.expiresAt ? new Date(req.expiresAt).toLocaleDateString('vi-VN') : 'N/A',
          deliveredAt: (req.deliveredAt || req.updatedAt) ? new Date(req.deliveredAt || req.updatedAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
          }).replace(',', '') : null,
          confirmedAt: req.confirmedAt ? new Date(req.confirmedAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
          }).replace(',', '') : null,
          cancelledDate: (req.cancelledAt || req.rejectedAt) ? new Date(req.cancelledAt || req.rejectedAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
          }).replace(',', '') : null,
          reason: req.rejectedReason || req.cancelledReason || 'N/A',
        };

        if (req.status === 'PENDING') pending.push(item);
        else if (req.status === 'APPROVED') approved.push(item);
        else if (req.status === 'DELIVERED') delivered.push(item);
        else if (req.status === 'CONFIRMED') confirmed.push(item);
        else if (req.status === 'CANCELLED') cancelled.push(item);
        else if (req.status === 'REJECTED') rejected.push(item);
      });

      setPendingRewards(pending);
      setApprovedRewards(approved);
      setDeliveredRewards(delivered);
      setConfirmedRewards(confirmed);
      setCancelledRewards(cancelled);
      setRejectedRewards(rejected);

      // Calculate dynamic stats
      const dynamicStats = {
        pending: pending.length + approved.length,
        completed: delivered.length + confirmed.length,
        expired: cancelled.length + rejected.length,
        coinsRedeemed: [...delivered, ...confirmed].reduce((sum, item) => sum + (Number(item.coins) || 0), 0)
      };

      setLocalStats(dynamicStats);

      // Calculate Top Rewards
      const counts = {};
      [...delivered, ...confirmed].forEach(req => {
        const name = req.reward || 'Unknown';
        counts[name] = (counts[name] || 0) + (Number(req.quantity) || 1);
      });

      const topRewards = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setLocalTopRewards(topRewards.length > 0 ? topRewards : topRewardsData);
    } catch (e) {
      console.error('Failed to fetch reward requests', e);
    }
  };

  const processRewardRequest = async (id, approved, reason = '') => {
    try {
      // If approved is true and reason is empty, provide a default reason
      const finalReason = approved && !reason ? 'Đã duyệt' : reason;
      await rewardService.approveRewardRequest(id, { approved, reason: finalReason });
      await fetchRewardRequests();
      return { success: true };
    } catch (e) {
      console.error('Failed to process reward request', e);
      return { success: false, error: e };
    }
  };

  const deliverRewardRequest = async (id) => {
    try {
      await rewardService.deliverRewardRequest(id);
      await fetchRewardRequests();
      return { success: true };
    } catch (e) {
      console.error('Failed to deliver reward request', e);
      return { success: false, error: e };
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchRewardRequests();
  }, []);

  const confirmPartnershipReward = (id) => {
    setPartnershipRewards(prev => prev.map(reward => {
      if (reward.id !== id) return reward;

      if (reward.status === 'shipping') {
        return { 
          ...reward, 
          status: 'at_school', 
          receivedAt: new Date().toLocaleDateString('vi-VN') 
        };
      }
      
      if (reward.status === 'at_school') {
        return { 
          ...reward, 
          status: 'given', 
          givenAt: new Date().toLocaleDateString('vi-VN') 
        };
      }

      return reward;
    }));
  };

  return {
    pendingRewards,
    approvedRewards,
    deliveredRewards,
    confirmedRewards,
    rejectedRewards,
    cancelledRewards,
    marketplaceItems,
    fetchRewards,
    fetchRewardRequests,
    processRewardRequest,
    deliverRewardRequest,
    stats: localStats,
    topRewards: localTopRewards,
    statusDistribution: statusDistributionData,
    partnershipRewards,
    confirmPartnershipReward,
    searchTerm,
    setSearchTerm,
    isAddItemOpen,
    setIsAddItemOpen,
  };
}
