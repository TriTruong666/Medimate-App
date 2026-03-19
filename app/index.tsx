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

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    // Nếu có token vào thẳng trang chủ manager, không có thì ra welcome
    return hasToken ? <Redirect href="/(manager)/home" /> : <Redirect href="/welcome" />;
}