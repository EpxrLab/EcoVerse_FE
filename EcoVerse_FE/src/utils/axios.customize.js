import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: baseUrl,
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token API
        // We use the base axios here to avoid interceptor recursion
        const res = await axios.post(`${baseUrl}/auth/refresh`, {}, {
          withCredentials: true // Important if using cookies for refresh token
        });

        if (res.data && res.data.data && res.data.data.accessToken) {
          const newToken = res.data.data.accessToken;
          
          // Update sessionStorage
          sessionStorage.setItem("accessToken", newToken);
          
          // Update default header for future requests
          instance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          
          // Update current request header and retry
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear session and redirect (optional)
        console.error("Refresh token failed:", refreshError);
        sessionStorage.clear();
        // You might want to trigger a logout or redirect to login here
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Alter defaults after instance has been created
export default instance;
