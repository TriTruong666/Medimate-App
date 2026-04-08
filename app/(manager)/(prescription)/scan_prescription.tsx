import { PopupContainer } from "@/components/popup/PopupContainer";
import { useCreatePrescription, useScanPrescription } from "@/hooks/usePrescription";
import { usePopup } from "@/stores/popupStore";
import { useToast } from "@/stores/toastStore";
import { PrescriptionMedicine, UpsertPrescriptionRequest } from "@/types/Prescription";
import { AntDesign, Feather } from "@expo/vector-icons";
import {
  CameraCapturedPicture,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  Building2,
  Calendar,
  Camera,
  Check,
  FileText,
  Pill,
  Plus,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScanStep = "camera" | "photo_preview" | "analyzing" | "result";

export default function ScanPrescriptionScreen() {
  const toast = useToast();
  const popup = usePopup();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<ScanStep>("camera");
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

  // Animation logic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cameraRef = useRef<CameraView>(null);

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

  if (!permission)
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="black" />
      </View>
    );

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9F6FC] px-8 items-center justify-center">
        <Feather name="camera-off" size={64} color="black" className="mb-6" />
        <Text className="text-2xl font-space-bold mb-4">Cấp quyền Camera</Text>
        <Pressable
          className="bg-[#A3E6A1] px-10 py-4 rounded-2xl border-2 border-black shadow-md"
          onPress={requestPermission}
        >
          <Text className="font-space-bold uppercase">Cho phép ngay</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;
    try {
      setIsProcessing(true);
      const data = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (data) {
        setPhoto(data);
        setStep("photo_preview");
      }
    } catch (error) {
      toast.error("Lỗi", "Không thể chụp ảnh.");
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
          // QUAN TRỌNG: Gán ID tạm thời cho từng loại thuốc bóc tách được
          medicines: (extracted.medicines || []).map((m, index) => ({
            ...m,
            prescriptionMedicineId: `temp-${Date.now()}-${index}` // Gán ID để sửa được trong bộ nhớ đệm
          }))
        }));
        setStep("result");
        toast.success("Thành công", "AI đã đọc xong đơn thuốc!");
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

    const formatToISODate = (dateStr: string | undefined | null) => {
      if (!dateStr) return new Date().toISOString();
      const match = dateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
      if (match) {
        return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}T00:00:00.000Z`;
      }
      const isoMatch = dateStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
      if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}T00:00:00.000Z`;
      }
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed.toISOString();
      return new Date().toISOString();
    };

    const requestData: UpsertPrescriptionRequest = {
      prescriptionCode: prescriptionData.prescriptionCode,
      hospitalName: prescriptionData.hospitalName,
      doctorName: prescriptionData.doctorName,
      prescriptionDate: formatToISODate(prescriptionData.prescriptionDate),
      notes: prescriptionData.notes,
      images: [],
      medicines: prescriptionData.medicines.map(m => ({
        // Gửi null vì đây là tạo mới hoàn toàn, bỏ ID tạm "temp-..." đi
        prescriptionMedicineId: null,
        medicineName: m.medicineName,
        dosage: m.dosage,
        unit: m.unit,
        quantity: Number(m.quantity) || 0,
        instructions: m.instructions
      }))
    };
    createPrescription(
      { memberId, data: requestData },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success("Thành công", "Đã lưu đơn thuốc từ ảnh quét.");
            router.back();
          } else {
            toast.error("Lỗi lưu đơn", res.message || "Không thể lưu đơn thuốc.");
          }
        },
        onError: (err: any) => {
          console.error("Create Prescription Error:", err);
          toast.error("Lỗi", err?.response?.data?.message || "Không thể lưu đơn thuốc. Có thể ngày tháng hoặc thông tin chưa hợp lệ.");
        }
      }
    );
  };

  // Popup Handlers
  const openAddMedicine = () => {
    popup.open({
      type: "medicine_detail",
      onSave: (newMed) => {
        // Gán ID tạm cho thuốc thêm mới
        const medWithId = {
          ...newMed,
          prescriptionMedicineId: `temp-manual-${Date.now()}`
        };
        setPrescriptionData((prev) => ({
          ...prev,
          medicines: [...prev.medicines, medWithId],
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
          // Xóa thuốc khỏi bộ nhớ đệm local
          setPrescriptionData((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((m) => m.prescriptionMedicineId !== id),
          }));
          popup.close();
          toast.info("Đã xóa", "Đã xóa thuốc khỏi danh sách tạm.");
        },
      },
      onSave: (updatedMed) => {
        // CẬP NHẬT VÀO BỘ NHỚ ĐỆM (Không call API)
        setPrescriptionData((prev) => ({
          ...prev,
          medicines: prev.medicines.map((m) =>
            // Tìm đúng thuốc theo ID tạm để thay thế bằng dữ liệu đã sửa
            m.prescriptionMedicineId === updatedMed.prescriptionMedicineId ? updatedMed : m
          ),
        }));
        toast.success("Đã ghi nhớ", "Thông tin thuốc đã được cập nhật vào đơn.");
      },
    });
  };

  // ===================================
  // RENDER: STEPS
  // ===================================
  const renderContent = () => {
    if (!permission.granted) {
      return (
        <View className="flex-1 px-8 items-center justify-center">
          <Feather name="camera-off" size={64} color="black" className="mb-6" />
          <Text className="text-2xl font-space-bold mb-4">
            Cấp quyền Camera
          </Text>
          <Pressable
            className="bg-[#A3E6A1] px-10 py-4 rounded-2xl border-2 border-black shadow-md"
            onPress={requestPermission}
          >
            <Text className="font-space-bold uppercase">Cho phép ngay</Text>
          </Pressable>
        </View>
      );
    }

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
              onPress={() => setStep("camera")}
              className="flex-row items-center bg-white border-2 gap-x-2 border-black px-4 py-2 rounded-2xl active:bg-gray-100 shadow-sm"
            >
              <Camera size={18} color="black" />
              <Text className="font-space-bold uppercase text-[12px]">
                Chụp lại
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
                <View>
                  <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                    Mã đơn (Tự động)
                  </Text>
                  <View className="flex-row items-center bg-[#F3F4F6] border-2 border-black rounded-2xl px-4 py-3 gap-x-3">
                    <View>
                      <FileText size={18} color="black" />
                    </View>
                    <TextInput
                      value={prescriptionData.prescriptionCode}
                      onChangeText={(val) =>
                        setPrescriptionData((p) => ({ ...p, prescriptionCode: val }))
                      }
                      placeholder="Mã phân loại..."
                      placeholderTextColor="#A0A0A0"
                      className="font-space-bold text-black text-base flex-1 p-0"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                    Cơ sở khám
                  </Text>
                  <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm gap-x-3">
                    <View>
                      <Building2 size={18} color="black" />
                    </View>
                    <TextInput
                      value={prescriptionData.hospitalName}
                      onChangeText={(val) =>
                        setPrescriptionData((p) => ({ ...p, hospitalName: val }))
                      }
                      placeholder="VD: Bệnh viện / Phòng khám..."
                      placeholderTextColor="#A0A0A0"
                      className="flex-1 font-space-bold text-black text-base p-0"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                    Bác sĩ điều trị
                  </Text>
                  <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm gap-x-3">
                    <View>
                      <UserIcon size={18} color="black" />
                    </View>
                    <TextInput
                      value={prescriptionData.doctorName}
                      onChangeText={(val) =>
                        setPrescriptionData((p) => ({ ...p, doctorName: val }))
                      }
                      placeholder="VD: BS. Nguyễn Văn A"
                      placeholderTextColor="#A0A0A0"
                      className="flex-1 font-space-bold text-black text-base p-0"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                    Ngày lập đơn
                  </Text>
                  <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm gap-x-3">
                    <View>
                      <Calendar size={18} color="black" />
                    </View>
                    <TextInput
                      value={prescriptionData.prescriptionDate}
                      onChangeText={(val) =>
                        setPrescriptionData((p) => ({ ...p, prescriptionDate: val }))
                      }
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A0A0A0"
                      className="flex-1 font-space-bold text-black text-base p-0"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                    Lời dặn của bác sĩ
                  </Text>
                  <View className="bg-[#FFF9C4] border-2 border-black rounded-2xl px-4 py-3 min-h-[100px] shadow-sm">
                    <TextInput
                      value={prescriptionData.notes}
                      onChangeText={(val) =>
                        setPrescriptionData((p) => ({ ...p, notes: val }))
                      }
                      placeholder="Ghi chú thêm từ bác sĩ (Không bắt buộc)..."
                      placeholderTextColor="#A0A0A0"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      className="flex-1 font-space-medium text-black text-[15px] p-0 leading-snug"
                    />
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
                setStep("camera");
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
              style={{ flex: 1 }}
              contentFit="cover"
            />
          </View>
          <View className="flex-row gap-4 mb-4">
            <Pressable
              onPress={() => {
                setPhoto(null);
                setStep("camera");
              }}
              className="flex-1 bg-white py-4 gap-x-2 rounded-2xl border-2 border-black items-center shadow-sm"
            >
              <Text className="font-space-bold uppercase text-black">
                Chụp lại
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmPhoto}
              className="flex-1 bg-[#A3E6A1] py-4 rounded-2xl border-2 border-black flex-row items-center justify-center shadow-md gap-x-2 active:translate-y-0.5"
            >
              <Sparkles size={18} color="black" />
              <Text className="font-space-bold uppercase text-black">
                Đọc bằng AI
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // DEFAULT: CAMERA STATE
    return (
      <View className="flex-1">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:opacity-80"
          >
            <X size={24} color="black" />
          </Pressable>
          <View className="w-12" />
        </View>

        <View className="flex-1 m-6 bg-gray-200 border-2 border-black rounded-[28px] overflow-hidden shadow-lg">
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
          <View className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-white/60 rounded-tl-xl" />
          <View className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-white/80 rounded-tr-xl" />
          <View className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-white/60 rounded-bl-xl" />
          <View className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-white/80 rounded-br-xl" />
        </View>

        <View className="px-10 -mt-2 mb-2">
          <Text className="text-[13px] font-space-medium text-gray-500 text-center leading-snug">
            Căn chỉnh toa thuốc vào giữa khung hình và đảm bảo đủ ánh sáng để AI
            nhận diện tốt nhất.
          </Text>
        </View>

        <View className="h-40 items-center justify-center pb-8">
          <Pressable
            onPress={takePicture}
            className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            {isProcessing ? (
              <ActivityIndicator color="black" />
            ) : (
              <Camera size={32} color="black" />
            )}
          </Pressable>
        </View>
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
