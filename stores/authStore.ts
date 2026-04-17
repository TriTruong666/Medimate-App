import * as SecureStore from 'expo-secure-store';
import { atom } from 'jotai';
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from '../utils/token';

// Define types for user
export interface UserSession {
    id?: string;
    memberId?: string;
    role: 'manager' | 'member' | 'none';
}

// Atom to hold the current session
// null: checking, undefined: no session, UserSession: logged in
export const authSessionAtom = atom<UserSession | null | undefined>(null);

// Atom for token (can be used for requests)
export const accessTokenAtom = atom<string | null>(null);

// ── Kick-out signal ── 
// Interceptor set atom này khi nhận 401 → _layout.tsx lắng nghe và navigate
export const kickOutAtom = atom<{ message: string; isKickedOut: boolean } | null>(null);

// Helper function to prevent SecureStore from hanging indefinitely on Expo Fast Refresh
const withTimeout = <T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(timeoutMsg)), ms))
    ]);
};

/**
 * Helper to initialize auth state from SecureStore
 */
export const initAuthAtom = atom(
    null,
    async (get, set) => {

        // Reset bất kỳ trạng thái kick-out cũ từ phiên trước
        set(kickOutAtom, null);
        try {

            // Gắn timeout 3s
            const token = await withTimeout(
                SecureStore.getItemAsync('accessToken'),
                3000,
                'Lỗi: SecureStore.getItemAsync bị treo quá 3 giây!'
            );

            console.log('[authStore] AccessToken found:', !!token);

            if (!token) {

                set(authSessionAtom, undefined);
                return;
            }


            const decoded = jwtDecode<CustomJwtPayload>(token);

            // Validate token format and expiration
            if (!decoded) {

                await SecureStore.deleteItemAsync('accessToken');
                set(authSessionAtom, undefined);
                set(accessTokenAtom, null);
                return;
            }

            // check if token is expired
            if (decoded.exp && (Date.now() / 1000) >= decoded.exp) {
                await withTimeout(SecureStore.deleteItemAsync('accessToken'), 3000, 'Delete timeout');
                set(authSessionAtom, undefined);
                set(accessTokenAtom, null);
                return;
            }

            if (decoded?.MemberId) {
                console.log('[authStore] Valid Member session found.');
                set(authSessionAtom, { memberId: decoded.MemberId, role: 'member' });
                set(accessTokenAtom, token);
            } else if (decoded?.Id) {
                console.log('[authStore] Valid Manager session found.');
                set(authSessionAtom, { id: decoded.Id, role: 'manager' });
                set(accessTokenAtom, token);
            } else {
                console.log('[authStore] Unrecognized payload format, clearing token.');
                await withTimeout(SecureStore.deleteItemAsync('accessToken'), 3000, 'Delete timeout');
                set(authSessionAtom, undefined);
                set(accessTokenAtom, null);
            }
            console.log('[authStore] Initialization complete.');
        } catch (e) {
            console.error('[authStore] Failed to initialize auth:', e);
            try {
                await withTimeout(SecureStore.deleteItemAsync('accessToken'), 3000, 'Delete timeout inside catch');
            } catch (inner) {
                console.error('[authStore] Emergency delete also triggered timeout/error. Bypassing...');
            }
            // Mấu chốt: Phải chắc chắn set data về undefined để index.tsx thoát khỏi vòng xoay loading
            set(authSessionAtom, undefined);
            set(accessTokenAtom, null);
        }
    }
);
