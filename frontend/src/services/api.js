// frontend/src/services/api.js
// IMPORTANT:
// - In development: Vite proxies /api → localhost:5000 (see vite.config.js)
// - In production (Render): VITE_API_URL env var points to the Render backend URL

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("talentlens_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    // If 401 and not on auth pages, token expired — clear storage
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("talentlens_token");
      localStorage.removeItem("talentlens_user");
      window.location.href = "/login";
    }
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const candidateAPI = {
  getAll: (params = {}) => api.get("/candidates", { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post("/candidates", data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
  seed: () => api.post("/candidates/seed"),
};

export const matchAPI = {
  match: (data) => api.post("/match", data),
};

export const aiAPI = {
  shortlist: (data) => api.post("/ai/shortlist", data),
  generateQuestions: (data) => api.post("/ai/questions", data),
};

export default api;
