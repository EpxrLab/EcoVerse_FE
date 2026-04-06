import { useState, useMemo, useEffect } from 'react';

export function useRewardPagination(rewardsData) {
  const [pages, setPages] = useState({
    pending: 1,
    approved: 1,
    delivered: 1,
    confirmed: 1,
    cancelled: 1,
    partnership: 1
  });

  const PAGE_SIZE = 5;

  const [searchTerm, setSearchTerm] = useState('');

  // Reset pages when searching
  useEffect(() => {
    setPages({
      pending: 1,
      approved: 1,
      delivered: 1,
      confirmed: 1,
      cancelled: 1,
      partnership: 1
    });
  }, [searchTerm]);

  const filterData = (data) => {
    if (!searchTerm || !data) return data || [];
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(r => 
      r.requestCode?.toLowerCase().includes(lowerSearch) || 
      r.student?.toLowerCase().includes(lowerSearch) ||
      r.studentCode?.toLowerCase().includes(lowerSearch) ||
      r.reward?.toLowerCase().includes(lowerSearch) ||
      r.rewardName?.toLowerCase().includes(lowerSearch)
    );
  };

  const filtered = useMemo(() => ({
    pending: filterData(rewardsData.pendingRewards),
    approved: filterData(rewardsData.approvedRewards),
    delivered: filterData(rewardsData.deliveredRewards),
    confirmed: filterData(rewardsData.confirmedRewards),
    cancelled: filterData([...(rewardsData.rejectedRewards || []), ...(rewardsData.cancelledRewards || [])]),
    partnership: filterData(rewardsData.partnershipRewards)
  }), [rewardsData, searchTerm]);

  const paged = useMemo(() => {
    const getPaged = (data, page) => {
      const start = (page - 1) * PAGE_SIZE;
      return data.slice(start, start + PAGE_SIZE);
    };

    return {
      pending: getPaged(filtered.pending, pages.pending),
      approved: getPaged(filtered.approved, pages.approved),
      delivered: getPaged(filtered.delivered, pages.delivered),
      confirmed: getPaged(filtered.confirmed, pages.confirmed),
      cancelled: getPaged(filtered.cancelled, pages.cancelled),
      partnership: getPaged(filtered.partnership, pages.partnership)
    };
  }, [filtered, pages]);

  const setPage = (key, value) => {
    setPages(prev => ({ ...prev, [key]: typeof value === 'function' ? value(prev[key]) : value }));
  };

  return {
    pages,
    setPage,
    filtered,
    paged,
    PAGE_SIZE,
    searchTerm,
    setSearchTerm,
  };
}
