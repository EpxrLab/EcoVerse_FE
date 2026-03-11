// Auth - Services
import rawAxios from "../../../utils/rawAxios";

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

export { getProvinces, getWards };

// Re-export auth services as needed
// export * from './auth.service';
