import axios from '@/utils/axios.customize';

export const partnershipReportService = {
    getPartnershipSummary: (params) => {
        return axios.get('/report/partnership/summary', { params });
    },

    getPartnershipCampaigns: (params) => {
        return axios.get('/report/partnership/campaigns', { params });
    }
};
