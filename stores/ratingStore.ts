import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const storage = createJSONStorage<string[]>(() => secureStorage as any);

// Lưu danh sách ID các cuộc hẹn (Appointments) đã được đánh giá
export const ratedAppointmentsAtom = atomWithStorage<string[]>('rated_appointments', [], storage as any);
