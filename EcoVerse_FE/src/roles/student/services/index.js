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

const getCurrentRoundContent = async (campaignId) => {
  try {
    const res = await axios.get(
      `/student/campaigns/${campaignId}/current-round-content`,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const startQuiz = async (campaignId, roundId, quizId) => {
  try {
    const res = await axios.post(
      `/student/quiz/campaigns/${campaignId}/rounds/${roundId}/quizzes/${quizId}/start`,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const submitQuiz = async (attemptId, payload) => {
  try {
    const res = await axios.post(
      `/student/quiz/quiz-attempts/${attemptId}/submit`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getAttemptResult = async (attemptId) => {
  try {
    const res = await axios.get(
      `/student/quiz/quiz-attempts/${attemptId}/result`,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const startGame = async (campaignId, roundId, configId, levelNumber) => {
  try {
    const res = await axios.post(
      `/student/game/campaigns/${campaignId}/rounds/${roundId}/configs/${configId}/start?levelNumber=${levelNumber}`,
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const submitGame = async (sessionId, payload) => {
  try {
    const res = await axios.post(
      `/student/game/sessions/${sessionId}/submit`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getMyRewardDeliveries = async () => {
  try {
    const res = await axios.get("/rewards/deliveries/my");
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
  getCurrentRoundContent,
  startQuiz,
  submitQuiz,
  getAttemptResult,
  startGame,
  submitGame,
  getMyRewardDeliveries,
};
