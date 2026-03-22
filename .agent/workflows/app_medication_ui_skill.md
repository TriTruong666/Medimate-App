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
- **Placeholder**: Bắt buộc thêm `placeholderTextColor="#A0A0A0"` để đảm bảo độ tương phản nhẹ nhàng cho text gợi ý.

### 2.3 Nút hành động chính (Primary Action Button)
- **Màu sắc**: Màu xanh lá Pastel `bg-[#A3E6A1]`.
- **Style**: `w-full py-4 rounded-[24px] border-2 border-black flex-row items-center justify-center shadow-md`.
- **Text**: `text-black text-lg font-space-bold uppercase`.

### 2.4 Nút quay lại & Header (Back Button & Header)
- **Quy tắc chung**: Header phải thoáng, sử dụng nút quay lại chuẩn `w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm`.
- **Phân loại màn hình**:
  - **Màn hình Danh sách/Chính (List/Index)**: Header tối giản, **KHÔNG** đặt text ở giữa. Tiêu đề trang đặt lớn ở đầu `ScrollView`.
  - **Màn hình Chi tiết (Detail)**: Header có tiêu đề ở giữa (`text-xl font-space-bold`). Nút bên trái là quay lại, nút bên phải (nếu có, VD: Sửa) phải có cùng kích thước `w-12 h-12` và style tương tự nút quay lại để đảm bảo cân bằng.

---

## 3. Quy tắc Triển khai (NativeWind First)
1. **Bắt buộc dùng `className`**: Mọi thuộc tính style phải đưa vào Tailwind class.
2. **Màu sắc**: Ưu tiên mã HEX trực tiếp: `bg-[#A3E6A1]` (Xanh), `bg-[#D9AEF6]` (Tím), `bg-[#FFA07A]` (Cam).
3. **Độ lớn vùng chạm**: Đảm bảo chiều cao tối thiểu cho nút và input là `h-12` (với input) hoặc `py-4` (với nút).
4. **Ngôn ngữ**: Toàn bộ nội dung hiển thị phải là **Tiếng Việt**.
5. **Khoảng cách (Spacing)**: Khi có cấu trúc "Icon bên trái + Text bên phải" (hoặc ngược lại), container `View` bao ngoài **BẮT BUỘC** phải sử dụng `flex-row items-center` và có thuộc tính `gap-x-2` (hoặc `gap-x-3`) để đảm bảo khoảng cách hiển thị luôn nhất quán. **TUYỆT ĐỐI KHÔNG** sử dụng `mr-2` hay `ml-2` trên từng icon lẻ loi.
    *   *Ví dụ đúng*: `<View className="flex-row items-center gap-x-2"><Icon /><Text>Nội dung</Text></View>`
    *   *Ví dụ sai*: `<View className="flex-row items-center"><Icon className="mr-2" /><Text>Nội dung</Text></View>`
---

## 4. Tái sử dụng Component (Reusability)

Trong quá trình phát triển UI cho ứng dụng Medimate, **BẮT BUỘC kiểm tra và sử dụng lại các component UI có sẵn** được định nghĩa trong thư mục `components/` để tránh lặp lại mã và duy trì sự nhất quán.

*   **Vị trí**: `d:\Dev\Native\Medimate-App\components`
*   **Popups/Modals**: Đã có `PopupContainer` kết hợp với thư viện trạng thái Jotai (thường gọi qua `popupStore` của hook `usePopup`). **TUYỆT ĐỐI KHÔNG** khai báo `<Modal>` lồng bên trong các trang.
    *   Sử dụng: `popup.open({ type: "tên_loại_popup", data: ... })`
    *   Bạn có thể xem định nghĩa tại `components/popup/`.

### Quy chuẩn thiết kế Popup (Bottom Sheet Pattern)

Mọi Popup trong hệ thống **BẮT BUỘC** phải tuân theo thiết kế của `MedicinePopup` để đảm bảo tính nhất quán:

1.  **Vị trí**: Luôn là Bottom Sheet (`justify-end`), bo góc trên `rounded-t-[32px]`, viền trên `border-t-4 border-black`.
2.  **Màu nền**: Container sử dụng `bg-[#F9F6FC]`. Backdrop sử dụng `bg-black/40`.
3.  **Header**: 
    *   Icon tiêu đề nằm trong khung `w-12 h-12 rounded-2xl border-2 border-black`.
    *   Nút đóng (X) nằm góc phải: `w-10 h-10 rounded-full border-2 border-black`.
