import { useState, useEffect } from 'react';
import { partnershipReportService } from '../services/partnershipReport.service';

export const usePartnershipDashboard = () => {
    const [stats, setStats] = useState({
        totalCampaignsCreated: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalSchoolsParticipated: 0,
        totalStudentsReached: 0,
        avgParticipantAccuracy: 0,
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: '',
        subscriptionPlanName: '',
        topSchoolsByParticipation: [],
        period: 'THIS_MONTH'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async (period = 'THIS_MONTH') => {
        setIsLoading(true);
        try {
            const response = await partnershipReportService.getPartnershipSummary({ period });
            setStats(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch partnership stats:', err);
            setError('Không thể tải dữ liệu thống kê');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return {
        stats,
        isLoading,
        error,
        refreshStats: fetchStats
    };
};
