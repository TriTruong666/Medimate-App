import { explainDrugInteraction } from "@/apis/prescription.api";
import { useToast } from "@/stores/toastStore";
import { AlertTriangle, BrainCircuit, X } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

interface DrugInteractionPopupProps {
    interactionData: any;
    onClose: () => void;
}

export const DrugInteractionPopup: React.FC<DrugInteractionPopupProps> = ({ interactionData, onClose }) => {
    const toast = useToast();
    const [explanationResult, setExplanationResult] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);

    if (!interactionData) return null;

    return (
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 24 }}>
            <View style={{ backgroundColor: "#fff", borderWidth: 2.5, borderColor: "#000", borderRadius: 28, width: "100%", maxHeight: "85%", shadowColor: "#000", shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6, overflow: "hidden" }}>
                <View style={{ backgroundColor: "#FEF2F2", padding: 20, borderBottomWidth: 2, borderBottomColor: "#000", flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ backgroundColor: "#FFF", padding: 8, borderRadius: 16, borderWidth: 2, borderColor: "#000" }}>
                        <AlertTriangle size={24} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: "#991B1B" }}>Tương tác thuốc!</Text>
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#B91C1C", marginTop: 2 }}>Phát hiện xung đột nguy hiểm</Text>
                    </View>
                    <Pressable onPress={onClose}>
                        <X size={24} color="#000" />
                    </Pressable>
                </View>
                <ScrollView style={{ padding: 20 }}>
                    <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 14, color: "#374151", marginBottom: 16, lineHeight: 22 }}>
                        Cảnh báo: Thuốc trong đơn có sự tương tác với nhau hoặc với thuốc đang sử dụng.
                    </Text>
                    {(interactionData?.conflicts || []).map((c: any, index: number) => (
                        <View key={index} style={{ backgroundColor: "#F9FAFB", borderWidth: 2, borderColor: "#E5E7EB", borderRadius: 16, padding: 16, marginBottom: 12 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <Text style={{ flex: 1, fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: "#DC2626" }}>{c.newDrugName}</Text>
                                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 12, color: "#000" }}>⚡</Text>
                                <Text style={{ flex: 1, fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: "#DC2626", textAlign: "right" }}>{c.conflictingDrugName}</Text>
                            </View>
                            <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: "#4B5563", lineHeight: 20 }}>{c.description}</Text>
                        </View>
                    ))}

                    {explanationResult ? (
                        <View style={{ marginTop: 8, marginBottom: 20, backgroundColor: "#EEF2FF", padding: 16, borderRadius: 16, borderWidth: 2, borderColor: "#4F46E5" }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: "#4F46E5", marginBottom: 8 }}>🤖 AI Giải thích:</Text>
                            <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 14, color: "#374151", lineHeight: 22 }}>
                                {explanationResult}
                            </Text>
                        </View>
                    ) : null}
                </ScrollView>

                <View style={{ padding: 20, borderTopWidth: 2, borderTopColor: "#000", backgroundColor: "#fff", flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                    {/* Nút Sửa Lại Đơn */}
                    <Pressable
                        onPress={() => {
                            if (interactionData?.onEditAgain) {
                                interactionData.onEditAgain();
                            } else {
                                onClose(); // Fallback dự phòng
                            }
                        }}
                        style={{ flex: 1, minWidth: "40%", paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: "#000", backgroundColor: "#fff", alignItems: "center" }}
                    >
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, color: "#000" }}>Sửa lại đơn</Text>
                    </Pressable>

                    {interactionData?.onIgnoreAndContinue && (
                        <Pressable
                            onPress={() => {
                                if (interactionData.onIgnoreAndContinue) {
                                    interactionData.onIgnoreAndContinue();
                                }
                            }}
                            style={{ flex: 1, minWidth: "40%", paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: "#B91C1C", backgroundColor: "#FEF2F2", alignItems: "center" }}
                        >
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, color: "#B91C1C" }}>Bỏ qua cảnh báo</Text>
                        </Pressable>
                    )}
                    <Pressable
                        disabled={isExplaining || !!explanationResult}
                        onPress={async () => {
                            setIsExplaining(true);
                            const res = await explainDrugInteraction(interactionData);
                            if (res.success) {
                                setExplanationResult(res.data);
                            } else {
                                toast.error("Lỗi", "Không thể lấy giải thích lúc này.");
                            }
                            setIsExplaining(false);
                        }}
                        style={{ flex: 1, minWidth: "90%", paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: "#000", backgroundColor: "#EEF2FF", alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, opacity: (isExplaining || explanationResult) ? 0.6 : 1 }}
                    >
                        {isExplaining ? <ActivityIndicator color="#4F46E5" /> : <BrainCircuit size={20} color="#4F46E5" />}
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: "#4F46E5" }}>{isExplaining ? "Đang phân tích..." : (explanationResult ? "Đã phân tích" : "AI Giải thích")}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};
