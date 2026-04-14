import axios from '@/utils/axios.customize';

export const aiQuizService = {
    /**
     * Generates a quiz using AI
     * @param {Object} data 
     * @param {string} data.campaignId
     * @param {string} data.roundId
     * @param {number} data.questionCount
     * @param {number} data.targetGrade
     * @param {number} data.coinsOnPass
     * @param {number} data.timePerQuestion
     * @param {string[]} data.fileIds
     */
    generateQuiz: (data) => {
        return axios.post('/quiz/ai/generate', data);
    },

    /**
     * Confirms and saves the generated quiz using the manual creation API
     * @param {Object} data - The manual quiz payload
     */
    confirmQuiz: (data) => {
        return axios.post('/quiz/manual', data);
    },

    /**
     * Uploads a document for AI to process
     * @param {File} file 
     */
    uploadDocument: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post('/files/upload/document', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Gets the user's uploaded files
     */
    getMyFiles: () => {
        return axios.get('/files/my', {
            params: {
                page: 0,
                size: 100
            }
        });
    }
};
