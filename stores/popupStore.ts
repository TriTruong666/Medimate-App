import { atom, useSetAtom } from "jotai";

export type PopupType =
    | 'medicine_detail' 
    | 'confirm' 
    | 'assign_member' 
    | 'create_family' 
    | 'edit_family' 
    | 'health_profile' 
    | 'health_condition' 
    | 'select_family_member' 
    | 'checkout' 
    | 'success_payment'
    | 'booking_confirm'
    | 'chat_detail'
    | 'message'
    | 'loading'
    | 'reminder_alert'
    | 'guardian_invite'
    | 'rate_doctor'
    | null;

export type PopupConfirmData = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'info';
};

export type PopupConfig = {
    type: PopupType;
    data?: any;
    onSave?: (data: any) => void;
    onClose?: () => void;
    onConfirm?: () => void;
};

// Atom for managing the active popup
export const activePopupAtom = atom<PopupConfig | null>(null);
export const popupAtom = activePopupAtom; // Alias for backward compatibility

// Convenience hook for popup management
export const usePopup = () => {
    const setActivePopup = useSetAtom(activePopupAtom);

    const open = (config: PopupConfig) => {
        setActivePopup(config);
    };

    const close = () => {
        setActivePopup(null);
    };

    const confirm = (data: PopupConfirmData, onConfirm: () => void) => {
        setActivePopup({
            type: 'confirm',
            data,
            onConfirm,
        });
    };

    return {
        open,
        close,
        confirm
    };
};
