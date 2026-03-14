// Admin - Services
import axios from "../../../utils/axios.customize";

const getAllSchoolAccounts = async () => {
  try {
    const res = await axios.get("/admin/schools");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getAllPartnershipAccounts = async () => {
  try {
    const res = await axios.get("/admin/partnerships");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updateSchoolAccountStatus = async (schoolId, payload) => {
  try {
    const res = await axios.put(`/admin/schools/${schoolId}/approve`, payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updatePartnershipAccountStatus = async (partnershipId, payload) => {
  try {
    const res = await axios.put(
      `/admin/partnerships/${partnershipId}/approve`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export {
  getAllSchoolAccounts,
  getAllPartnershipAccounts,
  updateSchoolAccountStatus,
  updatePartnershipAccountStatus,
};

// Re-export admin-specific services as needed
// export * from '../features/users-management/services/usersManagement.service';
