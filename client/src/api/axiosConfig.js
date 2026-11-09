import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "/api", // use Vite dev proxy or same-origin in production
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach token automatically if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and extract data from new format
api.interceptors.response.use(
  (response) => {
    // If the response has the new success/data format, return the data
    if (response.data && response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    // Otherwise return the full response data
    return response.data;
  },
  (error) => {
    // Handle auth errors globally
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      window.dispatchEvent(new Event("userUpdated"));
    }
    
    // Extract error message from new format if available
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

export default api;
