import { getDecodedToken } from "@/utils/token";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [route, setRoute] = useState<string | null>(null);

    useEffect(() => {
        async function checkAuth() {
            const token = await SecureStore.getItemAsync("accessToken");
            if (token) {
                const decoded = await getDecodedToken();
                if (decoded?.Id) {
                    setRoute("/(manager)/home");
                } else if (decoded?.MemberId) {
                    setRoute("/(member)/home");
                } else {
                    setRoute("/welcome");
                }
            } else {
                setRoute("/welcome");
            }
            setIsLoading(false);
        }
        checkAuth();
    }, []);

    // Chế độ phát triển: Nhảy thẳng vào UI Explorer để chọn màn hình làm việc
    // if (__DEV__) {
    //     return <Redirect href="/ui-explorer" />;
    // }

    if (isLoading || !route) {
        return (
            <View className="flex-1 bg-background justify-center items-center px-6">
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    return <Redirect href={route as any} />;
}