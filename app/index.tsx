import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAtom } from 'jotai';
import { authSessionAtom } from '../stores/authStore';

/**
 * Root Router Index - Bouncer 1.0
 * The first logic executed to decide where the user lands.
 */
export default function Index() {
    const [session] = useAtom(authSessionAtom);

    // 1. App Startup: Waiting for RootLayout to sync SecureStore -> Jotai
    if (session === null) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F9F6FC', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    // 2. Not Logged In -> Kick out to /welcome
    if (!session) {
        console.log('Index: No session found, kicking to /welcome');
        return <Redirect href="/welcome" />;
    }

    // 3. Logged In -> Forward to correct dashboard
    if (session.role === 'member') {
        return <Redirect href="/(member)/(member-home)" />;
    }

    if (session.role === 'manager') {
        return <Redirect href="/(manager)/(home)" />;
    }

    // Fallback
    return <Redirect href="/welcome" />;
}