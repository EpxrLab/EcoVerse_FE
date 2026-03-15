// Admin - Services
import axios from "../../../utils/axios.customize";

//========================Account Management==============================

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

//=======================Subscription Management==========================

const getAllSubscriptionPackages = async () => {
  try {
    const res = await axios.get("/admin/subscription-plans?page=0&size=10");
    return res.data.data.content;
  } catch (error) {
    console.log(error);
  }
};

const addNewSubscriptionPackage = async (payload) => {
  try {
    const res = await axios.post("/admin/subscription-plans", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const toggleSubsciptionActive = async (id) => {
  try {
    const res = await axios.patch(
      `admin/subscription-plans/${id}/toggle-active`,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updateSubscriptionPackage = async (id, payload) => {
  try {
    const res = await axios.put(`/admin/subscription-plans/${id}`, payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteSubsciptionPackage = async (id) => {
  try {
    const res = await axios.delete(`/admin/subscription-plans/${id}`);
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
  getAllSubscriptionPackages,
  addNewSubscriptionPackage,
  toggleSubsciptionActive,
  updateSubscriptionPackage,
  deleteSubsciptionPackage,
};

// Re-export admin-specific services as needed
// export * from '../features/users-management/services/usersManagement.service';
