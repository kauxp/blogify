"use client";

import { useStore } from "../store/useStore";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export function Toast() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          {toast.type === "info" && (
            <Info className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}