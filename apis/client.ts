// apis/client.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { getDefaultStore } from "jotai";

const base_net_url = process.env.EXPO_PUBLIC_NET_API_URL;
const base_rag_url = process.env.EXPO_PUBLIC_RAG_API_URL;

export const axiosClient = axios.create({
  baseURL: base_net_url,
  timeout: 15000,
});

// RAG / AI client — Python backend riêng
export const axiosRAGClient = axios.create({
  baseURL: base_rag_url,
  timeout: 30000, // AI có thể chậm hơn
});

// ── Request Interceptor: Tự động gắn Token ──────────────────────────────────
const requestInterceptor = async (config: any) => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log("Lỗi lấy token từ SecureStore", error);
  }
  return config;
};

axiosClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
axiosRAGClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));

// ── Flag chống xử lý 401 nhiều lần song song ────────────────────────────────
let _isHandling401 = false;

// ── Response Interceptor: Bắt 401 → set kickOutAtom → _layout navigate ──────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (_isHandling401) return Promise.reject(error);
      _isHandling401 = true;

      try {
        const data = error.response.data;
        let message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        if (data?.message) message = data.message;

        const isKickedOut = message.includes("thiết bị khác");

        // Xóa token khỏi storage
        await SecureStore.deleteItemAsync("accessToken");

        // Dùng lazy import để tránh circular dependency
        const { authSessionAtom, kickOutAtom } = await import("@/stores/authStore");
        const store = getDefaultStore();

        // Reset session
        store.set(authSessionAtom, undefined);

        // Gửi signal kick-out → _layout.tsx sẽ xử lý Alert + navigate
        store.set(kickOutAtom, { message, isKickedOut });
      } catch (err) {
        console.error("Lỗi xử lý 401:", err);
        _isHandling401 = false;
      }
    }

    return Promise.reject(error);
  }
);

// Alias backward compatibility
export const apiClient = axiosClient;