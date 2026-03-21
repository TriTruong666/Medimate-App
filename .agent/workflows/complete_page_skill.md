---
description: Medimate App - Xây dựng một trang hoàn chỉnh (Full Page Implementation Pattern)
---

# Kỹ năng Xây Dựng Trang Hoàn Chỉnh (Full Page Pattern)

Khi bạn được yêu cầu xây dựng một trang hay một chức năng mới từ đầu đến cuối, hãy tuân theo quy trình tiêu chuẩn này. Giao diện Đăng nhập (`login.tsx`) là hình mẫu chuẩn mực (Template) cho quy trình này.

## Quy trình 4 Bước Tiêu Chuẩn

### Bước 1: Chuẩn bị Cấu trúc Dữ liệu & API
Dựa vào `/api_structure_skill`:
1. **Types**: Định nghĩa interface/type cho dữ liệu gửi lên (Payload) và dữ liệu trả về (Response) ở thư mục `types/`.
2. **API Client**: Viết service trong thư mục `apis/` dùng Axios gọi API thực sự.
3. **React Query Hooks**: Tạo custom hook trong `hooks/` lấy data (bằng `useFetch`) hoặc xử lý hành động (bằng `useMutation`). Logic xử lý thành công `onSuccess` (Toast, Lưu Store, Routing) hay thất bại `onError` (Toast lỗi) nên đặt ở đây.

### Bước 2: Thiết lập Validation & Local State
Dựa vào `/data_handling_skill`:
1. Khai báo state lưu form: Dùng `useState` cho từng field (hoặc gom thành 1 object state lớn `form`).
2. Viết hàm kiểm định dữ liệu ở `common/validation.ts`.
3. Trong Screen Component, viết một handler function (VD: `handleSubmit`) thực thi validation. Nếu `isValid` là false -> gọi `toast.error`, nếu true -> gọi hàm `.mutate()` từ hook đã tạo ở Bước 1.

### Bước 3: Xây dựng Giao diện (UI)
Dựa vào `/app_medication_ui_skill`:
1. Dùng `SafeAreaView` làm Container bọc ngoài cùng với nền `bg-background` hoặc `bg-white`.
2. Nếu trang có form nhập liệu, bọc toàn bộ bằng `<KeyboardAvoidingView>` và `<ScrollView>` để bàn phím không che lấp input.
3. Thiết kế chuẩn Neo-Brutalism: 
   - Viền dày: `border-2 border-black`
   - Bo góc: `rounded-[24px]` (thẻ lớn, nút bấm), `rounded-2xl` (input, nhỏ).
   - Đổ bóng gắt: `shadow-md` hoặc `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`.
4. Typography: Dùng `font-space-bold` cho tiêu đề lớn/nút bấm, thư mục `Text` phải phân cấp rõ ràng (vd: Tiêu đề to `text-3xl`, mảng phụ `text-gray-500 font-space-medium`).
5. Icon: Kết hợp thư viện `lucide-react-native` hoặc `@expo/vector-icons`.

### Bước 4: Hoàn thiện Trải nghiệm (UX Feedback)
1. **Nút bấm chính (Call to Action)**: Xử lý trạng thái Loading (`isPending` từ Mutation).
   - Trạng thái bình thường: Màu nền nổi bật (Xanh Pastel `bg-[#A3E6A1]`), text màu đen uppercase, có icon mũi tên. `active:opacity-80` để làm hiệu ứng nhấn bóng.
   - Trạng thái Loading: `disabled={isPending}`, style `opacity-70`. Bên trong nút ẩn text và thay bằng `<ActivityIndicator color="black" />`.
2. Hỗ trợ cảm ứng xúc giác (Haptics) với các nút quan trọng (nếu cần).
3. Sử dụng `toast` để thông báo mọi rào cản thao tác đến người dùng bằng Tiếng Việt thân thiện.

---

### Mẫu cấu trúc một Screen lý tưởng (Dự phóng từ login.tsx)

```tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { validateMyForm } from "@/common/validation";
import { useToast } from "@/stores/toastStore";
import { useSubmitMyData } from "@/hooks/useMyFeature";
// Imports icons, router...

export default function MyCompleteFeatureScreen() {
    const toast = useToast();
    const [inputValue, setInputValue] = useState("");
    const { mutate: doSubmit, isPending } = useSubmitMyData();

    const handleAction = () => {
        // 1. Validation
        const { isValid, message } = validateMyForm(inputValue);
        if (!isValid) {
            toast.error("Cảnh báo", message);
            return;
        }

        // 2. Submit Mutation
        doSubmit({ data: inputValue.trim() });
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {/* Header: Back Button + Title */}
                    
                    {/* Inputs: Neo-brutalism styled */}
                    
                    {/* Primary Button */}
                    <Pressable
                        onPress={handleAction}
                        disabled={isPending}
                        className={`w-full py-4 bg-[#A3E6A1] border-2 border-black rounded-[24px] shadow-md items-center justify-center mt-8 ${isPending ? 'opacity-70' : 'active:opacity-80'}`}
                    >
                         {isPending ? <ActivityIndicator color="black" /> : <Text>XÁC NHẬN</Text>}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
```
Tuân thủ đúng quy trình này đảm bảo code luôn gọn gàng, tái sử dụng cao và trải nghiệm người dùng đạt chất lượng tốt nhất.
