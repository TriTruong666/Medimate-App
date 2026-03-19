import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

export interface TabConfig {
    name: string;
    icon: LucideIcon;
    label: string;
}

export interface CenterButtonConfig {
    icon: LucideIcon;
    onPress?: () => void;
}

interface BottomTabProps extends BottomTabBarProps {
    tabs: TabConfig[];
    centerButton?: CenterButtonConfig;
}

export default function BottomTab({
    state,
    descriptors,
    navigation,
    tabs,
    centerButton,
}: BottomTabProps) {
    const midIndex = centerButton ? Math.floor(tabs.length / 2) : -1;

    return (
        <View className="bg-white flex-row px-6 pt-4 pb-10 border-t border-gray-100 justify-between items-end">
            {tabs.map((tab, tabIdx) => {
                // Insert center button at midpoint
                const elements = [];

                if (centerButton && tabIdx === midIndex) {
                    elements.push(
                        <Pressable
                            key="center-btn"
                            onPress={centerButton.onPress}
                            className="items-center justify-center -mt-8"
                        >
                            <View className="w-14 h-14 rounded-full bg-black items-center justify-center shadow-lg">
                                {(() => {
                                    const CenterIcon = centerButton.icon;
                                    return <CenterIcon size={26} color="#FFFFFF" strokeWidth={1.5} />;
                                })()}
                            </View>
                        </Pressable>
                    );
                }

                const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
                const isFocused = state.index === routeIndex;
                const IconComponent = tab.icon;

                const onPress = () => {
                    if (routeIndex === -1) return;
                    const route = state.routes[routeIndex];
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                elements.push(
                    <Pressable
                        key={tab.name}
                        onPress={onPress}
                        className="items-center"
                    >
                        <View
                            className={`w-12 h-12 rounded-full items-center justify-center ${isFocused ? "bg-gray-100" : ""
                                }`}
                        >
                            <IconComponent
                                size={24}
                                color={isFocused ? "#000000" : "#B0B0B0"}
                                strokeWidth={1.5}
                            />
                        </View>
                    </Pressable>
                );

                return elements;
            })}
        </View>
    );
}
