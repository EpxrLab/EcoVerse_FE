// Admin - Services
import axios from "../../../utils/axios.customize";

const uploadIconImage = async (formData) => {
  try {
    const res = await axios.post("/files/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const uploadModel3D = async (formData) => {
  try {
    const res = await axios.post("/files/upload/model", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

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

const toggleActiveAccount = async (id, payload) => {
  try {
    const res = await axios.put(`/admin/de-active/user/${id}`, payload);
    return res.data;
  } catch (error) {
    console.log(error.response.data.message);
  }
};

//=======================Subscription Management==========================

const getAllSubscriptionPackages = async () => {
  try {
    const res = await axios.get("/subscription-plans?page=0&size=10");
    return res.data.data.content;
  } catch (error) {
    console.log(error);
  }
};

const addNewSubscriptionPackage = async (payload) => {
  try {
    const res = await axios.post("/subscription-plans", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const toggleSubsciptionActive = async (id) => {
  try {
    const res = await axios.patch(`/subscription-plans/${id}/toggle-active`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updateSubscriptionPackage = async (id, payload) => {
  try {
    const res = await axios.put(`/subscription-plans/${id}`, payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteSubsciptionPackage = async (id) => {
  try {
    const res = await axios.delete(`/subscription-plans/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

//========================WASTE-ITEM & SUB-CATEGORIES=======================
const getAllWasteItems = async () => {
  try {
    const res = await axios.get("/admin/waste-items");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const addWasteItem = async (payload) => {
  try {
    const res = await axios.post("/admin/waste-items", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updateWasteItem = async (id, payload) => {
  try {
    const res = await axios.put(`/admin/waste-items/${id}`, payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteWasteItem = async (id) => {
  try {
    const res = await axios.delete(`/admin/waste-items/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getAllSubWasteCategories = async () => {
  try {
    const res = await axios.get("/admin/waste-sub-categories");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const addNewSubWasteCategory = async (payload) => {
  try {
    const res = await axios.post("/admin/waste-sub-categories", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updateSubWasteCategory = async (id, payload) => {
  try {
    const res = await axios.put(`/admin/waste-sub-categories/${id}`, payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteSubWasteCategory = async (id) => {
  try {
    const res = await axios.delete(`/admin/waste-sub-categories/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
//===========================GAME TYPES AND GAME LEVELS===============
const getAllGameTypes = async () => {
  try {
    const res = await axios.get("/admin/game-types");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const addNewGameType = async (payload) => {
  try {
    const res = await axios.post("/admin/game-types", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updateGameType = async (id, payload) => {
  try {
    const res = await axios.put(`/admin/game-types/${id}`, payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteGameType = async (id) => {
  try {
    const res = await axios.delete(`/admin/game-types/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getAllGameLevels = async (gameId) => {
  try {
    const res = await axios.get(`/admin/game-types/${gameId}/presets`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const addNewGameLevel = async (gameId, payload) => {
  try {
    const res = await axios.post(
      `/admin/game-types/${gameId}/presets`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updateGameLevel = async (gameId, id, payload) => {
  try {
    const res = await axios.put(
      `/admin/game-types/${gameId}/presets/${id}`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteGameLevel = async (gameId, id) => {
  try {
    const res = await axios.delete(`/admin/game-types/${gameId}/presets/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

//====================Get Transactions Analytics===============
const getAllTransactions = async () => {
  try {
    const res = await axios.get("/subscriptions/admin/all?page=0&size=10");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export {
  uploadModel3D,
  uploadIconImage,
  getAllSchoolAccounts,
  getAllPartnershipAccounts,
  updateSchoolAccountStatus,
  updatePartnershipAccountStatus,
  toggleActiveAccount,
  getAllSubscriptionPackages,
  addNewSubscriptionPackage,
  toggleSubsciptionActive,
  updateSubscriptionPackage,
  deleteSubsciptionPackage,
  getAllWasteItems,
  addWasteItem,
  updateWasteItem,
  deleteWasteItem,
  getAllSubWasteCategories,
  addNewSubWasteCategory,
  updateSubWasteCategory,
  deleteSubWasteCategory,
  getAllGameTypes,
  addNewGameType,
  updateGameType,
  deleteGameType,
  getAllGameLevels,
  addNewGameLevel,
  updateGameLevel,
  deleteGameLevel,
  getAllTransactions,
};
