import axios from "axios";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  (isLocalhost
    ? "http://localhost:3000/api"
    : "https://posto-meu-padim-api.onrender.com/api");

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;