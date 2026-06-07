// In dev, Vite proxies /api → localhost:8000, so base is empty.
// In production, set VITE_API_URL=https://your-backend.railway.app
const base = import.meta.env.VITE_API_URL ?? "";
export const API_URL = base.replace(/\/$/, "");
