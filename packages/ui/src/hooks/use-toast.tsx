'use client';

import * as React from "react";
import { Toast, type ToastProps } from "../components/toast";

export type ToastMessage = Omit<ToastProps, "onDismiss"> & { id: string };

type ToastContextValue = {
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = React.useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }]);

      window.setTimeout(() => dismissToast(id), toast["duration"] ?? 5000);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, pushToast, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex flex-col items-center gap-3 px-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
