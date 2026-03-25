import { PopupContainer } from "@/components/popup/PopupContainer";
import { usePopup } from "@/stores/popupStore";
import { useToast } from "@/stores/toastStore";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
  Building2,
  Calendar,
  Check,
  FileText,
  ImageIcon,
  Pill,
  Plus,
  Sparkles,
  Upload,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useCreatePrescription, useScanPrescription } from "@/hooks/usePrescription";
import { UpsertPrescriptionRequest, PrescriptionMedicine } from "@/types/Prescription";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UploadStep = "upload" | "photo_preview" | "analyzing" | "result";

export default function UploadPrescriptionScreen() {
  const toast = useToast();
  const popup = usePopup();

  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<UploadStep>("upload");
  const { memberId } = useLocalSearchParams<{ memberId: string }>();

  React.useEffect(() => {
    if (!memberId) {
      toast.error("Lỗi", "Không tìm thấy thông tin thành viên.");
      router.back();
    }
  }, [memberId]);

  const { mutateAsync: scanAsync } = useScanPrescription();
  const { mutate: createPrescription, isPending } = useCreatePrescription();

  // Local state for extracted data to allow editing
  const [prescriptionData, setPrescriptionData] = useState({
    prescriptionCode: "MED-" + Math.random().toString(36).substring(7).toUpperCase(),
    doctorName: "",
    hospitalName: "",
    prescriptionDate: new Date().toLocaleDateString("vi-VN"),
    notes: "",
    medicines: [] as PrescriptionMedicine[],
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (step === "analyzing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [step, pulseAnim]);

  const pickImage = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
        setStep("photo_preview");
      }
    } catch (error) {
      toast.error("Lỗi", "Không thể lấy ảnh từ thư viện.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPhoto = async () => {
    if (!memberId) return;
    setStep("analyzing");
    
    try {
      const res = await scanAsync({ memberId, file: photo });
      if (res.success && res.data?.extractedData) {
        const extracted = res.data.extractedData;
        setPrescriptionData(prev => ({
          ...prev,
          prescriptionCode: extracted.prescriptionCode || prev.prescriptionCode,
          doctorName: extracted.doctorName || "",
          hospitalName: extracted.hospitalName || "",
          prescriptionDate: extracted.prescriptionDate || prev.prescriptionDate,
          notes: extracted.notes || "",
          medicines: extracted.medicines || []
        }));
        setStep("result");
        toast.success("Thành công", "AI đã đọc xong hóa đơn thuốc!");
      } else {
        toast.error("Lỗi", res.message || "Không thể phân tích.");
        setStep("photo_preview");
      }
    } catch (error) {
      toast.error("Lỗi", "Có lỗi xảy ra khi gọi AI.");
      setStep("photo_preview");
    }
  };

  const handleSavePrescription = () => {
    if (!memberId) return;
    
    const requestData: UpsertPrescriptionRequest = {
        prescriptionCode: prescriptionData.prescriptionCode,
        hospitalName: prescriptionData.hospitalName,
        doctorName: prescriptionData.doctorName,
        prescriptionDate: prescriptionData.prescriptionDate,
        notes: prescriptionData.notes,
        images: [],
        medicines: prescriptionData.medicines.map(m => ({
            medicineName: m.medicineName,
            dosage: m.dosage,
            unit: m.unit,
            quantity: m.quantity,
            instructions: m.instructions
        }))
    };

    createPrescription(
        { memberId, data: requestData },
        {
            onSuccess: (res) => {
                if (res.success) {
                    router.back();
                }
            }
        }
    );
  };

  const openAddMedicine = () => {
    popup.open({
      type: "medicine_detail",
      onSave: (newMed) => {
        setPrescriptionData((prev) => ({
          ...prev,
          medicines: [...prev.medicines, newMed],
        }));
        toast.success("Đã thêm", `Đã bổ sung ${newMed.medicineName}`);
      },
    });
  };

  const openEditMedicine = (med: any) => {
    popup.open({
      type: "medicine_detail",
      data: {
        ...med,
        onDelete: (id: string) => {
          setPrescriptionData((prev) => ({
            ...prev,
            medicines: prev.medicines.filter(
              (m) => m.prescriptionMedicineId !== id
            ),
          }));
          popup.close();
          toast.info("Đã xóa", "Đã xóa thuốc khỏi danh sách.");
        },
      },
      onSave: (updatedMed) => {
        setPrescriptionData((prev) => ({
          ...prev,
          medicines: prev.medicines.map((m) =>
            m.prescriptionMedicineId === updatedMed.prescriptionMedicineId
              ? updatedMed
              : m
          ),
        }));
        toast.success("Đã cập nhật", "Thông tin thuốc đã được thay đổi.");
      },
    });
  };

  // ===================================
  // RENDER: STEPS
  // ===================================
  const renderContent = () => {
    if (step === "analyzing") {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View
            style={{ transform: [{ scale: pulseAnim }] }}
            className="mb-10 w-40 h-40 bg-white border-4 border-black rounded-full items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <Sparkles size={64} color="#D9AEF6" fill="#D9AEF6" />
          </Animated.View>
          <Text className="text-[28px] font-space-bold text-black text-center mb-4 tracking-tight">
            AI Đang phân tích...
          </Text>
          <Text className="text-[16px] font-space-medium text-gray-500 text-center leading-relaxed px-4">
            Vui lòng đợi trong giây lát, chúng tôi đang trích xuất dữ liệu từ
            ảnh chụp của bạn.
          </Text>
        </View>
      );
    }

    if (step === "result") {
      return (
        <View className="flex-1">
          <View className="px-6 py-4 flex-row items-center justify-between border-black/5">
            <Pressable
              onPress={() => router.back()}
              className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:opacity-80"
            >
              <AntDesign name="arrow-left" size={24} color="black" />
            </Pressable>
            <Pressable
              onPress={() => setStep("upload")}
              className="flex-row items-center bg-white border-2 gap-x-2 border-black px-4 py-2 rounded-2xl active:bg-gray-100 shadow-sm"
            >
              <ImageIcon size={18} color="black" />
              <Text className="font-space-bold uppercase text-[12px]">
                Chọn lại
              </Text>
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Card */}
            <View className="bg-white border-2 border-black rounded-[24px] p-6 shadow-md mb-8">
              <Text className="text-lg font-space-bold mb-5 text-black border-b-2 border-black/5 pb-2">
                Thông tin chung
              </Text>
              <View className="gap-y-5">
                {[
                  {
                    label: "Mã đơn",
                    icon: <FileText size={18} color="black" />,
                    value: prescriptionData.prescriptionCode,
                  },
                  {
                    label: "Cơ sở khám",
                    icon: <Building2 size={18} color="black" />,
                    value: prescriptionData.hospitalName,
                  },
                  {
                    label: "Bác sĩ",
                    icon: <UserIcon size={18} color="black" />,
                    value: prescriptionData.doctorName,
                  },
                  {
                    label: "Ngày lập",
                    icon: <Calendar size={18} color="black" />,
                    value: prescriptionData.prescriptionDate,
                  },
                ].map((item, i) => (
                  <View key={i}>
                    <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                      {item.label}
                    </Text>
                    <View className="flex-row items-center bg-[#F3F4F6] border-2 border-black rounded-2xl px-4 py-3 gap-x-3">
                      <View>{item.icon}</View>
                      <Text
                        className="text-base font-space-bold text-black flex-1"
                        numberOfLines={1}
                      >
                        {item.value}
                      </Text>
                    </View>
                  </View>
                ))}
                <View>
                  <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                    Lời dặn của bác sĩ
                  </Text>
                  <View className="bg-[#FFF9C4] border-2 border-black rounded-2xl p-4 shadow-sm">
                    <Text className="text-[15px] font-space-medium text-black leading-snug">
                      {prescriptionData.notes}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Medicines List */}
            <Text className="text-xl font-space-bold text-black mb-4 px-1">
              Danh sách Thuốc ({prescriptionData.medicines.length})
            </Text>
            <View className="gap-y-6 mb-8">
              {prescriptionData.medicines.map((med, index) => (
                <Pressable
                  key={med.prescriptionMedicineId}
                  onPress={() => openEditMedicine(med)}
                  className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-md active:bg-gray-50 active:scale-[0.98]"
                >
                  <View className="bg-[#D9AEF6] px-5 py-4 border-b-2 border-black flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1 pr-2 gap-x-3">
                      <View className="w-10 h-10 bg-white rounded-full border-2 border-black items-center justify-center shadow-sm">
                        <Pill size={20} color="black" />
                      </View>
                      <Text
                        className="text-[17px] font-space-bold text-black flex-1"
                        numberOfLines={1}
                      >
                        {med.medicineName}
                      </Text>
                    </View>
                    <View className="bg-white border-2 border-black px-2 py-1 rounded-lg">
                      <Text className="font-space-bold text-[13px] text-black">
                        {med.quantity} {med.unit}
                      </Text>
                    </View>
                  </View>
                  <View className="p-5 gap-y-4">
                    <View>
                      <Text className="text-[11px] font-space-bold mb-1 ml-1 uppercase text-gray-400 tracking-widest">
                        Liều dùng
                      </Text>
                      <View className="bg-[#F8F9FA] border-2 border-black rounded-xl p-3">
                        <Text className="text-base font-space-bold text-black">
                          {med.dosage}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text className="text-[11px] font-space-bold mb-1 ml-1 uppercase text-gray-400 tracking-widest">
                        Cách sử dụng
                      </Text>
                      <View className="bg-gray-50 border-2 border-dashed border-black/10 rounded-xl p-3">
                        <Text className="text-[15px] font-space-medium text-gray-700 leading-relaxed">
                          {med.instructions}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Add Manual Button */}
            <Pressable
              onPress={openAddMedicine}
              className="bg-white border-2 border-dashed border-black/30 rounded-[24px] py-6 flex-row items-center justify-center gap-x-2 active:bg-gray-50 active:opacity-80"
            >
              <Plus size={20} color="#666" strokeWidth={3} />
              <Text className="font-space-bold text-gray-500 uppercase tracking-wider">
                Bổ sung thêm thuốc khác
              </Text>
            </Pressable>
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 bg-[#F9F6FC] px-6 pb-10 pt-4 border-t-2 border-black/5">
            <Pressable
              disabled={isPending || prescriptionData.medicines.length === 0}
              onPress={handleSavePrescription}
              className={`w-full py-5 rounded-[24px] border-2 border-black flex-row items-center justify-center gap-x-2 shadow-md active:translate-y-0.5 ${prescriptionData.medicines.length > 0 ? "bg-[#A3E6A1]" : "bg-gray-200 border-gray-400"} ${isPending ? "opacity-70" : ""}`}
            >
              {isPending ? (
                  <ActivityIndicator color="black" />
              ) : (
                  <Check size={24} color={prescriptionData.medicines.length > 0 ? "black" : "#666"} strokeWidth={3} />
              )}
              <Text className={`text-lg font-space-bold uppercase ${prescriptionData.medicines.length > 0 ? "text-black" : "text-gray-500"}`}>
                {isPending ? "Đang lưu..." : "Lưu Đơn Thuốc Này"}
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (step === "photo_preview" && photo) {
      return (
        <View className="flex-1 p-6">
          <View className="flex-row items-center justify-between mb-6">
            <Pressable
              onPress={() => {
                setPhoto(null);
                setStep("upload");
              }}
              className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm"
            >
              <AntDesign name="arrow-left" size={24} color="black" />
            </Pressable>
            <Text className="text-xl font-space-bold uppercase">
              Xác nhận ảnh
            </Text>
            <View className="w-12" />
          </View>
          <View className="flex-1 bg-white border-2 border-black rounded-[32px] overflow-hidden shadow-md mb-8">
            <Image
              source={{ uri: photo.uri }}
              style={{ flex: 1, backgroundColor: "#E5E7EB" }}
              contentFit="contain"
            />
          </View>
          <View className="flex-row gap-4 mb-4">
            <Pressable
              onPress={() => {
                setPhoto(null);
                setStep("upload");
              }}
              className="flex-1 bg-white py-4 rounded-2xl border-2 border-black items-center shadow-sm"
            >
              <Text className="font-space-bold uppercase text-black">
                Chọn lại
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmPhoto}
              className="flex-1 bg-[#D9AEF6] py-4 rounded-2xl border-2 border-black flex-row items-center justify-center gap-x-2 shadow-md active:translate-y-0.5"
            >
              <Sparkles size={18} color="black" />
              <Text className="font-space-bold uppercase text-black">
                Phân tích bằng AI
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // DEFAULT: UPLOAD STATE
    return (
      <View className="flex-1">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:opacity-80"
          >
            <AntDesign name="arrow-left" size={24} color="black" />
          </Pressable>
          <View className="w-12" />
        </View>

        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="mb-6">
            <Text className="text-4xl text-black font-space-bold tracking-tighter">
              Tải ảnh lên
            </Text>
            <Text className="text-[17px] text-gray-500 mt-2 font-space-medium leading-relaxed">
              Hệ thống AI sẽ tự động phân tích hóa đơn hoặc toa thuốc từ thư viện
              ảnh của bạn.
            </Text>
          </View>

          <Pressable
            onPress={pickImage}
            disabled={isProcessing}
            className="h-80 bg-white border-4 border-dashed border-black/20 rounded-[40px] items-center justify-center active:bg-gray-50 mt-4"
          >
            {isProcessing ? (
              <View className="items-center">
                <ActivityIndicator size="large" color="black" className="mb-4" />
                <Text className="font-space-bold text-gray-500 uppercase">
                  Đang mở thư viện...
                </Text>
              </View>
            ) : (
              <View className="items-center px-8">
                <View className="w-24 h-24 bg-[#D9AEF6] border-2 border-black rounded-[28px] items-center justify-center shadow-sm mb-6">
                  <Upload size={40} color="black" strokeWidth={2} />
                </View>
                <Text className="text-xl font-space-bold text-black text-center mb-2">
                  Nhấn để chọn ảnh
                </Text>
                <Text className="text-sm font-space-medium text-gray-500 text-center">
                  Hỗ trợ PNG, JPG (Tối đa 10MB)
                </Text>
              </View>
            )}
          </Pressable>

          <View className="mt-8 bg-black/5 rounded-[24px] p-6 border-2 border-black/10">
            <Text className="font-space-bold text-black mb-2 flex-row items-center uppercase tracking-widest text-[11px]">
              Mẹo để AI đọc tốt nhất:
            </Text>
            <View className="gap-y-2 mt-2">
              <Text className="text-[14px] font-space-medium text-gray-600">
                • Ảnh chụp rõ nét, không bị mờ nhòe.
              </Text>
              <Text className="text-[14px] font-space-medium text-gray-600">
                • Ảnh nằm ngang thẳng, không bị chói sáng.
              </Text>
              <Text className="text-[14px] font-space-medium text-gray-600">
                • Khung hình bao gồm toàn bộ đơn thuốc.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top", "bottom"]}>
      {renderContent()}
      <PopupContainer />
    </SafeAreaView>
  );
}

