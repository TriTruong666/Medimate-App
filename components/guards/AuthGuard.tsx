import React from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAtom } from 'jotai';
import { authSessionAtom } from '../../stores/authStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard - THE BOUNCER.
 * If you don't have a session, you are kicked out to /welcome INSTANTLY.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [session] = useAtom(authSessionAtom);

    // 1. If still loading from start (RootLayout handles this, but safety first)
    if (session === null) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F9F6FC', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    // 2. THE KICK OUT LOGIC: If session is undefined (no user), GTFO to welcome.
    if (!session) {
        console.log('AuthGuard: Access denied, redirecting to /welcome');
        return <Redirect href="/welcome" />;
    }

    // 3. Authenticated: Welcome, master.
    return <>{children}</>;
};
