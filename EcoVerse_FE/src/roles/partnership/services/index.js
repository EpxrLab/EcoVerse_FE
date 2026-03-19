import axios from "../../../utils/axios.customize";

const getAuthenticatedPartnership = async () => {
  try {
    const res = await axios.get("/profile/partnership");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const updatePartnershipProfile = async (payload) => {
  try {
    const res = await axios.put(`/profile/partnership`, payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export { getAuthenticatedPartnership, updatePartnershipProfile };
