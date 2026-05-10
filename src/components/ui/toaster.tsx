"use client"

import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) =>
          t.open ? (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-lg border p-4 shadow-lg ${
                t.variant === "destructive"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <p className="text-sm font-semibold">{t.title}</p>
                  )}
                  {t.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded-md p-1 hover:bg-gray-100 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
    </div>
  )
}
