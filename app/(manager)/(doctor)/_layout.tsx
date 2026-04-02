import { Stack } from 'expo-router';

export default function MessageLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="appointments" />
            <Stack.Screen name="doctor_detail" />
            <Stack.Screen name="video_call" />
        </Stack>
    );
}
