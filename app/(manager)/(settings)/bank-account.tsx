import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, Trash2, Building, User, Hash } from "lucide-react-native";
import { useGetUserBankAccount, useCreateUserBankAccount, useUpdateUserBankAccount, useDeleteUserBankAccount } from "@/hooks/useUserBank";
import { usePopup } from "@/stores/popupStore";

export default function BankAccountScreen() {
    const router = useRouter();
    const popup = usePopup();

    const { data: bankAccount, isLoading: isFetching } = useGetUserBankAccount();
    const { mutate: createBank, isPending: isCreating } = useCreateUserBankAccount();
    const { mutate: updateBank, isPending: isUpdating } = useUpdateUserBankAccount();
    const { mutate: deleteBank, isPending: isDeleting } = useDeleteUserBankAccount();

    const isSaving = isCreating || isUpdating;

    const [form, setForm] = useState({
        bankName: "",
        accountHolder: "",
        accountNumber: ""
    });

    useEffect(() => {
        if (bankAccount) {
            setForm({
                bankName: bankAccount.bankName || "",
                accountHolder: bankAccount.accountHolder || "",
                accountNumber: bankAccount.accountNumber || ""
            });
        }
    }, [bankAccount]);

    const handleSave = () => {
        if (!form.bankName.trim() || !form.accountHolder.trim() || !form.accountNumber.trim()) {
            popup.confirm({
                title: "Thiếu thông tin",
                message: "Vui lòng nhập đầy đủ Tên ngân hàng, Chủ tài khoản và Số tài khoản.",
                type: "danger",
                confirmLabel: "Đã hiểu",
                cancelLabel: "Đóng"
            }, () => {});
            return;
        }

        if (bankAccount) {
            updateBank({
                bankName: form.bankName.trim(),
                accountHolder: form.accountHolder.trim(),
                accountNumber: form.accountNumber.trim()
            });
        } else {
            createBank({
                bankName: form.bankName.trim(),
                accountHolder: form.accountHolder.trim(),
                accountNumber: form.accountNumber.trim()
            });
        }
    };

    const handleDelete = () => {
        if (!bankAccount) return;
        popup.confirm({
            title: "Xác nhận xóa",
            message: "Bạn có chắc chắn muốn xóa thông tin tài khoản ngân hàng này không? Việc hoàn tiền (nếu có) sẽ không thể thực hiện.",
            type: "danger",
            confirmLabel: "Xóa",
            cancelLabel: "Hủy"
        }, () => {
            deleteBank(undefined, {
                onSuccess: () => {
                    setForm({ bankName: "", accountHolder: "", accountNumber: "" });
                }
            });
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable onPress={() => router.back()} className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm">
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
                <Text className="text-xl text-black font-space-bold">Tài khoản hoàn tiền</Text>
                <View className="w-12" />
            </View>

            <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
                <View className="bg-[#FFF3E0] border-2 border-black rounded-[24px] p-5 mb-6 mt-4 shadow-sm">
                    <Text className="text-black font-space-bold text-lg mb-2">Lưu ý quan trọng</Text>
                    <Text className="text-gray-700 font-space-medium text-sm leading-5">
                        Tài khoản ngân hàng này sẽ được sử dụng để nhận tiền hoàn trả trong trường hợp lịch hẹn của bạn bị hủy hợp lệ.
                    </Text>
                </View>

                {isFetching ? (
                    <View className="items-center justify-center py-10">
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : (
                    <View className="gap-5">
                        {/* Ngân hàng */}
                        <View>
                            <Text className="text-sm text-gray-700 font-space-bold mb-2 ml-1 uppercase">Ngân hàng thụ hưởng</Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 h-[56px] focus:border-[#D9AEF6] focus:bg-[#F9F6FC]">
                                <Building size={20} color="#666" />
                                <TextInput
                                    className="flex-1 ml-3 font-space-bold text-[15px] text-black h-full"
                                    placeholder="VD: Vietcombank, Techcombank..."
                                    placeholderTextColor="#999"
                                    value={form.bankName}
                                    onChangeText={(text) => setForm({ ...form, bankName: text })}
                                />
                            </View>
                        </View>

                        {/* Chủ tài khoản */}
                        <View>
                            <Text className="text-sm text-gray-700 font-space-bold mb-2 ml-1 uppercase">Tên chủ tài khoản</Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 h-[56px] focus:border-[#D9AEF6] focus:bg-[#F9F6FC]">
                                <User size={20} color="#666" />
                                <TextInput
                                    className="flex-1 ml-3 font-space-bold text-[15px] text-black h-full"
                                    placeholder="VD: NGUYEN VAN A"
                                    placeholderTextColor="#999"
                                    autoCapitalize="characters"
                                    value={form.accountHolder}
                                    onChangeText={(text) => setForm({ ...form, accountHolder: text.toUpperCase() })}
                                />
                            </View>
                        </View>

                        {/* Số tài khoản */}
                        <View>
                            <Text className="text-sm text-gray-700 font-space-bold mb-2 ml-1 uppercase">Số tài khoản</Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 h-[56px] focus:border-[#D9AEF6] focus:bg-[#F9F6FC]">
                                <Hash size={20} color="#666" />
                                <TextInput
                                    className="flex-1 ml-3 font-space-bold text-[15px] text-black h-full"
                                    placeholder="Nhập số tài khoản"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={form.accountNumber}
                                    onChangeText={(text) => setForm({ ...form, accountNumber: text })}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View className="p-5 bg-white border-t-2 border-black/10 flex-row gap-4">
                {bankAccount && (
                    <Pressable
                        onPress={handleDelete}
                        disabled={isDeleting || isSaving}
                        className="w-14 h-14 bg-[#FFF5F5] border-2 border-[#DC2626] rounded-[20px] items-center justify-center active:opacity-80"
                    >
                        {isDeleting ? <ActivityIndicator color="#DC2626" /> : <Trash2 size={24} color="#DC2626" strokeWidth={2} />}
                    </Pressable>
                )}
                
                <Pressable
                    onPress={handleSave}
                    disabled={isSaving || isDeleting}
                    className={`flex-1 h-14 bg-black border-2 border-black rounded-[20px] flex-row items-center justify-center active:opacity-80 ${(isSaving || isDeleting) ? "opacity-70" : ""}`}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Save size={20} color="#FFF" strokeWidth={2.5} />
                            <Text className="text-white font-space-bold text-lg ml-2">
                                {bankAccount ? "Cập nhật" : "Lưu tài khoản"}
                            </Text>
                        </>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
