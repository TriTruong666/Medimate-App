// hooks/useReminderNotification.ts
// Lắng nghe Firebase foreground notifications và hiện popup khi đến giờ uống thuốc
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { usePopup } from "@/stores/popupStore";
import { Platform } from "react-native";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { authSessionAtom } from "@/stores/authStore";

// Cấu hình hiển thị thông báo khi app đang mở (foreground)
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const type = notification.request.content.data?.type as string | undefined;

        // Với reminder thuốc → KHÔNG hiện system banner (popup app sẽ xử lý)
        if (type === 'MEDICATION_REMINDER') {
            return {
                shouldShowAlert: false,
                shouldShowBanner: false,
                shouldShowList: false,
                shouldPlaySound: true,
                shouldSetBadge: true,
            };
        }

        // Các loại thông báo khác → hiện system banner bình thường
        return {
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        };
    },
});

export function useReminderNotification() {
    const { open } = usePopup();
    const session = useAtomValue(authSessionAtom);

    useEffect(() => {
        // Đảm bảo tạo Notification Channel toàn cục trên Android ngay khi mở app
        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }

        // Lắng nghe NOTIFICATIONs khi app đang FOREGROUND (mở app)
        const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
            const data = notification.request.content.data as any;
            const type = data?.type as string | undefined;

            if (type === 'MEDICATION_REMINDER' || type === 'REMINDER') {
                // Hiện popup in-app thay vì system banner
                open({
                    type: 'reminder_alert',
                    data: {
                        reminderId: data?.reminderId || '',
                        scheduleName: data?.scheduleName || notification.request.content.title || 'Nhắc nhở uống thuốc',
                        memberName: data?.memberName,
                        reminderTime: data?.reminderTime || new Date().toISOString(),
                        endTime: data?.endTime,
                        autoSnooze: data?.autoSnooze === 'true',
                        medicines: data?.medicines ? (
                            typeof data.medicines === 'string'
                                ? JSON.parse(data.medicines)
                                : data.medicines
                        ) : [],
                    }
                });
            }
        });

        // Lắng nghe khi user BẤM VÀO thông báo lúc app đang background/closed
        const backgroundTapSub = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data as any;
            const type = data?.type as string | undefined;

            if (type === 'MEDICATION_REMINDER' || type === 'REMINDER') {
                open({
                    type: 'reminder_alert',
                    data: {
                        reminderId: data?.reminderId || '',
                        scheduleName: data?.scheduleName || response.notification.request.content.title || 'Nhắc nhở uống thuốc',
                        memberName: data?.memberName,
                        reminderTime: data?.reminderTime || new Date().toISOString(),
                        endTime: data?.endTime,
                        autoSnooze: data?.autoSnooze === 'true',
                        medicines: data?.medicines ? (
                            typeof data.medicines === 'string'
                                ? JSON.parse(data.medicines)
                                : data.medicines
                        ) : [],
                    }
                });
            } else if (
                type?.startsWith('APPOINTMENT_') || 
                type?.startsWith('SESSION_') || 
                type?.startsWith('GUARDIAN_') || 
                type === 'UPCOMING_APPOINTMENT'
            ) {
                // Điều hướng tới trang Lịch sử khám / Lịch hẹn
                if (session?.role === 'manager') {
                    router.push('/(manager)/(doctor)/appointments');
                } else if (session?.role === 'member') {
                    router.push('/(member)/(appointment)');
                }
            }
        });

        return () => {
            foregroundSub.remove();
            backgroundTapSub.remove();
        };
    }, [open, session]);
}

// Global injector component
export function ReminderNotificationInjector() {
    useReminderNotification();
    return null;
}
