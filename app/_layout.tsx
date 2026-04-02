import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { ZenTokyoZoo_400Regular } from '@expo-google-fonts/zen-tokyo-zoo';
import {
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black
} from '@expo-google-fonts/outfit';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import "../global.css";

// Giữ splash screen hiển thị cho đến khi font load xong
SplashScreen.preventAutoHideAsync();

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PopupContainer } from "../components/popup/PopupContainer";
import { ToastContainer } from "../components/toast/ToastContainer";
import FloatingVideoCall from "../components/video/FloatingVideoCall";

import { authSessionAtom, initAuthAtom } from '../stores/authStore';
import { useAtom, useSetAtom } from 'jotai';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const initAuth = useSetAtom(initAuthAtom);
  const [session] = useAtom(authSessionAtom);

  const [loaded] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    ZenTokyoZoo_400Regular,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-ExtraBold': Outfit_800ExtraBold,
    'Outfit-Black': Outfit_900Black,
  });

  useEffect(() => {
    if (loaded) {
      initAuth(); // Initialize auth state immediately after fonts load
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
        <ToastContainer />
        <PopupContainer />
        <FloatingVideoCall />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}