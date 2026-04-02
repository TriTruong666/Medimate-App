import { useAtom } from 'jotai';
import React from 'react';
import { Modal } from 'react-native';
import { activePopupAtom } from '../../stores/popupStore';
import { AssignMemberPopup } from './AssignMemberPopup';
import { ConfirmPopup } from './ConfirmPopup';
import { CreateFamilyPopup } from './CreateFamilyPopup';
import { EditFamilyPopup } from './EditFamilyPopup';
import { HealthConditionPopup } from './HealthConditionPopup';
import { HealthProfilePopup } from './HealthProfilePopup';
import { MedicinePopup } from './MedicinePopup';
import { SelectFamilyMemberPopup } from './SelectFamilyMemberPopup';
import BookingConfirmPopup from "./BookingConfirmPopup";
import { ChatDetailPopup } from './ChatDetailPopup';
import { CheckoutPopup } from './CheckoutPopup';
import { SuccessPaymentPopup } from './SuccessPaymentPopup';

export const PopupContainer: React.FC = () => {
    const [activePopup, setActivePopup] = useAtom(activePopupAtom);

    if (!activePopup) return null;

    const handleClose = () => {
        if (activePopup.onClose) activePopup.onClose();
        setActivePopup(null);
    };

    const handleSave = (data: any) => {
        if (activePopup.onSave) activePopup.onSave(data);
        setActivePopup(null);
    };

    const handleConfirm = () => {
        if (activePopup.onConfirm) activePopup.onConfirm();
        setActivePopup(null);
    };

    return (
        <Modal
            transparent
            visible={!!activePopup}
            animationType="none"
            onRequestClose={handleClose}
        >
            {activePopup.type === 'medicine_detail' && (
                <MedicinePopup
                    initialData={activePopup.data}
                    onSave={handleSave}
                    onClose={handleClose}
                    onDelete={activePopup.data?.onDelete}
                />
            )}

            {activePopup.type === 'confirm' && (
                <ConfirmPopup
                    title={activePopup.data.title}
                    message={activePopup.data.message}
                    confirmLabel={activePopup.data.confirmLabel}
                    cancelLabel={activePopup.data.cancelLabel}
                    type={activePopup.data.type}
                    onConfirm={handleConfirm}
                    onClose={handleClose}
                />
            )}

            {activePopup.type === 'assign_member' && (
                <AssignMemberPopup
                    onSave={handleSave}
                    onClose={handleClose}
                />
            )}

            {activePopup.type === 'create_family' && (
                <CreateFamilyPopup onClose={handleClose} />
            )}

            {activePopup.type === 'edit_family' && (
                <EditFamilyPopup
                    family={activePopup.data}
                    onClose={handleClose}
                />
            )}

            {activePopup.type === 'health_profile' && (
                <HealthProfilePopup
                    memberId={activePopup.data.memberId}
                    profile={activePopup.data.profile}
                    onClose={handleClose}
                />
            )}

            {activePopup.type === 'health_condition' && (
                <HealthConditionPopup
                    memberId={activePopup.data.memberId}
                    condition={activePopup.data.condition}
                    onClose={handleClose}
                />
            )}

            {activePopup.type === 'select_family_member' && (
                <SelectFamilyMemberPopup
                    onSave={handleSave}
                    onClose={handleClose}
                />
            )}

            {activePopup.type === 'checkout' && (
                <CheckoutPopup
                    plan={activePopup.data}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                />
            )}

            {activePopup.type === 'success_payment' && (
                <SuccessPaymentPopup
                    plan={activePopup.data.plan}
                    method={activePopup.data.method}
                    onClose={handleClose}
                />
            )}

            {activePopup.type === 'booking_confirm' && (
                <BookingConfirmPopup />
            )}

            {activePopup.type === 'chat_detail' && (
                <ChatDetailPopup
                    name={activePopup.data?.name}
                    avatar={activePopup.data?.avatar}
                    specialty={activePopup.data?.specialty}
                    sessionId={activePopup.data?.sessionId}
                    isCompleted={activePopup.data?.isCompleted}
                    onClose={handleClose}
                />
            )}
        </Modal>
    );
};
