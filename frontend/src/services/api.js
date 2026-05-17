import axios from "axios";

// ✅ Backend URL hardcoded
const BASE_URL = "https://candidate-shortlisting-system-ojfp.onrender.com/api";

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