4.  **Input Field**: 
    *   Nhãn (Label) dạng chữ in hoa, nhỏ, đậm: `text-xs font-space-bold text-gray-500 tracking-wider`.
    *   Khung Input: `h-14 rounded-2xl border-2 border-black bg-white shadow-sm`.
5.  **Nút bấm (Footer)**:
    *   Chiều cao cố định `h-14`, bo góc `rounded-2xl`, viền `border-2 border-black`.
    *   Shadow: `shadow-md`, active state `active:translate-y-0.5`.
    *   Font: `font-space-bold uppercase text-lg`.

### Quy chuẩn thiết kế Dropdown (Neo-Brutalism Style)

Mọi menu Dropdown (VD: `FamilyDropdown`) phải tuân thủ các quy tắc sau để đảm bảo thẩm mỹ Neo-Brutalism và tính linh hoạt:

1.  **Tính linh hoạt (Self-Expanding)**: **KHÔNG** đặt chiều rộng cố định (như `w-56`). Sử dụng `min-w-[200px]` và để `View` tự co giãn theo độ dài của chữ bên trong.
2.  **Khung Container**:
    *   Viền: `border-2 border-black`.
    *   Bo góc: `rounded-2xl`.
    *   Đổ bóng: `shadow-lg` hoặc Shadow cứng kiểu Neo-Brutalism.
    *   Nền: `bg-white`.
3.  **Dropdown Item**:
    *   Cấu trúc: `flex-row items-center px-4 py-4 gap-x-3`.
    *   Icon: Nằm trong khung `w-8 h-8 rounded-lg border border-black/10` với màu nền pastel tương ứng.
    *   Văn bản: `text-[15px] font-space-bold`. Nếu là hành động xóa/nguy hiểm, dùng `text-red-500`.
    *   Phân cách: Giữa các item dùng `border-b-2 border-black/5`.

*   Tương tự cho các components điều hướng (Navigation), Headers, vv.

### Quy chuẩn thiết kế Skeleton Loading (Pulsing State)

Giao diện Medimate sử dụng **Skeleton Loading** thay vì biểu tượng xoay truyền thống để mang lại cảm giác tốc độ và hiện đại:

1.  **Công nghệ**: Bắt buộc dùng `moti` (MotiView) để tạo hiệu ứng pulsing (`opacity: 0.5 -> 1`).
2.  **Cấu trúc Skeleton**:
    *   Phải khớp 90-100% với layout thực tế của trang.
    *   Sử dụng màu nền `bg-gray-200` cho các khối dữ liệu chính và `bg-gray-100` cho các khối phụ.
    *   Bo góc (Radius) của các khối skeleton phải giống hệt component thật (VD: `rounded-[40px]` cho avatar, `rounded-2xl` cho card).
3.  **Vị trí**: Lưu trữ tại `components/skeleton/`.
    *   Thành phần dùng chung: `SkeletonPulsar` (Khối nháy cơ bản).
    *   Skeleton theo trang: `MemberDetailSkeleton` (Dành cho trang chi tiết hồ sơ).

---

## 5. Phân loại và Cấu trúc Trang (Page Patterns)

Mọi trang mới khi được tạo ra **BẮT BUỘC** phải tuân theo một trong hai khuôn mẫu (Pattern) sau:

### 5.1 Pattern Trang Danh sách (List/Index Page)
- **Header**: Nút Profile/Menu bên trái, Logo ở giữa (không bắt buộc), Nút Thêm/Hành động bên phải. **KHÔNG** để tiêu đề trang ở Header.
- **Nội dung**: Tiêu đề trang (Page Title) viết lớn (`text-4xl font-space-bold`) đặt ngay đầu `ScrollView`.
- **Ví dụ**: `family/index.tsx`, `medication/index.tsx`.

### 5.2 Pattern Trang Chi tiết / Form (Detail/Form Page)
- **Header**: Nút Quay lại (`ArrowLeft`) bên trái, Tiêu đề trang căn giữa (`text-xl font-space-bold`), Nút Hành động phụ (Sửa/Xóa) bên phải.
- **Nội dung**: Dữ liệu được trình bày trong các thẻ (Cards) Neo-Brutalism hoặc Form nhập liệu.
- **Ví dụ**: `member.tsx`, `edit-member.tsx`, `add-member.tsx`.
- **Loading**: Bắt buộc sử dụng trang Skeleton tương ứng (VD: `MemberDetailSkeleton`) khi `isLoading` là true.

