import axios from "axios";
import { TOKEN_KEY } from "../constants/auth";

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE || "http://118.178.169.23:38080/api/admin";

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isLoginRequest = (config.method || "get").toLowerCase() === "post" && config.url === "/sessions";
  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function unwrap(promise) {
  const { data } = await promise;
  if (data && typeof data.success === "boolean") {
    if (!data.success) {
      throw new Error(data.message || "请求失败");
    }
    return data.data;
  }
  return data;
}
