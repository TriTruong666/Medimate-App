import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const token = await SecureStore.getItemAsync("accessToken");
            setHasToken(!!token);
            setIsLoading(false);
        }
        checkAuth();
    }, []);

    // Chế độ phát triển: Nhảy thẳng vào UI Explorer để chọn màn hình làm việc
    if (__DEV__) {
        return <Redirect href="/ui-explorer" />;
    }

    if (isLoading) {
        return (
            <View className="flex-1 bg-background justify-center items-center px-6">
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    // Nếu có token vào thẳng trang chủ manager, không có thì ra welcome
    return hasToken ? <Redirect href="/(manager)/home" /> : <Redirect href="/welcome" />;
}