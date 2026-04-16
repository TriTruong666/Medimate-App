import { Stack } from 'expo-router';

export default function MemberSettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} initialRouteName="settings">
            <Stack.Screen name="settings" />
            <Stack.Screen name="version" />
            <Stack.Screen name="member_notifications" />
        </Stack>
    );
}
