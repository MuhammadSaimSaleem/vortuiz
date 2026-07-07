"use client";

import { useSyncExternalStore, useCallback } from "react";
import { CheckCheck, AlertCircle, Sparkles, X } from "lucide-react";

export type ToastKind = "success" | "error" | "info";
interface ToastItem { id: string; message: string; kind: ToastKind; }

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

let toasts: ToastItem[] = [];
const EMPTY_TOASTS: ToastItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function push(message: string, kind: ToastKind = "success") {
  const id = uid();
  toasts = [...toasts, { id, message, kind }];
  emit();
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); emit(); }, 3500);
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

// call this from anywhere: toast("msg"), toast("msg", "error"), toast("msg", "info")
export function toast(message: string, kind: ToastKind = "success") {
  push(message, kind);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const getSnapshot = () => toasts;

// mount this ONCE, in app/layout.tsx
export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_TOASTS);
  const onDismiss = useCallback((id: string) => dismiss(id), []);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white pointer-events-auto
            ${t.kind === "success" ? "bg-emerald-600" : t.kind === "error" ? "bg-red-500" : "bg-brand-navy"}`}
          style={{ animation: "slideUp .2s ease" }}
        >
          {t.kind === "success" && <CheckCheck className="h-4 w-4 shrink-0" />}
          {t.kind === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
          {t.kind === "info" && <Sparkles className="h-4 w-4 shrink-0" />}
          {t.message}
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}