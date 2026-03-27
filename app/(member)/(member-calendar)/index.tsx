import { useGetMemberById } from "@/hooks/useMember";
import { useGetMemberDailyReminders, useGetMemberSchedules, useUpdateReminderAction } from "@/hooks/useSchedule";
import { ReminderResponse } from "@/types/Schedule";
import { getDecodedToken } from "@/utils/token";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useRouter } from "expo-router";
import {
  Activity,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  StretchHorizontal
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

dayjs.locale("vi");

export default function MemberCalendarScreen() {
  const router = useRouter();

  // 1. Lấy thông tin Member hiện tại từ Token & Profile
  const [memberId, setMemberId] = useState<string | undefined>(undefined);
  const [loadingToken, setLoadingToken] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const decoded = await getDecodedToken();
        if (decoded) {
          setMemberId(decoded.MemberId);
        }
      } finally {
        setLoadingToken(false);
      }
    };
    fetchToken();
  }, []);

  const { data: memberProfile, isLoading: loadingMember } = useGetMemberById(memberId);
  const memberName = memberProfile?.fullName;

  const [viewMode, setViewMode] = useState<"7days" | "30days">("7days");
  const [selectedDateStr, setSelectedDateStr] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentMonthStr, setCurrentMonthStr] = useState(dayjs().format("YYYY-MM-DD"));

  // Update currentTime mỗi phút để logic nút nhắc nhở chính xác
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60000);
    return () => clearInterval(timer);
  }, []);

  const selectedDate = useMemo(() => dayjs(selectedDateStr), [selectedDateStr]);
  const currentMonth = useMemo(() => dayjs(currentMonthStr), [currentMonthStr]);

  // 2. APIs - Lấy danh sách nhắc nhở theo ngày
  const {
    data: dailyReminders = [],
    isLoading: loadingReminders,
    refetch: refetchReminders
  } = useGetMemberDailyReminders(memberId, selectedDateStr);

  // 3. APIs - Lấy danh sách lịch để hiển thị chấm trên lịch (Dots)
  const { data: allSchedules = [] } = useGetMemberSchedules(memberId);

  const hasDataOnDate = (date: dayjs.Dayjs) => {
    // Kiểm tra xem có lịch nhắc nhở nào trong đợt điều trị của member không
    return (allSchedules || []).some((schedule: any) => {
      return (schedule.scheduleDetails || []).some((detail: any) => {
        const start = dayjs(detail.startDate).startOf('day');
        const end = detail.endDate ? dayjs(detail.endDate).endOf('day') : null;
        const current = date.startOf('day');

        if (end) {
          return (current.isSame(start) || current.isAfter(start)) &&
            (current.isSame(end) || current.isBefore(end));
        }
        return current.isSame(start) || current.isAfter(start);
      });
    });
  };

  const weekDays = useMemo(() => {
    const start = selectedDate.startOf("week");
    return Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const startOfMonth = currentMonth.startOf("month");
    const daysInMonth = currentMonth.daysInMonth();
    const startDay = startOfMonth.day();
    const days = [];
    for (let i = startDay - 1; i >= 0; i--) days.push(startOfMonth.subtract(i + 1, "day"));
    for (let i = 0; i < daysInMonth; i++) days.push(startOfMonth.add(i, "day"));
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 0; i < remaining; i++) days.push(startOfMonth.add(daysInMonth + i, "day"));
    return days;
  }, [currentMonth]);

  const BORDER_COLOR = "#000000";
  const SOFT_PURPLE = "#D9AEF6";
  const MINT_GREEN = "#A3E6A1";

  const SHADOW_MD = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  };

  if (loadingMember || loadingToken || !memberId) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9F6FC", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F6FC" }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 100 }}>
        {/* Đối với tab Member, có thể không cần nút Back nếu đây là root TAB */}
        {/* Nhưng ta cứ giữ để đồng bộ nếu cần (hoặc đổi thành tiêu đề) */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: "SpaceGrotesk_700Bold", color: "#000" }}>Lịch uống thuốc</Text>
        </View>

        <View style={{ flexDirection: "row", backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 14, padding: 3 }}>
          <Pressable
            onPress={() => setViewMode("7days")}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: viewMode === "7days" ? "#000" : "transparent" }}
          >
            <StretchHorizontal size={16} color={viewMode === "7days" ? "#FFF" : "#000"} />
            {viewMode === "7days" && <Text style={{ color: "#fff", fontFamily: "SpaceGrotesk_700Bold", fontSize: 10 }}>7 DAYS</Text>}
          </Pressable>
          <Pressable
            onPress={() => setViewMode("30days")}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: viewMode === "30days" ? "#000" : "transparent" }}
          >
            <LayoutGrid size={16} color={viewMode === "30days" ? "#FFF" : "#000"} />
            {viewMode === "30days" && <Text style={{ color: "#fff", fontFamily: "SpaceGrotesk_700Bold", fontSize: 10 }}>30 DAYS</Text>}
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Name Info */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12, marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={{ fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase" }}>CHÀO BẠN,</Text>
            <Text style={{ fontSize: 28, fontFamily: "SpaceGrotesk_700Bold", color: "#000", letterSpacing: -0.5 }}>{memberName || "Thành viên"}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 18, fontFamily: "SpaceGrotesk_700Bold", color: "#000", textTransform: "uppercase" }}>{currentMonth.format("MMMM")}</Text>
          </View>
        </View>

        {/* CALENDAR BLOCK */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          {viewMode === "7days" ? (
            <View style={{ flexDirection: "row", backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 24, padding: 6, ...SHADOW_MD }}>
              {weekDays.map((day, idx) => {
                const isSelected = day.format("YYYY-MM-DD") === selectedDateStr;
                const isToday = day.isSame(dayjs(), "day");
                const hasData = hasDataOnDate(day);
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setSelectedDateStr(day.format("YYYY-MM-DD"))}
                    style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 18, backgroundColor: isSelected ? "#000" : "transparent" }}
                  >
                    <Text style={{ fontSize: 9, fontFamily: "SpaceGrotesk_700Bold", color: isSelected ? "#9CA3AF" : "#94A3B8", marginBottom: 2, textTransform: "uppercase" }}>{day.format("ddd")}</Text>
                    <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: isToday && !isSelected ? "#FEF9C3" : "transparent" }}>
                      <Text style={{ fontSize: 16, fontFamily: "SpaceGrotesk_700Bold", color: isSelected ? "#fff" : "#000" }}>{day.format("D")}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 2, marginTop: 4, height: 5 }}>
                      {hasData && (
                        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: isSelected ? MINT_GREEN : MINT_GREEN }} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={{ backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 24, padding: 14, ...SHADOW_MD }}>
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", color: "#94A3B8" }}>{d}</Text>
                ))}
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {monthDays.map((day, idx) => {
                  const isCurrentMonth = day.isSame(currentMonth, "month");
                  const isSelected = day.format("YYYY-MM-DD") === selectedDateStr;
                  const isToday = day.isSame(dayjs(), "day");
                  const hasData = isCurrentMonth && hasDataOnDate(day);

                  return (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        setSelectedDateStr(day.format("YYYY-MM-DD"));
                        if (!isCurrentMonth) setCurrentMonthStr(day.startOf("month").format("YYYY-MM-DD"));
                      }}
                      style={{
                        width: "14.28%",
                        aspectRatio: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 2,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.05)",
                        backgroundColor: isSelected ? SOFT_PURPLE : "transparent",
                        borderRadius: isSelected ? 12 : 0,
                        zIndex: isSelected ? 10 : 1,
                        transform: isSelected ? [{ scale: 1.1 }] : [{ scale: 1 }],
                        ...(isSelected ? { borderWidth: 2, borderColor: BORDER_COLOR } : {})
                      }}
                    >
                      <Text style={{ fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", color: isSelected ? "#000" : isCurrentMonth ? (isToday ? MINT_GREEN : "#000") : "#E2E8F0" }}>{day.format("D")}</Text>
                      <View style={{ flexDirection: "row", gap: 1.5, marginTop: 2, height: 4 }}>
                        {hasData && isCurrentMonth && (
                          <>
                            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(0,0,0,0.2)" }} />
                            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(0,0,0,0.2)" }} />
                          </>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTopWidth: 1.5, borderTopColor: "rgba(0,0,0,0.05)" }}>
                <Pressable onPress={() => setCurrentMonthStr(currentMonth.subtract(1, "month").format("YYYY-MM-DD"))} style={{ padding: 8, backgroundColor: "#F9FAFB", borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 10 }}>
                  <ChevronLeft size={20} color="#000" strokeWidth={2.5} />
                </Pressable>
                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748B" }}>{currentMonth.format("MMMM YYYY")}</Text>
                <Pressable onPress={() => setCurrentMonthStr(currentMonth.add(1, "month").format("YYYY-MM-DD"))} style={{ padding: 8, backgroundColor: "#F9FAFB", borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 10 }}>
                  <ChevronRight size={20} color="#000" strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Selection Details */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: "#000" }}>{selectedDate.isSame(dayjs(), "day") ? "Hôm nay," : selectedDate.format("dddd,")}</Text>
              <Text style={{ color: "#64748B", fontFamily: "SpaceGrotesk_500Medium", fontSize: 14 }}>Ngày {selectedDate.format("DD")} tháng {selectedDate.format("MM")}</Text>
            </View>
            <View style={{ backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 11, fontFamily: "SpaceGrotesk_700Bold" }}>{!dailyReminders || dailyReminders.length === 0 ? "TRỐNG" : `${dailyReminders.length} CỬ UỐNG`}</Text>
            </View>
          </View>

          <View style={{ gap: 20 }}>
            {loadingReminders ? (
              <View style={{ paddingVertical: 100 }}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ textAlign: "center", marginTop: 10, fontFamily: "SpaceGrotesk_500Medium" }}>Đang tải lịch trình...</Text>
              </View>
            ) : (!dailyReminders || dailyReminders.length === 0) ? (
              <View style={{ paddingVertical: 70, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER_COLOR, borderStyle: "dashed", borderRadius: 30 }}>
                <CalendarIcon size={44} color="#E2E8F0" strokeWidth={1} />
                <Text style={{ fontSize: 18, fontFamily: "SpaceGrotesk_700Bold", color: "#94A3B8", marginTop: 12 }}>Không có lịch</Text>
              </View>
            ) : (
              (dailyReminders || []).map((reminder: ReminderResponse, index: number) => (
                <TimelineItem
                  key={reminder.reminderId}
                  reminder={reminder}
                  index={index}
                  isLast={index === (dailyReminders || []).length - 1}
                  color={index % 3 === 0 ? "#FFD700" : index % 3 === 1 ? MINT_GREEN : SOFT_PURPLE}
                  selectedDateStr={selectedDateStr}
                  now={now}
                  onStatusUpdate={refetchReminders}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineItem({
  reminder,
  index,
  isLast,
  color,
  selectedDateStr,
  now,
  onStatusUpdate
}: {
  reminder: ReminderResponse;
  index: number;
  isLast: boolean;
  color: string;
  selectedDateStr: string;
  now: dayjs.Dayjs;
  onStatusUpdate: () => void;
}) {
  const isTaken = reminder.status === "Taken";
  const { mutate: updateStatus, isPending: updating } = useUpdateReminderAction();

  // LOGIC NHẮC NHỞ: 15 PHÚT TRƯỚC GIỜ UỐNG
  const showNotifyButton = useMemo(() => {
    if (isTaken) return false;

    // Kiểm tra xem có phải ngày hôm nay không
    const isToday = dayjs(selectedDateStr).isSame(dayjs(), 'day');
    if (!isToday) return false;

    // Parse giờ uống thuốc
    const [h, m] = reminder.reminderTime.split(':').map(Number);
    const reminderTimeToday = dayjs().hour(h).minute(m).second(0);

    // Tính khoảng cách phút
    const diffMinutes = reminderTimeToday.diff(now, 'minute');

    // Hiển thị nếu trong khoảng 0 - 15 phút tới giờ uống
    return diffMinutes >= 0 && diffMinutes <= 15;
  }, [reminder.reminderTime, reminder.status, selectedDateStr, now, isTaken]);

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ alignItems: "center", marginRight: 14 }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: "#000", alignItems: "center", justifyContent: "center", backgroundColor: color, zIndex: 10 }}>
          <Clock size={16} color="#000" strokeWidth={2.5} />
        </View>
        {!isLast && <View style={{ width: 4, flex: 1, backgroundColor: "rgba(0,0,0,0.08)", marginVertical: 4, borderRadius: 2 }} />}
      </View>

      <View style={{ flex: 1, backgroundColor: "#fff", borderWidth: 2, borderColor: "#000", borderRadius: 24, padding: 18, marginBottom: 4, ...{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 } }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>Lúc {reminder.reminderTime}</Text>
            <Text style={{ fontSize: 19, fontFamily: "SpaceGrotesk_700Bold", color: "#000" }} numberOfLines={1}>{reminder.scheduleName}</Text>
          </View>
          <View style={{ backgroundColor: isTaken ? "#A3E6A1" : "transparent", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1.5, borderColor: isTaken ? "transparent" : "rgba(0,0,0,0.1)" }}>
            <Text style={{ fontSize: 9, fontFamily: "SpaceGrotesk_700Bold", color: isTaken ? "#000" : "#94A3B8" }}>{isTaken ? "ĐÃ UỐNG" : "CHƯA UỐNG"}</Text>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {reminder.medicines.map((med, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)", borderRadius: 12, padding: 10, gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", alignItems: "center", justifyContent: "center" }}>
                <Activity size={16} color="#000" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: "SpaceGrotesk_700Bold", color: "#000" }}>{med.medicineName}</Text>
                <Text style={{ fontSize: 12, fontFamily: "SpaceGrotesk_500Medium", color: "#64748B" }}>{med.dosage} • {med.instructions}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ACTIONS AREA */}
        {/* <View style={{ marginTop: 14, gap: 8 }}>
          {!isTaken && (
            <Pressable
              onPress={() => {
                updateStatus({
                  id: reminder.reminderId,
                  data: { status: "Taken", actualTime: dayjs().format("HH:mm:ss") }
                }, {
                  onSuccess: () => onStatusUpdate()
                });
              }}
              disabled={updating}
              style={{ backgroundColor: "#000", paddingVertical: 12, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#000", opacity: updating ? 0.6 : 1 }}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontFamily: "SpaceGrotesk_700Bold", fontSize: 12, textTransform: "uppercase" }}>Xác nhận đã uống</Text>
              )}
            </Pressable>
          )}
        </View> */}
      </View>
    </View>
  );
}
