import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Activity, ClipboardList, MessageCircle, User } from "lucide-react-native";
import BottomTab, { TabConfig } from "./BottomTab";

const MEMBER_TABS: TabConfig[] = [
    { name: "index", icon: Activity, label: "Hôm nay" },
    { name: "history", icon: ClipboardList, label: "Lịch sử" },
    { name: "chat", icon: MessageCircle, label: "Bác sĩ" },
    { name: "settings", icon: User, label: "Cá nhân" },
];

export default function MemberBottomTab(props: BottomTabBarProps) {
    return <BottomTab {...props} tabs={MEMBER_TABS} />;
}
