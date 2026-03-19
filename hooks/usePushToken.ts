// hooks/usePushToken.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function usePushToken() {
    const [fcmToken, setFcmToken] = useState<string>("");

    useEffect(() => {
        let isMounted = true;

        async function registerForPushNotificationsAsync() {
            let token = "";

            if (Device.isDevice) {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    console.log('Người dùng từ chối cấp quyền thông báo!');
                    return "";
                }

                try {
                    const tokenData = await Notifications.getDevicePushTokenAsync();
                    token = tokenData.data;
                } catch (error) {
                    console.log('Lỗi khi lấy push token:', error);
                }
            } else {
                console.log('Phải dùng máy thật (Physical Device) để lấy Push Token');
            }

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            return token;
        }

        registerForPushNotificationsAsync().then((token) => {
            if (isMounted && token) {
                setFcmToken(token);
                console.log("Push Token lấy từ Hook:", token);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    return fcmToken;
}