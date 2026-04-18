import { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';
import { subscriptionService } from '../services/subscription.service';

export function useDashboard(period = 'THIS_MONTH') {
  const [data, setData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, subRes] = await Promise.all([
        reportService.getSchoolSummary({ period }),
        subscriptionService.getMySubscription()
      ]);
      setData(summaryRes.data.data);
      setSubscription(subRes.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  return {
    data,
    subscription,
    isLoading,
    error,
    refresh: fetchDashboardData
  };
}