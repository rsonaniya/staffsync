import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";
// const API_BASE_URL = "https://stafsync-api.onrender.com";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Inject bearer token if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Global handler for 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage and reload to force user back to login safely
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_profile");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
