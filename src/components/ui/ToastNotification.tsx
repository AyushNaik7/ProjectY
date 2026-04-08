"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export interface ToastNotificationProps {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info";
  onClose: (id: string) => void;
}

const palette = {
  success: "#3B6D11",
  error: "#A32D2D",
  warning: "#BA7517",
  info: "#185FA5",
} as const;

export function ToastNotification({ id, title, description, variant = "info", onClose }: ToastNotificationProps) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(t);
  }, [id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 28, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="relative w-[320px] overflow-hidden rounded-md border bg-white p-3 shadow-lg"
      style={{ borderLeft: `4px solid ${palette[variant]}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-medium text-slate-900">{title}</p>
          {description ? <p className="mt-1 text-[12px] text-slate-500">{description}</p> : null}
        </div>
        <button onClick={() => onClose(id)} className="rounded p-1 hover:bg-slate-100">
          <X className="h-4 w-4 text-slate-500" />
        </button>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-0.5"
        style={{ backgroundColor: palette[variant] }}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
      />
    </motion.div>
  );
}
