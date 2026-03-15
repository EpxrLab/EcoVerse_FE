import axios from '@/utils/axios.customize';

export const classesService = {
  getAccounts: () => {
    return axios.get('/school/accounts');
  },

  addStudent: (data) => {
    return axios.post('/school/add-student', data);
  },

  updateStudent: (studentId, data) => {
    return axios.put(`/school/update/students/${studentId}`, data);
  },

  importAccounts: (formData, onProgress) => {
    return axios.post('/school/import/account', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({ step: 'uploading', done: percentCompleted, total: 100 });
        }
      }
    });
  },

  sendCredentials: (data) => {
    return axios.post('/school/send-credentials', data);
  },

  toggleStudentStatus: (studentId, isBlocked) => {
    return axios.put(`/school/de-active/student/${studentId}`, isBlocked, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  deleteStudent: (studentId) => {
    return axios.delete(`/school/students/${studentId}`);
  }
};
