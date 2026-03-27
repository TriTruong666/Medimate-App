import { Tabs } from "expo-router";
import MemberBottomTab from "../../components/navigation/MemberBottomTab";
import { AuthGuard } from "../../components/guards/AuthGuard";

export default function MemberLayout() {
    return (
        <AuthGuard>
            <Tabs
                tabBar={(props) => <MemberBottomTab {...props} />}
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                }}
            >
                <Tabs.Screen name="(member-home)" />
                <Tabs.Screen name="(member-calendar)" />
                <Tabs.Screen name="(member-settings)" />
            </Tabs>
        </AuthGuard>
    );
}
