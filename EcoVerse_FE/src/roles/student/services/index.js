import axios from "../../../utils/axios.customize";

const getAuthenticatedStudentProfile = async () => {
  try {
    const res = await axios.get("/profile/student");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export { getAuthenticatedStudentProfile };

// Re-export student-specific services as needed
// export * from '../features/dashboard/services/dashboard.service';
