import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CalendarDays, Heart, MessageCircle, QrCode, User } from "lucide-react-native";
import BottomTab, { CenterButtonConfig, TabConfig } from "./BottomTab";

const MANAGER_TABS: TabConfig[] = [
    { name: "index", icon: Heart, label: "Trang chủ" },
    { name: "calendar", icon: CalendarDays, label: "Lịch" },
    { name: "members", icon: MessageCircle, label: "Tin nhắn" },
    { name: "settings", icon: User, label: "Cá nhân" },
];

const CENTER_BUTTON: CenterButtonConfig = {
    icon: QrCode,
};

export default function ManagerBottomTab(props: BottomTabBarProps) {
    return <BottomTab {...props} tabs={MANAGER_TABS} centerButton={CENTER_BUTTON} />;
}
