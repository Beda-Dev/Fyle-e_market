"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="size-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="size-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-brand-brown)" }}>
          Lien invalide
        </h1>
        <p className="text-muted-foreground">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link href="/forgot-password">
          <Button style={{ backgroundColor: "var(--color-brand-orange)" }} className="text-white">
            Refaire une demande
          </Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue")
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="size-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="size-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-brand-brown)" }}>
          Mot de passe modifié !
        </h1>
        <p className="text-muted-foreground">
          Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
        </p>
        <Link href="/login">
          <Button className="mt-4 text-white" style={{ backgroundColor: "var(--color-brand-orange)" }}>
            Se connecter
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-brand-brown)" }}>
          Nouveau mot de passe
        </h1>
        <p className="text-muted-foreground">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--color-brand-brown)" }}>
            Nouveau mot de passe
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pr-10 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-brand-orange"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: "var(--color-brand-brown)" }}>
            Confirmer le mot de passe
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirmez le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-brand-orange"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-sm font-medium text-white hover:opacity-90 rounded-lg shadow-none cursor-pointer"
          style={{ backgroundColor: "var(--color-brand-orange)" }}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Réinitialiser le mot de passe"}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-8"
      >
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin mx-auto" />}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
