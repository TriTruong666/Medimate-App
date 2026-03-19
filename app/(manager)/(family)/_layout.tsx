import { Stack } from "expo-router";

export default function FamilyLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="new" />
            <Stack.Screen name="members" />
            <Stack.Screen name="edit" />
            <Stack.Screen name="edit-member" />
        </Stack>
    );
}
