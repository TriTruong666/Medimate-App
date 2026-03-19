// apis/client.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const base_net_url = process.env.EXPO_PUBLIC_NET_API_URL;

export const axiosClient = axios.create({
  baseURL: base_net_url,
});

// Tự động đính kèm Token vào tất cả các Request
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Lỗi lấy token từ SecureStore", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);