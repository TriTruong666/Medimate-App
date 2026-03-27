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
            if (decoded?.MemberId) {
                set(authSessionAtom, { memberId: decoded.MemberId, role: 'member' });
            } else if (decoded?.Id) {
                set(authSessionAtom, { id: decoded.Id, role: 'manager' });
            } else {
                set(authSessionAtom, undefined);
            }
            set(accessTokenAtom, token);
        } catch (e) {
            console.error('Failed to initialize auth', e);
            set(authSessionAtom, undefined);
        }
    }
);
