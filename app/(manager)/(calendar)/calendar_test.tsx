import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Không có moti, không có animation, không có gì phức tạp
// Chỉ test thuần: chọn ngày → re-render danh sách

export default function CalendarTestScreen() {
  const router = useRouter();
  const { memberId, memberName } = useLocalSearchParams<{
    memberId: string;
    memberName: string;
  }>();

  const [selectedDateStr, setSelectedDateStr] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  const selectedDate = useMemo(() => dayjs(selectedDateStr), [selectedDateStr]);

  const weekDays = useMemo(() => {
    const start = selectedDate.startOf("week");
    return Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));
  }, [selectedDate]);

  // Mock data đơn giản
  const items = useMemo(() => {
    const d = selectedDate.date();
    if (d % 3 === 0) return [];
    return [
      { id: "1", name: "Paracetamol 500mg", time: "08:00" },
      { id: "2", name: "Vitamin C 1000mg", time: "14:00" },
      { id: "3", name: "Amoxicillin 250mg", time: "20:00" },
    ];
  }, [selectedDate]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F6FC" }}>
      {/* Header - chỉ dùng style inline, không className */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            backgroundColor: "#fff",
            borderWidth: 2,
            borderColor: "#000",
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          TEST LỊCH - {memberName || "Demo"}
        </Text>
      </View>

      {/* Tuần - 7 ngày */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 16,
          backgroundColor: "#fff",
          borderWidth: 2,
          borderColor: "#000",
          borderRadius: 20,
          padding: 8,
        }}
      >
        {weekDays.map((day, idx) => {
          const isSelected = day.format("YYYY-MM-DD") === selectedDateStr;
          const isToday = day.isSame(dayjs(), "day");
          return (
            <Pressable
              key={idx}
              onPress={() => {
                console.log("📅 TAP ngày:", day.format("YYYY-MM-DD"));
                setSelectedDateStr(day.format("YYYY-MM-DD"));
              }}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: isSelected ? "#000" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  color: isSelected ? "#aaa" : "#888",
                  marginBottom: 4,
                }}
              >
                {day.format("ddd").toUpperCase()}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: isSelected ? "#fff" : "#000",
                }}
              >
                {day.format("D")}
              </Text>
              {isToday && !isSelected && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#A3E6A1",
                    marginTop: 4,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Info */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          {selectedDate.isSame(dayjs(), "day")
            ? "Hôm nay"
            : selectedDate.format("dddd")}
        </Text>
        <Text style={{ fontSize: 14, color: "#888" }}>
          {selectedDate.format("DD/MM/YYYY")} • {items.length} thuốc
        </Text>
      </View>

      {/* Danh sách thuốc */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {items.length === 0 ? (
          <View
            style={{
              padding: 40,
              alignItems: "center",
              backgroundColor: "#fff",
              borderWidth: 2,
              borderColor: "#000",
              borderStyle: "dashed",
              borderRadius: 20,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#ccc" }}>
              Không có thuốc ngày này
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: "#fff",
                borderWidth: 2,
                borderColor: "#000",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 12, color: "#888", fontWeight: "bold" }}>
                {item.time}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {item.name}
              </Text>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
