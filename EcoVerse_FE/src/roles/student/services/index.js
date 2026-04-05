import axios from "../../../utils/axios.customize";

const getAuthenticatedStudentProfile = async () => {
  try {
    const res = await axios.get("/profile/student");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getAllRewards = async () => {
  try {
    const res = await axios.get("/school/rewards/student");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const createRewardRequest = async (payload) => {
  try {
    const res = await axios.post("/rewards/requests", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getAllMyRequests = async () => {
  try {
    const res = await axios.get("/rewards/requests/my");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const cancelMyRequest = async (id) => {
  try {
    const res = await axios.put(`/rewards/requests/${id}/cancel`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getAllCampaigns = async () => {
  try {
    const res = await axios.get("student/campaigns");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getCampaignDetails = async (id) => {
  try {
    const res = await axios.get(`/student/campaigns/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export {
  getAuthenticatedStudentProfile,
  getAllRewards,
  createRewardRequest,
  getAllMyRequests,
  cancelMyRequest,
  getAllCampaigns,
  getCampaignDetails,
};
