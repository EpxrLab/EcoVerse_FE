import { getProvinces, getWards } from "../services";

let VIETNAM_PROVINCES = null;
let VIETNAM_WARDS = null;

const fetchVietNamProvinces = async () => {
  try {
    if (VIETNAM_PROVINCES) return VIETNAM_PROVINCES;

    const data = await getProvinces();
    VIETNAM_PROVINCES = data;
  } catch (error) {
    console.log(error);
  }
};

const fetchVietNamWards = async () => {
  try {
    if (VIETNAM_WARDS) return VIETNAM_WARDS;

    const data = await getWards();
    VIETNAM_WARDS = data;
  } catch (error) {
    console.log(error);
  }
};

export { fetchVietNamProvinces, fetchVietNamWards };
