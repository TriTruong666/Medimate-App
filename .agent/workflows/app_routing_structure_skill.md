---
description: Medimate App - Cấu trúc Route & Folder Group (Routing & Directory Structure)
---

# Kỹ năng Cấu trúc Routing & Thư mục (Medimate App)

Tài liệu này định nghĩa quy chuẩn và cấu trúc hệ điều hướng (Routing) sử dụng **Expo Router** cho ứng dụng **Medimate**. Cấu trúc này tối ưu cho việc mở rộng tính năng theo module (Feature-based) và quản lý Stack độc lập cho từng Tab.

## 1. Nguyên tắc Folder Group `(group)`

Mọi tính năng chính phải được đặt trong một **Folder Group** (thư mục có dấu ngoặc đơn). Tên folder group sẽ **KHÔNG** xuất hiện trong URL nhưng đóng vai trò là một module điều hướng riêng biệt.

### Cấu trúc cơ bản của một Module:
```text
app/(manager)/(module_name)/
├── _layout.tsx      # Định nghĩa Stack/Tabs cho module
├── index.tsx        # Màn hình chính (route mặc định của module)
└── [screen].tsx     # Các màn hình phụ trong module
```

## 2. Cấu trúc Route trong `app/(manager)`

Ứng dụng sử dụng kiến trúc Tab kết hợp nhiều Stack. Mỗi Tab là một Folder Group chứa một Stack điều hướng riêng.

### Các Folder Groups hiện có:
- **`(home)`**: Màn hình Trang chủ (Dashboard).
- **`(calendar)`**: Lịch uống thuốc và nhắc nhở.
- **`(doctor)`**: Tin nhắn và thông tin bác sĩ (Hiện là Member Detail placeholder).
- **`(settings)`**: Cài đặt tài khoản, hồ sơ cá nhân, đổi mật khẩu.
- **`(family)`**: Quản lý nhóm gia đình, thành viên.
- **`(prescription)`**: Quản lý đơn thuốc, quét AI, tải ảnh lên.

## 3. Quy chuẩn Đặt tên & File

1.  **Màn hình chính của Tab**: Luôn đặt tên là `index.tsx` bên trong folder group tương ứng.
    *   *Ví dụ*: `app/(manager)/(home)/index.tsx`.
2.  **File Layout**: Mỗi folder group **BẮT BUỘC** phải có file `_layout.tsx` sử dụng `<Stack />` để quản lý các màn hình con.
    *   *Ví dụ layout chuẩn*:
        ```tsx
        import { Stack } from "expo-router";
        export default function Layout() {
            return (
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="detail" />
                </Stack>
            );
        }
        ```
3.  **Tên Route trong Navigation**: Khi sử dụng `Tabs.Screen` trong layout tổng, `name` phải khớp với tên thư mục group.
    *   *Ví dụ*: `<Tabs.Screen name="(home)" />`.

## 4. Điều hướng (Navigation Logic)

### Sử dụng `router.push` hoặc `Link`:
Do sử dụng Folder Group, bạn cần chú ý đường dẫn đầy đủ khi điều phối giữa các module khác nhau.

- **Đến trang chính của một Tab**:
  `router.push("/(manager)/(home)")`
- **Đến trang phụ trong cùng module**:
  `router.push("/(manager)/(settings)/profile")`
- **Đến trang phụ ở module khác**:
  `router.push("/(manager)/(family)/add-member")`

**LƯU Ý quan trọng**: Luôn bao gồm tên folder group (trong ngoặc đơn) trong đường dẫn `router.push` để Expo Router xác định đúng vị trí file trong cấu trúc nested.

## 5. Đăng ký Tab mới

Khi muốn thêm một Tab mới vào Bottom Bar của Manager:
1.  Tạo thư mục `app/(manager)/(new_feature)`.
2.  Tạo `_layout.tsx` và `index.tsx` bên trong.
3.  Đăng ký Folder Group vào `app/(manager)/_layout.tsx`:
    ```tsx
    <Tabs.Screen name="(new_feature)" />
    ```
4.  Cập nhật cấu hình icon và label trong `components/navigation/ManagerBottomTab.tsx`.

## 6. Danh sách các Path thông dụng (Cheat Sheet)

| Tính năng | Đường dẫn (Path) |
| :--- | :--- |
| **Trang chủ** | `/(manager)/(home)` |
| **Lịch** | `/(manager)/(calendar)` |
| **Cài đặt chung** | `/(manager)/(settings)` |
| **Hồ sơ cá nhân** | `/(manager)/(settings)/profile` |
| **Đổi mật khẩu** | `/(manager)/(settings)/change-password` |
| **Danh sách Gia đình** | `/(manager)/(family)` |
| **Sửa Gia đình** | `/(manager)/(family)/edit-family` |
| **Đơn thuốc (List)** | `/(manager)/(prescription)` |
| **Quét đơn thuốc** | `/(manager)/(prescription)/scan_prescription` |

---
**TUYỆT ĐỐI KHÔNG**: Để các file màn hình `.tsx` nằm trực tiếp ở thư mục `app/(manager)/`. Mọi file phải thuộc về một folder group cụ thể.
