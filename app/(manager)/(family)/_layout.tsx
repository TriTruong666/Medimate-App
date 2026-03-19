import { Stack } from "expo-router";

export default function FamilyLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="new" />
            <Stack.Screen name="member" />
        </Stack>
    );
}
