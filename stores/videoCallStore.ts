import { atom, useAtom, useSetAtom } from 'jotai';
import { IRtcEngine } from 'react-native-agora';

// ─────────────────────────────────────────────────────────
// Video Call Global State
// Allows the video call to persist in a floating PiP window
// while the user navigates to other screens.
// ─────────────────────────────────────────────────────────

export type VideoCallRole = 'member' | 'guardian' | 'doctor';

export interface VideoCallState {
    isActive: boolean;
    isMinimized: boolean;
    sessionId: string;
    appointmentId: string;
    hasJoined: boolean;
    remoteUids: number[];        // Multiple remote participants (3-way call)
    isMuted: boolean;
    isCameraOff: boolean;
    role: VideoCallRole;         // Who am I in this call?
    localUid: number | null;     // My Agora UID (set after joining)
    memberName?: string;         // For guardian: name of the patient
    doctorName?: string;         // For info display
}

// Guardian invite state (popup)
export interface GuardianInvitePayload {
    sessionId: string;
    memberName: string;
    memberAvatarUrl?: string;
    doctorName: string;
    scheduledTime: string;
}

const DEFAULT_STATE: VideoCallState = {
    isActive: false,
    isMinimized: false,
    sessionId: '',
    appointmentId: '',
    hasJoined: false,
    remoteUids: [],
    isMuted: false,
    isCameraOff: false,
    role: 'member',
    localUid: null,
};

// Main state atom
export const videoCallStateAtom = atom<VideoCallState>(DEFAULT_STATE);

// Global ref for the Agora engine (not in Jotai since it's not serializable)
let globalAgoraEngine: IRtcEngine | null = null;

export const getGlobalAgoraEngine = () => globalAgoraEngine;
export const setGlobalAgoraEngine = (engine: IRtcEngine | null) => {
    globalAgoraEngine = engine;
};

// ─────────────────────────────────────────────────────────
// Hook: useVideoCallActions
// ─────────────────────────────────────────────────────────
export const useVideoCallActions = () => {
    const [state, setState] = useAtom(videoCallStateAtom);

    const startCall = (
        sessionId: string,
        appointmentId: string,
        role: VideoCallRole = 'member',
        options?: { memberName?: string; doctorName?: string; localUid?: number }
    ) => {
        setState({
            ...DEFAULT_STATE,
            isActive: true,
            isMinimized: false,
            sessionId,
            appointmentId,
            role,
            localUid: options?.localUid ?? null,
            memberName: options?.memberName,
            doctorName: options?.doctorName,
        });
    };

    const minimize = () => setState(prev => ({ ...prev, isMinimized: true }));
    const maximize = () => setState(prev => ({ ...prev, isMinimized: false }));

    // Add a new remote participant UID (3-way call support)
    const addRemoteUid = (uid: number) => {
        setState(prev => ({
            ...prev,
            remoteUids: prev.remoteUids.includes(uid)
                ? prev.remoteUids
                : [...prev.remoteUids, uid],
        }));
    };

    // Remove a remote UID when they leave
    const removeRemoteUid = (uid: number) => {
        setState(prev => ({
            ...prev,
            remoteUids: prev.remoteUids.filter(u => u !== uid),
        }));
    };

    const updateCallState = (partial: Partial<VideoCallState>) => {
        setState(prev => ({ ...prev, ...partial }));
    };

    const endCall = () => {
        const engine = getGlobalAgoraEngine();
        if (engine) {
            try {
                engine.leaveChannel();
                engine.unregisterEventHandler({});
                engine.release();
            } catch (e) {
                console.error('Error cleaning up Agora engine:', e);
            }
            setGlobalAgoraEngine(null);
        }
        setState(DEFAULT_STATE);
    };

    return {
        state,
        startCall,
        minimize,
        maximize,
        addRemoteUid,
        removeRemoteUid,
        updateCallState,
        endCall,
    };
};

// Backward compat: remoteUid (single) → first remote UID
export const selectRemoteUid = (state: VideoCallState): number | null =>
    state.remoteUids.length > 0 ? state.remoteUids[0] : null;
