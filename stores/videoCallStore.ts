import { atom, useAtom, useSetAtom } from 'jotai';
import { IRtcEngine } from 'react-native-agora';

// ─────────────────────────────────────────────────────────
// Video Call Global State
// Allows the video call to persist in a floating PiP window
// while the user navigates to other screens.
// ─────────────────────────────────────────────────────────

export interface VideoCallState {
    isActive: boolean;         // Is a call currently in progress?
    isMinimized: boolean;      // Is the call currently minimized (PiP)?
    sessionId: string;
    appointmentId: string;
    hasJoined: boolean;
    remoteUid: number | null;
    isMuted: boolean;
    isCameraOff: boolean;
}

const DEFAULT_STATE: VideoCallState = {
    isActive: false,
    isMinimized: false,
    sessionId: '',
    appointmentId: '',
    hasJoined: false,
    remoteUid: null,
    isMuted: false,
    isCameraOff: false,
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

    const startCall = (sessionId: string, appointmentId: string) => {
        setState({
            ...DEFAULT_STATE,
            isActive: true,
            isMinimized: false,
            sessionId,
            appointmentId,
        });
    };

    const minimize = () => {
        setState(prev => ({ ...prev, isMinimized: true }));
    };

    const maximize = () => {
        setState(prev => ({ ...prev, isMinimized: false }));
    };

    const updateCallState = (partial: Partial<VideoCallState>) => {
        setState(prev => ({ ...prev, ...partial }));
    };

    const endCall = () => {
        // Clean up Agora engine
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
        updateCallState,
        endCall,
    };
};
