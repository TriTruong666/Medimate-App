import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LucideIcon } from "lucide-react-native";
import { MotiView } from "moti";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

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

const BottomTabComponent = ({
  state,
  navigation,
  tabs,
  centerButton,
}: BottomTabProps) => {
  const midIndex = centerButton ? Math.floor(tabs.length / 2) : -1;

  return (
    <View className="bg-black flex-row px-6 pt-4 pb-8 justify-between items-center rounded-t-[32px] border-t border-black/10">
      {tabs.map((tab, index) => {
        const elements = [];

        // Center Button Handling
        if (centerButton && index === midIndex) {
          const CenterIcon = centerButton.icon;
          elements.push(
            <Pressable
              key="center-btn"
              onPress={centerButton.onPress}
              className="items-center justify-center h-16 w-16 bg-[#A3E6A1] rounded-full border-4 border-black shadow-md mt-[-40px] mb-2 active:scale-90"
            >
              {CenterIcon && (
                <CenterIcon size={32} color="#000000" strokeWidth={2.5} />
              )}
            </Pressable>
          );
        }

        // Standard Tab Handling
        const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
        const isFocused = state.index === routeIndex;
        const IconComponent = tab.icon;

        const onPress = () => {
          if (routeIndex === -1) return;
          const event = navigation.emit({
            type: "tabPress",
            target: state.routes[routeIndex].key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name, state.routes[routeIndex].params);
          }
        };

        if (routeIndex !== -1) {
          elements.push(
            <Pressable
              key={tab.name}
              onPress={onPress}
              className="items-center justify-center min-w-[64px]"
            >
              <MotiView
                animate={{
                  scale: isFocused ? 1.05 : 1,
                  translateY: isFocused ? -1 : 0,
                  opacity: isFocused ? 1 : 0.6,
                }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 200,
                }}
                className="items-center"
              >
                {IconComponent && (
                  <IconComponent
                    size={24}
                    color={isFocused ? "#A3E6A1" : "#E5E7EB"}
                    strokeWidth={isFocused ? 2.5 : 1.5}
                  />
                )}
                <Text
                  className={`text-[10px] mt-1 font-space-bold ${isFocused ? "text-[#A3E6A1]" : "text-gray-400"}`}
                >
                  {tab.label}
                </Text>
              </MotiView>
            </Pressable>
          );
        }

        return elements;
      })}
    </View>
  );
};

// Use memo to prevent re-renders of the whole tab bar component when parent renders
export default memo(BottomTabComponent);
