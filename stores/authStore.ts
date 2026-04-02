import { atom } from 'jotai';
import * as SecureStore from 'expo-secure-store';
import { getDecodedToken } from '../utils/token';

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

/**
 * Helper to initialize auth state from SecureStore
 */
export const initAuthAtom = atom(
    null,
    async (get, set) => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                set(authSessionAtom, undefined);
                return;
            }

            const decoded = await getDecodedToken();
            
            // Validate token format and expiration
            if (!decoded) {
                await SecureStore.deleteItemAsync('accessToken');
                set(authSessionAtom, undefined);
                set(accessTokenAtom, null);
                return;
            }

            // check if token is expired
            if (decoded.exp && (Date.now() / 1000) >= decoded.exp) {
                console.log('Token is expired during startup');
                await SecureStore.deleteItemAsync('accessToken');
                set(authSessionAtom, undefined);
                set(accessTokenAtom, null);
                return;
            }

            if (decoded?.MemberId) {
                set(authSessionAtom, { memberId: decoded.MemberId, role: 'member' });
                set(accessTokenAtom, token);
            } else if (decoded?.Id) {
                set(authSessionAtom, { id: decoded.Id, role: 'manager' });
                set(accessTokenAtom, token);
            } else {
                await SecureStore.deleteItemAsync('accessToken');
                set(authSessionAtom, undefined);
                set(accessTokenAtom, null);
            }
        } catch (e) {
            console.error('Failed to initialize auth', e);
            await SecureStore.deleteItemAsync('accessToken');
            set(authSessionAtom, undefined);
            set(accessTokenAtom, null);
        }
    }
);
