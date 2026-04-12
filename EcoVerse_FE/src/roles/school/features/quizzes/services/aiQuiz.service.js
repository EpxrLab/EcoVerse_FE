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
     * Confirms and saves the generated quiz to the database
     * @param {Object} data
     * @param {string} data.aiGenerationLogId
     * @param {Array} data.questions
     */
    confirmQuiz: (data) => {
        return axios.post('/quiz/ai/confirm', data);
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
