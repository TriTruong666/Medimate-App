import { Stack } from "expo-router";

export default function FamilyLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="new" />
            <Stack.Screen name="family-members" />
            <Stack.Screen name="member" />
            <Stack.Screen name="edit" />
            <Stack.Screen name="edit-member" />
            <Stack.Screen name="add-member" />
            <Stack.Screen name="change-password" />
        </Stack>
    );
}
