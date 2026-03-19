import { atom } from "jotai";
import { LucideIcon } from "lucide-react-native";

export interface DropdownItem {
    label: string;
    icon?: LucideIcon;
    onPress: () => void;
    color?: string;
    isDestructive?: boolean;
}

export interface DropdownState {
    visible: boolean;
    items: DropdownItem[];
    anchorPosition: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
}

export const dropdownAtom = atom<DropdownState>({
    visible: false,
    items: [],
    anchorPosition: { top: 0, right: 0 },
});

export const showDropdownAtom = atom(null, (get, set, payload: Omit<DropdownState, "visible">) => {
    set(dropdownAtom, { ...payload, visible: true });
});

export const hideDropdownAtom = atom(null, (get, set) => {
    set(dropdownAtom, (prev) => ({ ...prev, visible: false }));
});
