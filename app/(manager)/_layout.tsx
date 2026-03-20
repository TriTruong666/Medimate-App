import { Tabs } from "expo-router";
import ManagerBottomTab from "../../components/navigation/ManagerBottomTab";

export default function ManagerLayout() {
    return (
        <Tabs
            tabBar={(props) => <ManagerBottomTab {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="calendar" />
            <Tabs.Screen name="doctor" />
            <Tabs.Screen name="settings" />
            <Tabs.Screen name="familyview" />
        </Tabs>
    );
}
