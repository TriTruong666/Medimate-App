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
- **Cấu trúc Bento Grid**: Sử dụng thẻ (card) hình vuông và chữ nhật xen kẽ giống như khay bento.
- **Đặc điểm thẻ (Thẻ Neo-Brutalism)**:
  - **Màu nền**: Luôn ưu tiên màu trắng (`#FFFFFF`) để tạo cảm giác chuyên nghiệp, sạch sẽ.
  - **Viền (Borders)**: Bắt buộc sử dụng viền đen dày (`border-2 border-black`) cho các card chính. Đây là đặc trưng của phong cách Neo-Brutalism, giúp UI trông bản sắc và cực kỳ dễ định vị.
  - **Đổ bóng (Shadow)**: Dùng shadow sắc nét hoặc không shadow (tùy vị trí) nhưng phải kết hợp với viền đen.
  - **Bo góc cực lớn (Border Radius)**: Bo góc tròn trịa từ `24px` đến `32px` (`rounded-[32px]`) để làm "mềm" đi sự cứng cáp của viền đen, tạo ra một phong cách Hybrid thân thiện.
- **Icon**: **TUYỆT ĐỐI KHÔNG** dùng emoji text. Bắt buộc sử dụng vector icons (Feather, AntDesign) được đặt trong các khối bo tròn có màu sắc pastel nhẹ nhàng.


---

## 2. Thông số Các Component

Khi được yêu cầu tạo UI, hãy tuân theo các quy tắc sau:

### 2.1 Thẻ Nhắc Thuốc Sắp Tới (Next Dose Card - Quan trọng nhất)
- **Màu nền**: Xanh lá `#A3E6A1` hoặc Cam `#FFA07A`.
- **Nội dung**: Giờ uống siêu to (VD: 08:00), Tên thuốc in đậm (VD: Panadol 2 viên).
- **Nút bấm**: Nút Đen chữ Trắng cực lớn ghi "XÁC NHẬN ĐÃ UỐNG".

### 2.2 Bộ chọn Buổi (Filter Sáng/Trưa/Chiều/Tối)
- **Hình thức**: Nút hình viên thuốc (pill-shaped) nằm ngang `rounded-full`.
- **Trạng thái**: Nếu đang chọn thì hiện nền Đen chữ Trắng, nếu chưa chọn thì nền Trắng chữ Đen.

### 2.3 Bottom Navigation (Thanh điều hướng dưới)
- **Thiết kế**: Thanh điều hướng Floating hoặc nằm đáy màn hình với **Nền Đen** (`#000000`), bo tròn hai góc trên cùng (`rounded-t-[32px]`).
- **Icon**: Trắng sáng (active) và Xám mờ (inactive). Không bổ sung text nhỏ gây rối mắt.

---

## 3. Quy tắc Triển khai (NativeWind First)
1. **Bắt buộc dùng `className`**: Mọi thuộc tính style (màu sắc, padding, margin, layout, bo góc) phải được đưa vào `className` bằng cú pháp Tailwind. **HẠN CHẾ TỐI ĐA** việc dùng inline `style={{ ... }}` trừ các trường hợp bất khả kháng liên quan đến animation hoặc các thuộc tính NativeWind không hỗ trợ.
2. **Xử lý Màu sắc**: Dùng mã màu HEX dán trực tiếp vào class (VD: `bg-[#A3E6A1]`, `border-[#D9AEF6]`) để khớp chính xác với bảng màu Soft UI.
3. **Xử lý Font chữ**: Mặc dù font load qua `useFonts` cần chuỗi định danh, hãy cố gắng áp dụng nó qua `style={{ fontFamily: '...' }}` nhưng vẫn phải kết hợp các class Tailwind (`text-2xl`, `font-bold`, `leading-relaxed`) trong `className` để quản lý phần còn lại của văn bản.
4. **Kích thước chạm**: Luôn đảm bảo `min-h-[56px]` hoặc `py-5` cho mọi nút bấm và input để tối ưu UX cho người lớn tuổi.
