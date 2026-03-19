import axios from "axios";

const base_net_url = process.env.EXPO_PUBLIC_NET_API_URL;

export const axiosClient = axios.create({
  baseURL: base_net_url,
});
