---
description: Medimate App - Cẩm nang Tạo Giao Diện Ứng dụng Uống Thuốc
---

# Kỹ năng Tạo UI cho App Nhắc Nhở Uống Thuốc (Medimate)

Tài liệu này định nghĩa hệ thống thiết kế (Design System) và quy tắc tạo giao diện cho ứng dụng **Medimate** (App nhắc nhở uống thuốc, nhắm đến người lớn tuổi). 
**TUYỆT ĐỐI KHÔNG** nhầm lẫn với các app theo dõi cảm xúc hay tâm trạng. Mọi nội dung text sinh ra phải là **Tiếng Việt**.

## 1. Ngôn ngữ Thiết kế & Thẩm mỹ

### Typography (Chữ)
- **Font chữ bắt buộc**: `Space Grotesk` (Vô cùng hiện đại, bo tròn nhẹ, rõ ràng dễ đọc).
- **Quy tắc**: Phải to, rõ ràng, phân cấp tốt vì người dùng có thể là người lớn tuổi mắt kém.
- **Trọng lượng chữ**:
  - **Extra Bold / Bold**: Dành cho Lời chào, Tên thuốc, Thời gian uống (VD: "Đến giờ uống thuốc!", "08:00 Sáng").
  - **SemiBold**: Tiêu đề thẻ, nút bấm chính.
  - **Medium / Regular**: Văn bản hướng dẫn, chi tiết liều lượng.

### Bảng màu (Color Palette)
Giao diện áp dụng phong cách Soft UI (kẹo ngọt) để giảm căng thẳng khi dùng app y tế:
- **Nền app (Background)**: Trắng kem (Off-White) `#F9F6FC` hoặc `#FFFFFF`.
- **Màu Pastel cho Thẻ (Cards)**:
  - **Xanh lá (Green)**: `#A3E6A1` (Dùng cho trạng thái Tích cực: "Đã uống", "Đúng giờ").
  - **Tím (Purple)**: `#D9AEF6` (Dùng cho Buổi tối hoặc Lịch sử).
  - **Cam (Orange)**: `#FFA07A` (Dùng cho Buổi chiều, Cảnh báo chưa uống).
  - **Vàng (Yellow)**: `#FFD700` (Dùng cho Buổi sáng trưa, Năng lượng).
  - **Xanh lơ (Blue)**: `#87CEFA` (Giấc ngủ ban đêm hoặc thông tin phụ).
- **Màu chữ và Tương phản**:
  - **Chữ chính**: Đen tuyền `#000000`.
  - **Nút bấm hành động (Primary Action)**: Nút màu đen `#000000` với chữ màu trắng `#FFFFFF` để tạo độ tương phản cực mạnh, dễ bấm.

### 1.3 Bố cục & Hình khối (Neo-Brutalism Hybrid)
Giao diện kết hợp giữa **Soft UI** (mềm mại) và **Neo-Brutalism** (táo bạo, hiện đại):
- **Cấu trúc Bento Grid**: Sử dụng thẻ (card) hình vuông và chữ nhật xen kẽ.
- **Đặc điểm thẻ (Thẻ Neo-Brutalism)**:
  - **Viền (Borders)**: Bắt buộc sử dụng viền đen dày (`border-2 border-black`) cho các card chính, input và nút bấm.
  - **Bo góc (Border Radius)**: 
    - **Nút bấm chính & Card lớn**: Bo góc `rounded-[24px]`.
    - **Ô nhập liệu (Inputs) & Card phụ**: Bo góc `rounded-2xl` (16px).
    - **Hạn chế**: Không lạm dụng `rounded-full` hoặc `rounded-[32px]` vì sẽ làm mất đi độ "cứng" cần thiết của phong cách Neo-Brutalism.
- **Đổ bóng (Shadow)**: Dùng shadow sắc nét (`shadow-sm` hoặc `shadow-md`) kết hợp với viền đen.

---

## 2. Thông số Các Component & Typography

### 2.1 Tiêu đề & Văn bản (Typography)
- **Tiêu đề chính (Page Title)**: Tối đa `text-4xl`, `font-space-bold`. Tránh dùng `text-5xl` quá to gây mất cân đối.
- **Nhãn Input (Labels)**: Sử dụng font nhỏ, viết hoa: `text-xs font-space-bold mb-2 ml-1 uppercase`.
- **Nội dung phụ**: Dùng `text-sm` hoặc `text-xs`, màu `text-gray-500` hoặc `font-space-medium`.

### 2.2 Ô nhập liệu (Input Fields)
- **Style**: `flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1`.
- **Input Text**: `h-12 ml-3 font-space-bold text-black`.

### 2.3 Nút hành động chính (Primary Action Button)
- **Màu sắc**: Màu xanh lá Pastel `bg-[#A3E6A1]`.
- **Style**: `w-full py-4 rounded-[24px] border-2 border-black flex-row items-center justify-center shadow-md`.
- **Text**: `text-black text-lg font-space-bold uppercase`.

### 2.4 Nút quay lại (Back Button)
- **Style**: `w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm`.

---

## 3. Quy tắc Triển khai (NativeWind First)
1. **Bắt buộc dùng `className`**: Mọi thuộc tính style phải đưa vào Tailwind class.
2. **Màu sắc**: Ưu tiên mã HEX trực tiếp: `bg-[#A3E6A1]` (Xanh), `bg-[#D9AEF6]` (Tím), `bg-[#FFA07A]` (Cam).
3. **Độ lớn vùng chạm**: Đảm bảo chiều cao tối thiểu cho nút và input là `h-12` (với input) hoặc `py-4` (với nút).
4. **Ngôn ngữ**: Toàn bộ nội dung hiển thị phải là **Tiếng Việt**.
