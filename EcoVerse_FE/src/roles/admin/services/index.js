// Admin - Services
import axios from "../../../utils/axios.customize";

const getApprovedSchoolList = async () => {
  try {
    const res = await axios.get("/admin/schools/approved");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getPendingSchoolList = async () => {
  try {
    const res = await axios.get("/admin/schools/pending");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getApprovedPartnershipList = async () => {
  try {
    const res = await axios.get("/admin/partnerships/approved");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getPendingPartnershipList = async () => {
  try {
    const res = await axios.get("/admin/partnerships/pending");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export {
  getPendingSchoolList,
  getApprovedSchoolList,
  getApprovedPartnershipList,
  getPendingPartnershipList,
};

// Re-export admin-specific services as needed
// export * from '../features/users-management/services/usersManagement.service';
