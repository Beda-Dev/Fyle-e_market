"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CameraCaptureProps {
  open: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

export function CameraCapture({ open, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  // demarre le flux video quand le modal s'ouvre
  useEffect(() => {
    if (!open) return

    let cancelled = false
    setError(null)

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (e) {
        const err = e as Error
        if (err.name === "NotAllowedError") {
          setError("Acces a la camera refuse. Autorise l'acces dans ton navigateur.")
        } else if (err.name === "NotFoundError") {
          setError("Aucune camera detectee sur cet appareil.")
        } else {
          setError("Impossible d'acceder a la camera: " + err.message)
        }
      }
    }
    start()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [open, facingMode])

  // cleanup preview blob URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL("image/jpeg", 0.92)
    setPreviewUrl(url)
  }

  const handleConfirm = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        })
        onCapture(file)
        setPreviewUrl(null)
        onClose()
      },
      "image/jpeg",
      0.92,
    )
  }

  const handleRetake = () => {
    setPreviewUrl(null)
  }

  const switchCamera = () => {
    setFacingMode((m) => (m === "user" ? "environment" : "user"))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <Camera className="size-5" />
                Prendre une photo
              </h3>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
                <X className="size-5" />
              </Button>
            </div>

            <div className="relative bg-black aspect-video">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center text-white text-center px-6">
                  <p>{error}</p>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Apercu"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-4 flex items-center justify-center gap-3">
              {previewUrl ? (
                <>
                  <Button variant="outline" onClick={handleRetake} className="gap-2">
                    <RefreshCw className="size-4" />
                    Reprendre
                  </Button>
                  <Button onClick={handleConfirm} className="gap-2">
                    <Check className="size-4" />
                    Utiliser cette photo
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={switchCamera}
                    className="gap-2"
                    disabled={!!error}
                    aria-label="Changer de camera"
                  >
                    <RefreshCw className="size-4" />
                    Changer
                  </Button>
                  <Button
                    onClick={handleCapture}
                    disabled={!!error}
                    className="gap-2 size-16 rounded-full p-0"
                    aria-label="Capturer"
                  >
                    <span className="size-12 rounded-full bg-white border-4 border-primary-foreground" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
