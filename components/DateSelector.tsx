import React, { useRef, useEffect } from "react";
import { ScrollView, Pressable, Text, View } from "react-native";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

export default function DateSelector({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
    // Sinh ra list 30 ngày: 15 ngày trước, hôm nay, 14 ngày sau
    const dates = Array.from({ length: 30 }).map((_, i) => dayjs().subtract(15, 'day').add(i, 'day'));
    const scrollViewRef = useRef<ScrollView>(null);

    // Cuộn đến ngày hiện tại
    useEffect(() => {
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: 15 * 68 - 100, animated: true });
            }
        }, 300);
    }, []);

    return (
        <View className="mb-6 mt-2">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl text-black font-space-bold">Lịch trình</Text>
                <Pressable onPress={() => onSelect(dayjs().format("YYYY-MM-DD"))}>
                    <Text className="text-sm font-space-bold text-blue-600 underline">Hôm nay</Text>
                </Pressable>
            </View>
            <ScrollView 
                ref={scrollViewRef}
                horizontal 
                showsHorizontalScrollIndicator={false} 
            >
                {dates.map((date, idx) => {
                    const dateStr = date.format("YYYY-MM-DD");
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === dayjs().format("YYYY-MM-DD");
                    const isPast = date.isBefore(dayjs(), 'day');

                    const viDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                    const dayName = viDays[date.day()];

                    return (
                        <Pressable 
                            key={idx} 
                            onPress={() => onSelect(dateStr)}
                            className={`mr-3 items-center justify-center rounded-[20px] w-14 h-[75px] border-2 shadow-sm ${isSelected ? 'bg-[#9370DB] border-black' : isPast ? 'bg-gray-100 border-gray-300' : 'bg-white border-black/20'}`}
                        >
                            <Text className={`text-[10px] font-space-bold uppercase mb-1 ${isSelected ? 'text-white/80' : isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                                {dayName}
                            </Text>
                            <Text className={`text-xl font-space-bold ${isSelected ? 'text-white' : isPast ? 'text-gray-400' : 'text-black'}`}>
                                {date.format("DD")}
                            </Text>
                            {isToday && (
                                <View className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`} />
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}
