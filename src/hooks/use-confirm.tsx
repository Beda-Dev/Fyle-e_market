"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export type ConfirmVariant = "default" | "destructive"

export interface ConfirmOptions {
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve?: (value: boolean) => void
}

const listeners: Array<(state: ConfirmState) => void> = []
let memoryState: ConfirmState = { open: false }

function dispatch(next: ConfirmState) {
  memoryState = next
  listeners.forEach((l) => l(memoryState))
}

/**
 * Affiche une modale de confirmation et renvoie une promesse résolvant
 * à `true` si l'utilisateur confirme, `false` sinon.
 *
 * @example
 *   if (!(await confirm({ title: "Supprimer ?", variant: "destructive" }))) return
 */
export function confirm(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    dispatch({
      open: true,
      title: options.title ?? "Confirmer l'action",
      description: options.description,
      confirmLabel: options.confirmLabel ?? "Confirmer",
      cancelLabel: options.cancelLabel ?? "Annuler",
      variant: options.variant ?? "default",
      resolve,
    })
  })
}

export function ConfirmDialog() {
  const [state, setState] = React.useState<ConfirmState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  const handleClose = (result: boolean) => {
    state.resolve?.(result)
    dispatch({ ...memoryState, open: false, resolve: undefined })
  }

  const isDestructive = state.variant === "destructive"

  return (
    <Dialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) handleClose(false)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDestructive && (
              <AlertTriangle className="size-5 text-destructive" />
            )}
            {state.title}
          </DialogTitle>
          {state.description && (
            <DialogDescription className="whitespace-pre-line">
              {state.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
          >
            {state.cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={() => handleClose(true)}
            autoFocus
          >
            {state.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
