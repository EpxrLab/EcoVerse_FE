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

const sendOTPVerification = async (payload) => {
  try {
    const res = await axios.post("/auth/register", payload);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
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
    const res = await axios.post("/files/upload/contract", formData, {
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

const partnershipRegister = async (payload) => {
  try {
    const res = await axios.post("/auth/verify-register/partnership", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const loginFunction = async (payload) => {
  try {
    const res = await axios.post("/auth/login", payload);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    return error.response?.data;
  }
};

const logoutFunction = async () => {
  try {
    const res = await axios.post("/auth/logout");
    sessionStorage.clear();
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const changePassword = async (payload) => {
  try {
    const res = await axios.put("/auth/change-password", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const sendOtpResetPass = async (payload) => {
  try {
    const res = await axios.post("/auth/forgot-password", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (payload) => {
  try {
    const res = await axios.post("/auth/verify-reset-password", payload);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const refreshTokenFunction = async (refreshToken) => {
  try {
    const res = await axios.post("/auth/refresh", { refreshToken });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export {
  getProvinces,
  getWards,
  verifyOTP,
  uploadFile,
  sendOTPVerification,
  schoolRegister,
  partnershipRegister,
  loginFunction,
  logoutFunction,
  changePassword,
  sendOtpResetPass,
  resetPassword,
  refreshTokenFunction,
};

// Re-export auth services as needed
// export * from './auth.service';
