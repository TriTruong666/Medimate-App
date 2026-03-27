import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Calendar, Heart, MessageCircle, Plus, User } from "lucide-react-native";
import BottomTab, { CenterButtonConfig, TabConfig } from "./BottomTab";

const MANAGER_TABS: TabConfig[] = [
    { name: "(home)", icon: Heart, label: "Trang chủ" },
    { name: "(calendar)", icon: Calendar, label: "Lịch" },
    { name: "(doctor)", icon: MessageCircle, label: "Bác sĩ" },
    { name: "(settings)", icon: User, label: "Cá nhân" },
];

const CENTER_BUTTON: CenterButtonConfig = {
    icon: Plus,
    onPress: () => router.push("/(manager)/(prescription)"),
};

export default function ManagerBottomTab(props: BottomTabBarProps) {
    return <BottomTab {...props} tabs={MANAGER_TABS} centerButton={CENTER_BUTTON} />;
}
