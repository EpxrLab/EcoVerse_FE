import { useState } from 'react';
import { 
  pendingRewardsData, 
  completedRewardsData, 
  cancelledRewardsData,
  marketplaceItemsData,
  rewardStats,
  topRewardsData,
  statusDistributionData,
  partnershipRewardsData
} from '../../../data/reward.data';

export function useRewards() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  const [partnershipRewards, setPartnershipRewards] = useState(partnershipRewardsData);

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
      
      // Simulate parent confirmation for demo purposes if clicked again? 
      // Or just leave it. User request implies a flow. 
      // "phụ huynh xác nhận... thì mới hiện đã hoàn thành"
      // I will add a transition from 'given' to 'collected' just in case I need to simulate it, 
      // but UI might not expose it to School Admin. 
      // For now I'll just do the requested change.

      return reward;
    }));
  };

  return {
    pendingRewards: pendingRewardsData,
    completedRewards: completedRewardsData,
    cancelledRewards: cancelledRewardsData,
    marketplaceItems: marketplaceItemsData,
    stats: rewardStats,
    topRewards: topRewardsData,
    statusDistribution: statusDistributionData,
    partnershipRewards, // Return state
    confirmPartnershipReward, // Return handler
    searchTerm,
    setSearchTerm,
    isAddItemOpen,
    setIsAddItemOpen,
  };
}