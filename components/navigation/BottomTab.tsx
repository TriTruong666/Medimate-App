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
    <View className="bg-white flex-row px-8 pt-4 pb-6 border-t border-gray-100 justify-between items-center">
      {tabs.map((tab, tabIdx) => {
        const elements = [];

        if (centerButton && tabIdx === midIndex) {
          const CenterIcon = centerButton.icon;
          elements.push(
            <Pressable
              key="center-btn"
              onPress={centerButton.onPress}
              className="items-center justify-center h-16 w-16 bg-black rounded-full"
            >
              <CenterIcon size={32} color="#ffffff" strokeWidth={1.5} />
              {/* Spacer để giữ alignment với các icon có dot */}
              {/* <View className="h-1.5 mt-1" /> */}
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
          <Pressable key={tab.name} onPress={onPress} className="items-center">
            <IconComponent
              size={26}
              color={isFocused ? "#000000" : "#B0B0B0"}
              strokeWidth={1.5}
            />
            {/* Dot indicator cho tab active */}
            <View
              className={`w-1.5 h-1.5 rounded-full mt-1 ${
                isFocused ? "bg-black" : "bg-transparent"
              }`}
            />
          </Pressable>
        );

        return elements;
      })}
    </View>
  );
}
