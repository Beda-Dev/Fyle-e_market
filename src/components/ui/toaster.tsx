"use client"

import { useToast } from "@/hooks/use-toast"
import type { ToastVariant } from "@/hooks/use-toast"
import {
  X,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

const variantConfig: Record<
  ToastVariant,
  {
    icon: typeof CheckCircle2 | null
    container: string
    iconClass: string
    title: string
    description: string
    closeHover: string
  }
> = {
  default: {
    icon: null,
    container: "bg-white border-gray-200 text-gray-900 border-l-4 border-l-gray-400",
    iconClass: "",
    title: "text-gray-900",
    description: "text-gray-600",
    closeHover: "hover:bg-gray-100",
  },
  success: {
    icon: CheckCircle2,
    container: "bg-green-50 border-green-200 text-green-900 border-l-4 border-l-green-500",
    iconClass: "text-green-600",
    title: "text-green-900",
    description: "text-green-800/80",
    closeHover: "hover:bg-green-100",
  },
  info: {
    icon: Info,
    container: "bg-blue-50 border-blue-200 text-blue-900 border-l-4 border-l-blue-500",
    iconClass: "text-blue-600",
    title: "text-blue-900",
    description: "text-blue-800/80",
    closeHover: "hover:bg-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    container: "bg-amber-50 border-amber-200 text-amber-900 border-l-4 border-l-amber-500",
    iconClass: "text-amber-600",
    title: "text-amber-900",
    description: "text-amber-800/80",
    closeHover: "hover:bg-amber-100",
  },
  error: {
    icon: XCircle,
    container: "bg-red-50 border-red-200 text-red-900 border-l-4 border-l-red-500",
    iconClass: "text-red-600",
    title: "text-red-900",
    description: "text-red-800/80",
    closeHover: "hover:bg-red-100",
  },
  destructive: {
    icon: XCircle,
    container: "bg-red-50 border-red-200 text-red-900 border-l-4 border-l-red-500",
    iconClass: "text-red-600",
    title: "text-red-900",
    description: "text-red-800/80",
    closeHover: "hover:bg-red-100",
  },
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          if (!t.open) return null
          const config = variantConfig[(t.variant as ToastVariant) ?? "default"]
          const Icon = config.icon

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-lg border p-4 shadow-lg ${config.container}`}
              role={t.variant === "error" || t.variant === "destructive" ? "alert" : "status"}
            >
              <div className="flex items-start gap-3">
                {Icon && (
                  <Icon className={`size-5 shrink-0 mt-0.5 ${config.iconClass}`} aria-hidden />
                )}
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <p className={`text-sm font-semibold ${config.title}`}>{t.title}</p>
                  )}
                  {t.description && (
                    <p className={`text-sm mt-1 ${config.description}`}>
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className={`shrink-0 rounded-md p-1 transition-colors ${config.closeHover}`}
                  aria-label="Fermer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
