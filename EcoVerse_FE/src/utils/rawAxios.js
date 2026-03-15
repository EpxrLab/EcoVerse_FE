import axios from "axios";

const publicAxios = axios.create({
  timeout: 10000,
});

export default publicAxios;
