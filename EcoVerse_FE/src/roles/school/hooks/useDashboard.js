import { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';

export function useDashboard(period = 'THIS_MONTH') {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getSchoolSummary({ period });
      setData(response.data.data);
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
    isLoading,
    error,
    refresh: fetchDashboardData
  };
}