import axios from '@/utils/axios.customize';

export const reportService = {
    getSchoolSummary: (params) => {
        return axios.get('/report/school/summary', { params });
    },

    getSchoolStudents: (params) => {
        return axios.get('/report/school/students', { params });
    },

    getSchoolCampaigns: (params) => {
        return axios.get('/report/school/campaigns', { params });
    }
};
