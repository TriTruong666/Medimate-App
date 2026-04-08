import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Calendar, Heart, Stethoscope, User } from "lucide-react-native";
import BottomTab, { TabConfig } from "./BottomTab";

const MEMBER_TABS: TabConfig[] = [
    { name: "(member-home)", icon: Heart, label: "Trang chủ" },
    { name: "(member-calendar)", icon: Calendar, label: "Lịch nhắc nhở" },
    { name: "(appointment)", icon: Stethoscope, label: "Lịch khám" },
    { name: "(member-settings)", icon: User, label: "Setting" },
];

export default function MemberBottomTab(props: BottomTabBarProps) {
    return <BottomTab {...props} tabs={MEMBER_TABS} />;
}
