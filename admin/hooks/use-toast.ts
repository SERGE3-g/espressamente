"use client";

import * as React from "react";

type ToastVariant = "default" | "success" | "destructive" | "warning";

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastState {
  toasts: ToastData[];
}

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastData }
  | { type: "DISMISS_TOAST"; id: string };

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastAction) {
  switch (action.type) {
    case "ADD_TOAST":
      memoryState = { toasts: [...memoryState.toasts, action.toast] };
      break;
    case "DISMISS_TOAST":
      memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== action.id) };
      break;
  }
  listeners.forEach((l) => l(memoryState));
}

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

function toast({ title, description, variant = "default" }: ToastOptions) {
  const id = genId();
  dispatch({ type: "ADD_TOAST", toast: { id, title, description, variant } });

  // Auto dismiss after 4s
  setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", id });
  }, 4000);

  return id;
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (id: string) => dispatch({ type: "DISMISS_TOAST", id }),
  };
}

export { useToast, toast };
