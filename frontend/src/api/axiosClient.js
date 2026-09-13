import axios from "axios";

const PRODUCTION_API = "https://skillhub-ljz1.onrender.com";
const LOCAL_API = "http://localhost:8080";

function resolveApiUrl() {
    const raw = String(import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
    const fallback = import.meta.env.PROD ? PRODUCTION_API : LOCAL_API;

    if (!raw) return fallback;
    if (!/^https?:\/\//i.test(raw)) return fallback;
    if (/vercel\.app$/i.test(new URL(raw).host)) return fallback;
    return raw;
}

export const apiBaseUrl = resolveApiUrl();

const axiosClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosClient;
