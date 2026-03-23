import { Tabs } from "expo-router";
import MemberBottomTab from "../../components/navigation/MemberBottomTab";

export default function MemberLayout() {
    return (
        <Tabs
            tabBar={(props) => <MemberBottomTab {...props} />}
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="history" />
            <Tabs.Screen name="chat" />
            <Tabs.Screen name="profile" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}
