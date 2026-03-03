import axios from "axios";

// ── Axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise error responses so callers always get a plain message string
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ── Auth API ──────────────────────────────────────────────────────────
export const authAPI = {
  /**
   * Register a new user.
   * @param {{ name: string, email: string, password: string }} data
   * @returns {{ token: string, user: { id, name, email } }}
   */
  register: async (data) => {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },

  /**
   * Login an existing user.
   * @param {{ email: string, password: string }} data
   * @returns {{ token: string, user: { id, name, email } }}
   */
  login: async (data) => {
    const res = await api.post("/api/auth/login", data);
    return res.data;
  },

  /**
   * Get the currently authenticated user (requires token in localStorage).
   * @returns {{ user: { id, name, email } }}
   */
  getMe: async () => {
    const res = await api.get("/api/auth/me");
    return res.data;
  },

  /** Remove stored token (client-side logout) */
  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
  },
};

export default api;
