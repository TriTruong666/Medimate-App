---
description: Medimate App - Interactive Medication Card Component Skill
---

# Medimate App - Interactive Medication Card Component Skill

This skill defines the technical implementation for a reusable, high-performance, and accessible `<MedicationCard />` component for the Medimate App. This component is optimized for elderly users and utilizes a modern technical stack.

## 1. Technical Stack Constraints

All implementations of this component must adhere to:
- **Framework**: Expo SDK (React Native) + `expo-router`
- **Styling**: `nativewind` (Tailwind CSS)
- **State Management**: `jotai`
- **Data Fetching**: `@tanstack/react-query`
- **Animations**: `moti` + `react-native-reanimated`
- **Overlays**: `@gorhom/bottom-sheet`
- **Time/Date**: `dayjs` (locale: 'vi')
- **Accessibility/Haptics**: `expo-haptics`

## 2. Design & Accessibility Rules (Soft Neo-Brutalism)

- **Colors**:
  - Primary: `#B8FFA9` (Active Green)
  - Urgent: `#FFC6A8` (Peach)
  - Detail: `#EACEFF` (Lavender)
  - Text/Border: `#000000` (Black)
  - Background: `#FFFFFF` (White)
- **Styling Rules**:
  - Use `className` with Tailwind.
  - Borders: `border-4 border-black` (Solid, no blur).
  - Radius: `rounded-[32px]`.
  - Shadows: Solid offset only (e.g., `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).
  - Typography: `Space Grotesk`. Minimum 16px.
  - Touch Targets: Minimum height/width 48px.

## 3. Implementation Blueprint (<MedicationCard />)

```typescript
import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { MotiView, MotiPressable } from 'moti';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Initialize dayjs with Vietnamese locale
dayjs.locale('vi');

interface MedicationCardProps {
  id: string;
  drugName: string;
  quantity: number;
  unit: string;
  scheduledTime: string; // ISO String
  instruction: string;
  status: 'pending' | 'taken' | 'skipped';
  onShowDetails: (id: string) => void;
}

/**
 * MedicationCard Component
 * Implements Soft Neo-Brutalism design with Moti animations and high accessibility.
 */
export const MedicationCard: React.FC<MedicationCardProps> = ({
  id,
  drugName,
  quantity,
  unit,
  scheduledTime,
  instruction,
  onShowDetails,
}) => {
  const queryClient = useQueryClient();

  // Mocked mutation to mark dose as taken
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      // API call placeholder: return markAsTaken(id);
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      // Invalidate queries to refresh list
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const handleTakenPress = async () => {
    // Physical confirmation for elderly users
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    mutation.mutate(id);
  };

  const formattedTime = dayjs(scheduledTime).format('HH:mm [Sáng]'); // Adjust based on AM/PM logic if needed

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      // Exit animation logic when marking as taken
      exit={mutation.isSuccess ? { scale: 0, opacity: 0 } : undefined}
      className="bg-[#FFC6A8] border-4 border-black rounded-[32px] p-6 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <Pressable 
        onPress={() => onShowDetails(id)}
        // Ensure the card body has a large enough touch target for details
        className="min-h-[100px]"
      >
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-3xl font-extrabold text-black font-[SpaceGrotesk-Bold]">
              {formattedTime}
            </Text>
            <Text className="text-xl font-bold mt-2 text-black">
              {drugName} x{quantity} {unit}
            </Text>
            <Text className="text-base font-normal mt-1 text-black opacity-80">
              {instruction}
            </Text>
          </View>
          {/* Icon Placeholder - Use a literal icon in production */}
          <View className="bg-white border-2 border-black rounded-2xl p-2">
            <Text className="text-2xl">💊</Text>
          </View>
        </View>
        
        {/* Trigger Bottom Sheet open via ref to display drug side effects and instructions */}
        {/* The onShowDetails callback is expected to handle the BottomSheet trigger */}
      </Pressable>

      <MotiPressable
        onPress={handleTakenPress}
        animate={({ pressed }) => {
          'worklet';
          return {
            scale: pressed ? 0.95 : 1,
          };
        }}
        transition={{ type: 'spring', damping: 10 }}
        className="bg-black py-4 mt-6 rounded-full border-2 border-black active:bg-gray-900"
      >
        <Text className="text-white text-center text-xl font-bold tracking-wider">
          ĐÃ UỐNG
        </Text>
      </MotiPressable>
    </MotiView>
  );
};
```

## 4. Usage Requirements

1. **Accessibility**: Always include `expo-haptics` on primary confirmation actions.
2. **Visuals**: No blur shadows; use solid black offsets.
3. **State**: Use `jotai` for global UI states (e.g., controlling a single shared Bottom Sheet component) and `@tanstack/react-query` for data persistence.
4. **Localization**: Ensure `dayjs` is always configured with the `vi` locale before formatting.
