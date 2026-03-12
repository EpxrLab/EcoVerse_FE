// Auth - Services
import rawAxios from "../../../utils/rawAxios";
import axios from "../../../utils/axios.customize";

const getProvinces = async () => {
  try {
    const res = await rawAxios.get("https://provinces.open-api.vn/api/v2/");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getWards = async () => {
  try {
    const res = await rawAxios.get("https://provinces.open-api.vn/api/v2/w/");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const schoolRegisterEmail = async (payload) => {
  try {
    const res = await axios.post("/auth/register", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export { getProvinces, getWards, schoolRegisterEmail };

// Re-export auth services as needed
// export * from './auth.service';
