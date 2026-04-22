import axios from '@/utils/axios.customize';

export const paymentService = {
    /**
     * Cancel a payment transaction
     * @param {string} orderCode - The code of the order to cancel
     * @returns {Promise}
     */
    cancelPayment: (orderCode) => {
        return axios.post(`/payments/cancel/${orderCode}`);
    }
};
