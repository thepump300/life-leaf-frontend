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

// Normalise error responses — attach response data to the error so callers can inspect it
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    const err = new Error(message);
    err.data  = error.response?.data || {};
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

// ── Auth API ──────────────────────────────────────────────────────────
export const authAPI = {
  register: async (data) => {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },
  verifyEmail: async (data) => {
    const res = await api.post("/api/auth/verify-email", data);
    return res.data;
  },
  resendOTP: async (email) => {
    const res = await api.post("/api/auth/resend-otp", { email });
    return res.data;
  },
  login: async (data) => {
    const res = await api.post("/api/auth/login", data);
    return res.data;
  },
  googleAuth: async (access_token) => {
    const res = await api.post("/api/auth/google", { access_token });
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post("/api/auth/forgot-password", { email });
    return res.data;
  },
  resetPassword: async (data) => {
    const res = await api.post("/api/auth/reset-password", data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get("/api/auth/me");
    return res.data;
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};

// ── Profile API ───────────────────────────────────────────────────────
export const profileAPI = {
  /** Get current user profile */
  getProfile: async () => {
    const res = await api.get("/api/profile");
    return res.data;
  },
  /** Create profile + generate QR ID */
  setup: async (data) => {
    const res = await api.post("/api/profile/setup", data);
    return res.data;
  },
  /** Update existing profile fields */
  update: async (data) => {
    const res = await api.put("/api/profile/update", data);
    return res.data;
  },
};

// ── QR API ────────────────────────────────────────────────────────────
export const qrAPI = {
  /** Public — fetch vehicle info by qrId (no auth required) */
  getByQrId: async (qrId) => {
    const res = await api.get(`/api/qr/${qrId}`);
    return res.data;
  },
  /** Protected — regenerate QR (invalidates old one) */
  regenerate: async () => {
    const res = await api.post("/api/qr/regenerate");
    return res.data;
  },
};

// ── Incident API ──────────────────────────────────────────────────────
export const incidentAPI = {
  /** Public — report a parking or accident incident */
  report: async ({ qrId, type, location, note }) => {
    const res = await api.post("/api/incidents/report", {
      qrId,
      type,
      location,
      note,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  },
  /** Protected — get logged-in user's incident history */
  getMyIncidents: async () => {
    const res = await api.get("/api/incidents/my");
    return res.data;
  },
  /** Protected — mark an incident as resolved */
  resolve: async (id) => {
    const res = await api.put(`/api/incidents/${id}/resolve`);
    return res.data;
  },
};

// ── Dashboard API ─────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: async () => {
    const res = await api.get("/api/dashboard/stats");
    return res.data;
  },
};

export default api;
