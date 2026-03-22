---
description: Medimate App - Xử lý dữ liệu và Feedback (Data Handling & API Feedback)
---

# Kỹ năng Xử lý Data & Feedback

Tài liệu này định nghĩa quy chuẩn xử lý dữ liệu (Data Handling) trong Medimate App, từ bước người dùng nhập liệu cho đến khi nhận kết quả từ API. Nó đảm bảo trải nghiệm người dùng (UX) mượt mà và an toàn.

## 1. Validation (Kiểm tra dữ liệu đầu vào)

**Tuyệt đối không đẩy raw data thẳng lên API mà không qua kiểm tra cục bộ (Client-side Validation).**

- **Tách riêng logic**: Mọi logic kiểm tra (Regex, độ dài, tính bắt buộc) phải được viết thành các hàm trong thư mục tĩnh, ví dụ: `common/validation.ts`. Hàm trả về một object có cấu trúc: `{ isValid: boolean, message: string }`.
- **Thực thi trước Mutation**: Trong hàm xử lý sự kiện (vd: `handleLogin`, `onSubmit`), gọi hàm validate đầu tiên. Nếu `isValid` là `false`, chặn gọi API và hiển thị lỗi.
- **Tự động làm sạch**: Hãy dùng `.trim()` để loại bỏ khoảng trắng thừa ở đầu/cuối của các trường text như email, username trước khi validate hoặc gửi đi.

## 2. Thông báo - User Feedback (Sử dụng Toast)

**Tuyệt đối KHÔNG SỬ DỤNG `Alert.alert` mặc định của hệ thống.**

Medimate dùng hệ thống **Toast** custom (`stores/toastStore.ts`) với giao diện Neo-Brutalism đã được tối ưu.
- **Import**: `import { useToast } from "@/stores/toastStore";`
- **Khởi tạo**: `const toast = useToast();`

### Khi nào dùng loại Toast nào?
- **Validation lỗi (Client-side)**: Báo ngay cho user khi họ nhập thiếu/sai.
  - `toast.error("Lỗi nhập liệu", "Vui lòng nhập Email hợp lệ.");`
- **Thành công (API Success)**: Khi Data Mutation thành công. Tùy ngữ cảnh có thể có hoặc không cần thông báo nếu UI trực quan tự thay đổi. Nhưng với các hành động quan trọng (Đăng nhập, Lưu dữ liệu), nên có:
  - `toast.success("Đăng nhập thành công", "Chào mừng bạn quay trở lại!");`
- **Lỗi từ Server (API Error)**: Bắt lỗi từ Backend và hiển thị cho user. Chú ý lấy `error.message` hoặc `res.message` từ server nếu có.
  - `toast.error("Đã xảy ra lỗi", res.message || "Tài khoản hoặc mật khẩu không đúng.");`

## 3. Xử lý trong React Query Hooks (Data Mutations)

Logic xử lý kết quả API (Thành công/Thất bại, Điều hướng, Xóa cache) phải được đặt trong phần Hooks, **KHÔNG ĐẶT** trực tiếp trong UI Component.

- **onSuccess**:
  - Lưu token (nếu có) bằng `SecureStore`.
  - Làm mới dữ liệu cache (Invalidate queries) để UI cập nhật: `queryClient.invalidateQueries({ queryKey: ["target_key"] });`
  - Hiển thị Toast thành công.
  - Điều hướng người dùng (Routing) đến màn hình tiếp theo bằng `router.push('/path')` hoặc `router.replace('/path')` (nếu không muốn back lại).
- **onError**:
  - Bắt lỗi mạng hoặc HTTP error.
  - Hiển thị Toast cảnh báo lõi.

## 4. Trạng thái Loading (UX)

- Luôn bind biến `isPending` (hoặc `isLoading`) từ React Query vào nút bấm hoặc UI để vô hiệu hóa (disable) tương tác của người dùng trong lúc đợi.
- Sử dụng `<ActivityIndicator color="black" />` thay cho text khi đang xử lý để user biết app vẫn đang hoạt động.
- Dùng thuộc tính `opacity-70` cùng `disabled` khi nút đang trong trạng thái loading.

## 5. Xử lý Trạng thái UI dạng Danh sách (List Data State Handling)

Khi hiển thị dữ liệu dạng danh sách (List) lấy từ API, **BẮT BUỘC** phải xử lý đầy đủ 3 trạng thái cơ bản sau để đảm bảo trải nghiệm người dùng tối ưu:

1. **Trạng thái Đang tải (`isLoading`)**:
   - Hiển thị `<ActivityIndicator>` kết hợp với văn bản giải thích rõ ràng như "Đang tải dữ liệu...". Có thể căn giữa không gian bằng padding/margin.
2. **Trạng thái Lỗi (`isError`)**:
   - Khi API gặp sự cố (mất mạng, server lỗi), hiển thị một thẻ (Card) cảnh báo với phong cách Neo-Brutalism (viền đứt khúc, màu nền cảnh báo `#FFA07A` trên icon).
   - **BẮT BUỘC** phải cung cấp một nút bấm **"Thử lại" (Retry)** kết nối trực tiếp với hàm `refetch()` của React Query để người dùng có thể tải lại dữ liệu mà không cần tải lại toàn bộ app.
3. **Trạng thái Rỗng (`isEmpty` - `data.length === 0`)**:
   - Khi dữ liệu trả về thành công nhưng mảng trống, hiển thị một khung (Card) với viền nét đứt (dashed), background nhạt, kèm một icon mờ nhạt minh họa.
   - Nội dung thông báo phải mang tính chất điều hướng, ví dụ: "Chưa có dữ liệu nào. Hãy bắt đầu bằng cách tạo mới!" để kích thích người dùng thao tác tiếp theo. Cấm để màn hình trắng trơn.
