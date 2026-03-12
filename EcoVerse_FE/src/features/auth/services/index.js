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

const verifyOTP = async (payload) => {
  try {
    const res = await axios.post("/auth/verify-otp", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const uploadFile = async (formData) => {
  try {
    const res = await axios.post("/files/upload/cloudinary", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const schoolRegister = async (payload) => {
  try {
    const res = await axios.post("/auth/verify-register/school", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const schoolLogin = async (payload) => {
  try {
    const res = await axios.post("/auth/login", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export {
  getProvinces,
  getWards,
  verifyOTP,
  uploadFile,
  schoolRegisterEmail,
  schoolRegister,
  schoolLogin,
};

// Re-export auth services as needed
// export * from './auth.service';
