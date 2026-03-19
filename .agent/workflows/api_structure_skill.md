---
description: Medimate App - Cấu trúc Call API & Data Fetching
---
# Medimate App - Cấu Trúc API & Data Fetching (Skill)

Chào các Agent! Khi bạn làm việc trên dự án này, vui lòng tham khảo cấu trúc chuẩn bên dưới để gọi API hoặc Fetch Data nhằm giữ code base sạch sẽ và nhất quán.

Dự án này sử dụng mô hình 3 lớp phân tách rõ ràng: **Types -> API Client (Axios) -> React Query Hook**.

## 1. Cấu trúc thư mục

- `types/`: Chứa các định nghĩa dữ liệu (interface, type) bám sát theo schema của DB/Backend. Ví dụ: `DemoUser`, `PostDemo`.
- `apis/`: Nơi chứa các function gọi API (HTTP Request) bằng Axios thông qua `axiosClient`. Lớp này chuyên làm nhiệm vụ kết nối mạng và parse data trả về, không chứa logic UI. Thường gọi tắt là Layer API Service.
- `hooks/data/`: Tầng giao tiếp với UI components. Sử dụng `@tanstack/react-query` và custom hook (như `useFetch`) để fetch data, caching và quản lý mutation. UI Components / Screens tuyệt đối **KHÔNG GỌI API TRỰC TIẾP**, mà chỉ được phép import hook từ thư mục này.

## 2. Các bước triển khai API mới

Khi User yêu cầu bạn code một API mới, hãy thực hiện theo thứ tự sau:

### Bước 1: Khởi tạo Types (`types/`)
Định nghĩa Type/Interface cho Payload (Data gửi lên) và Response (Data nhận về). Ví dụ:
- `types/User.ts`: `export type User = { id: string; name: string... }; export type PostUser = { name: string... };`

### Bước 2: Tạo API Service (`apis/`)
Tạo một file `.api.ts` (ví dụ: `user.api.ts`).
- Hãy import `axiosClient` từ `apis/client`.
- Wrap dữ liệu bọc trong `BaseResponse<T>` nếu backend có chuẩn trả về `sucess, message, data`.
```typescript
import { BaseResponse } from "@/types/APIResponse";
import { User, PostUser } from "@/types/User";
import { axiosClient } from "./client";

export async function getUsers(): Promise<BaseResponse<User[]>> {
  const res = await axiosClient.get('/api/v1/users');
  return res.data;
}

export async function createUser(data: PostUser) {
  const res = await axiosClient.post('/api/v1/users', data);
  return res.data; 
}
```

### Bước 3: Đăng ký React Query Hook (`hooks/data/`)
Tạo một file Hook riêng biệt cho resource đó (ví dụ: `hooks/data/useUserHook.ts`).
- **Fetch Data (GET)**: Sử dụng custom hook `useFetch` hoặc `useSuspenseFetch` (được định nghĩa trong `hooks/useFetch.ts`):
- **Mutation (POST/PUT/DELETE)**: Sử dụng `useMutation` của `@tanstack/react-query` và xử lý `onSuccess` để invalidate query (làm mới data cho UI).

```typescript
import * as UserService from "@/apis/user.api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useFetch } from "../useFetch"; // import custom hook

export function useGetUsers() {
  return useFetch(["users"], async () => UserService.getUsers());
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PostUser) => UserService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      console.log("Thành công");
    },
    onError: (error) => {
      console.log("Thất bại", error);
    }
  });
}
```

### Bước 4: Tích hợp vào UI/Components
Bây giờ tại App, Screens, hoặc Component, bạn chỉ việc gọi Hooks ra dùng:
```tsx
const { data: users, isLoading } = useGetUsers();
const { mutate: createUser } = useCreateUser();
```

## 3. Playgrounds & Test
Bạn có thể tham khảo trực tiếp cấu trúc của `UseDemoHook` qua các file:
- `types/Demo.ts`
- `apis/demo.api.ts`
- `hooks/data/useDemoHook.ts`
- `app/demo.tsx` (Screen dùng để test thử phần gọi API mới mà không gây dính logic với các page chính).
