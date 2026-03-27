---
description: Medimate App - Giải quyết các lỗi Navigation & Runtime (Troubleshooting)
---

# Kỹ năng Giải quyết lỗi Navigation & Runtime (Medimate)

Tài liệu này tổng hợp các lỗi phổ biến và cách khắc phục triệt để trong dự án Medimate, đảm bảo ứng dụng luôn chạy ổn định và mượt mà.

## 1. Lỗi: "Couldn't find a navigation context"

Đây là lỗi phổ biến nhất khi sử dụng **Expo Router** kết hợp với các logic re-render phức tạp.

### Triệu chứng
*   Ứng dụng crash ngay lập tức khi tương tác (ví dụ: nhấn vào một ngày trong lịch).
*   Thông báo lỗi: `Error: Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?`
*   Mặc dù ứng dụng đã có `_layout.tsx` chuẩn, nhưng một số component vẫn báo thiếu context.

### Nguyên nhân (Root Cause)
1.  **NativeWind Re-render Issue**: Khi dùng `className` kết hợp với các hiệu ứng chuyển động (`translate`, `scale`, `shadow`) trên các component có logic state dày đặc (như Date Picker), NativeWind có thể gây ra xung đột trong quá trình tính toán lại style, làm mất context của Navigation tại thời điểm đó.
2.  **State Object Reference**: Sử dụng Object (như `dayjs` object) làm state trực tiếp thay vì String có thể gây ra các chu kỳ re-render không cần thiết.

### Giải pháp khắc phục (Standard Fix)
1.  **Sử dụng Inline Styles cho Interactive Logic**: Đối với các màn hình có logic tương tác cao (Calendar, Slider, Complex Toggles), hãy chuyển từ `className` sang **Inline Styles** (`style={{...}}`) cho các component liên quan trực tiếp đến state change.
2.  **Stringified State**: Lưu trữ ngày tháng hoặc các ID dưới dạng `string` (VD: `2026-03-27`) thay vì object. Chỉ convert sang `dayjs()` hoặc `Date()` khi cần hiển thị.
3.  **Explicit Layout Registration**: Đảm bảo file màn hình được đăng ký tường minh trong `<Stack.Screen name="..." />` tại `_layout.tsx` gần nhất.
4.  **Safe Navigation Call**: Nếu lỗi xảy ra khi gọi `router.push`, hãy bọc lệnh điều hướng trong một `setTimeout(() => router.push(...), 0)` để đảm bảo render cycle của component hiện tại đã hoàn tất.

---

## 2. Quy tắc "Safe-UI" cho Logic Phức tạp

Khi xây dựng các tính năng như Lịch (Calendar) hoặc Bộ lọc (Filters):

*   **Priority 1**: Luôn ưu tiên độ ổn định (Stability) hơn là sự tiện lợi của Tailwind. Nếu một component có > 3 state thay đổi liên tục, hãy dùng Inline Styles.
*   **Priority 2**: Sử dụng `useMemo` cho các mảng dữ liệu tính toán từ ngày tháng (như danh sách ngày trong tuần/tháng) để tránh tính toán lại vô ích.
*   **Priority 3**: Thêm `console.log` vào các hàm `onPress` quan trọng để theo dõi flow dữ liệu, giúp debug nhanh khi có crash.

---

*(Tài liệu này sẽ liên tục được cập nhật khi phát hiện lỗi mới)*
