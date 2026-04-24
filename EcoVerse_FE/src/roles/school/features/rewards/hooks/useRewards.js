import { useState, useEffect } from 'react';
import { rewardService } from '../../../services/reward.service';
import { campaignService } from '../../../services/campaign.service';
import { toLocalISO } from "@/utils/dateUtils";


export function useRewards() {
  const [partnershipInvitations, setPartnershipInvitations] = useState([]);
  const [partnershipRewards, setPartnershipRewards] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);

  const [pendingRewards, setPendingRewards] = useState([]);
  const [approvedRewards, setApprovedRewards] = useState([]);
  const [deliveredRewards, setDeliveredRewards] = useState([]);
  const [confirmedRewards, setConfirmedRewards] = useState([]);
  const [rejectedRewards, setRejectedRewards] = useState([]);
  const [cancelledRewards, setCancelledRewards] = useState([]);
  const [localStats, setLocalStats] = useState({ pending: 0, completed: 0, expired: 0, coinsRedeemed: 0 });
  const [localTopRewards, setLocalTopRewards] = useState([]);

  const fetchRewards = async () => {
    try {
      const res = await rewardService.getRewards();
      const rewardsList = res.data?.data || [];
      const mapped = rewardsList.map(r => ({
        ...r,
        id: r.id,
        rewardName: r.rewardName,
        coinCost: r.coinCost,
        stockQuantity: r.stockQuantity,
        imageUrl: r.imagePresignedUrl || r.imageUrl,
        imagePresignedUrl: r.imagePresignedUrl,
        isActive: r.isActive,
        rewardType: r.rewardType || 'PHYSICAL',
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
          imagePresignedUrl: req.rewardImagePresignedUrl || req.imagePresignedUrl,
          deliveryImagePresignedUrl: req.deliveryImagePresignedUrl || req.deliveryImageUrl,
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

      setLocalTopRewards(topRewards);
    } catch (e) {
      console.error('Failed to fetch reward requests', e);
    }
  };

  const fetchPartnershipInvitations = async () => {
    try {
      const res = await campaignService.getPartnershipInvitations();
      const invitations = res.data?.data || [];
      // Only keep approved invitations
      const approved = invitations.filter(inv => inv.status === 'APPROVED' || inv.invitationStatus === 'APPROVED');
      setPartnershipInvitations(approved);
      return approved;
    } catch (error) {
      console.error('Failed to fetch partnership invitations', error);
      return [];
    }
  };

  const fetchPartnershipRewards = async (campaignId) => {
    if (!campaignId || campaignId === 'all') {
      setPartnershipRewards([]);
      return [];
    }
    try {
      const res = await rewardService.getRewardDeliveries(campaignId);
      const data = res.data?.data || [];
      const mapped = data.map(r => ({
        ...r,
        student: r.studentName,
        class: r.className || 'N/A', // Assuming className might be there or derived
        campaignName: r.campaignName,
        rewardName: r.rewardName,
        status: mapPartnershipStatus(r.status),
        receivedAt: r.arrivedAt ? new Date(r.arrivedAt).toLocaleDateString('vi-VN') : null,
        givenAt: r.deliveredAt ? new Date(r.deliveredAt).toLocaleDateString('vi-VN') : null,
        collectedAt: r.confirmedAt ? new Date(r.confirmedAt).toLocaleDateString('vi-VN') : null,
      }));
      setPartnershipRewards(mapped);
      return mapped;
    } catch (error) {
      console.error('Failed to fetch partnership rewards', error);
      setPartnershipRewards([]);
      return [];
    }
  };

  const mapPartnershipStatus = (apiStatus) => {
    switch (apiStatus) {
      case 'PREPARING': return 'preparing';
      case 'SHIPPING': return 'shipping';
      case 'ARRIVED': return 'at_school';
      case 'DELIVERED': return 'given';
      case 'CONFIRMED': return 'collected';
      default: return 'shipping';
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

  const deliverRewardRequest = async (id, data) => {
    try {
      await rewardService.deliverRewardRequest(id, data);
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
    fetchPartnershipInvitations();
  }, []);

  const confirmPartnershipReward = async (id, status, payload = {}) => {
    try {
      if (status === 'shipping') {
        await rewardService.markRewardArrived(id);
      } else if (status === 'at_school') {
        await rewardService.markRewardDelivered(id, payload);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to confirm partnership reward', error);
      return { success: false, error };
    }
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
    partnershipRewards,
    partnershipInvitations,
    fetchPartnershipInvitations,
    fetchPartnershipRewards,
    confirmPartnershipReward,
  };
}
