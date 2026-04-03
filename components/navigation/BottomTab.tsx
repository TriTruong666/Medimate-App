import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSegments } from "expo-router";
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
  const segments = useSegments() as string[];

  // Full screen screens - Hide the entire bottom bar
  if (segments.includes("video_call")) return null;

  // Hide the center button (Plus) if we are in the prescription flow
  const hideCenterButton = segments.includes("(prescription)");

  // Determine the active tab based on the current route or pathname for nested screens
  const currentRouteName = state.routes[state.index]?.name;
  let activeTabName = currentRouteName;

  const isStandardTab = tabs.some((t) => t.name === currentRouteName);
  if (!isStandardTab) {
    if (
      segments.includes("settings") ||
      segments.includes("(settings)") ||
      segments.includes("(member-settings)") ||
      segments.includes("profile") ||
      segments.includes("(family)") ||
      segments.includes("(user)") ||
      segments.includes("(password)") ||
      segments.includes("member")
    ) {
      activeTabName = tabs.find((t) => t.name.includes("settings"))?.name || currentRouteName;
    } else if (segments.includes("doctor") || segments.includes("(doctor)") || segments.includes("chat")) {
      activeTabName = tabs.find((t) => t.name.includes("doctor") || t.name.includes("chat"))?.name || currentRouteName;
    } else if (
      segments.includes("calendar") ||
      segments.includes("(calendar)") ||
      segments.includes("(member-calendar)") ||
      segments.includes("history")
    ) {
      activeTabName = tabs.find((t) => t.name.includes("calendar"))?.name || currentRouteName;
    } else if (segments.includes("(prescription)")) {
      activeTabName = ""; // No tab active
    } else {
      activeTabName = tabs.find((t) => t.name.includes("home"))?.name || currentRouteName;
    }
  }

  return (
    <View className="bg-black flex-row px-6 pt-4 pb-8 justify-between items-center rounded-t-[32px] border-t border-black/10">
      {tabs.map((tab, index) => {
        const elements = [];

        // Center Button Handling
        if (centerButton && index === midIndex) {
          const CenterIcon = centerButton.icon;
          elements.push(
            hideCenterButton ? (
              <View key="center-btn-hidden" className="h-16 w-16 mx-2" />
            ) : (
              <Pressable
                key="center-btn"
                onPress={centerButton.onPress}
                className="items-center justify-center h-16 w-16 bg-[#A3E6A1] rounded-full border-4 border-black shadow-md mt-[-40px] mb-2 active:scale-90"
              >
                {CenterIcon && (
                  <CenterIcon size={32} color="#000000" strokeWidth={2.5} />
                )}
              </Pressable>
            )
          );
        }

        // Standard Tab Handling
        const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
        // Use intelligent matching for sub-screens
        const isFocused = tab.name === activeTabName;
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
