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
  register: async (data) => {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post("/api/auth/login", data);
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
};

// ── Incident API ──────────────────────────────────────────────────────
export const incidentAPI = {
  /** Public — report a parking or accident incident */
  report: async ({ qrId, type, location }) => {
    const res = await api.post("/api/incidents/report", {
      qrId,
      type,
      location,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  },
  /** Protected — get logged-in user's incident history */
  getMyIncidents: async () => {
    const res = await api.get("/api/incidents/my");
    return res.data;
  },
};

export default api;
