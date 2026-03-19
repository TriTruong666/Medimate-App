import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "../global.css"; // Chỉ import css ở file Root này

// Đưa QueryClient ra ngoài để không bị re-render liên tục trên Mobile
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Thêm screenOptions={{ headerShown: false }} để tắt thanh tiêu đề màu trắng ở trên cùng */}
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}