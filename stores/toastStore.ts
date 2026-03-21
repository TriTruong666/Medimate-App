import { atom, useSetAtom } from "jotai";

type ToastType = "error" | "success" | "info" | "warning";

export type ToastItem = {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

// Atom to store the list of toasts
export const toastsAtom = atom<ToastItem[]>([]);

// Convenience hooks/functions for standard use
export const useToast = () => {
  const setToasts = useSetAtom(toastsAtom);

  const push = (toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(7) + Date.now().toString(36);
    const item = { id, ...toast };

    setToasts((prev) => [...prev, item]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration ?? 4000);
    }

    return id;
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    success: (title: string, message?: string, duration?: number) =>
      push({ title, message, type: "success", duration }),
    error: (title: string, message?: string, duration?: number) =>
      push({ title, message, type: "error", duration }),
    info: (title: string, message?: string, duration?: number) =>
      push({ title, message, type: "info", duration }),
    warning: (title: string, message?: string, duration?: number) =>
      push({ title, message, type: "warning", duration }),
    remove,
  };
};
