import axios from '@/utils/axios.customize';

export const studentService = {
    
  getStudents: (params) => {
    return axios.get('/school/students', { params });
  }
};
