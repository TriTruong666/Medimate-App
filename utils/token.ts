// utils/token.ts
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

export interface CustomJwtPayload {
    Id?: string;
    memberId?: string;
    exp?: number;
}

// Hàm lấy và giải mã token từ SecureStore
export const getDecodedToken = async (): Promise<CustomJwtPayload | null> => {
    try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
            return jwtDecode<CustomJwtPayload>(token);
        }
        return null;
    } catch (error) {
        console.error("Lỗi giải mã token:", error);
        return null;
    }
};