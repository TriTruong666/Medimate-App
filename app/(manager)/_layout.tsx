import { Tabs } from "expo-router";
import ManagerBottomTab from "../../components/navigation/ManagerBottomTab";
import { AuthGuard } from "../../components/guards/AuthGuard";

export default function ManagerLayout() {
    return (
        <AuthGuard>
            <Tabs
                tabBar={(props) => <ManagerBottomTab {...props} />}
                screenOptions={{
                    headerShown: false,
                    animation: 'fade', // Thêm hiệu ứng fade cho mượt mà
                }}
            >
                <Tabs.Screen name="(home)" />
                <Tabs.Screen name="(calendar)" />
                <Tabs.Screen name="(doctor)" />
                <Tabs.Screen name="(settings)" />
                <Tabs.Screen name="(family)" options={{ href: null }} />
                <Tabs.Screen name="(prescription)" options={{ href: null }} />
                <Tabs.Screen name="(subscription)" options={{ href: null }} />
            </Tabs>
        </AuthGuard>
    );
}
