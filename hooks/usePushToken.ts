// hooks/usePushToken.ts
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export function usePushToken() {
  const [fcmToken, setFcmToken] = useState<string>("");

  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  useEffect(() => {
    let isMounted = true;

    async function registerForPushNotificationsAsync() {
      if (isExpoGo) {
        console.log(
          "Medimate: Đang chạy trên Expo Go. Tính năng Push Notification bị hạn chế!"
        );
        return "expo_go_dummy_token";
      }

      let token = "";

      if (!Device.isDevice) {
        console.log(
          "Medimate: Phải dùng máy thật (Physical Device) để lấy Push Token"
        );
        return "simulator_token";
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Medimate: Quyền thông báo bị từ chối!");
        return "";
      }

      try {
        const tokenData = await Notifications.getDevicePushTokenAsync();
        token = tokenData.data;
      } catch (error) {
        console.log("Medimate: Lỗi khi lấy Push Token:", error);

        try {
          const expoToken = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          });
          token = expoToken.data;
        } catch (e) {
          console.log("Medimate: Lấy Expo Token cũng thất bại:", e);
        }
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return token;
    }

    registerForPushNotificationsAsync().then((token) => {
      if (isMounted && token) {
        setFcmToken(token);
        console.log("Medimate: Push Token hiện tại:", token);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isExpoGo]);

  return fcmToken;
}
