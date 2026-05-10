"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue")
      } else {
        setSent(true)
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-8"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-brand-brown)" }}
        >
          <ArrowLeft className="size-4" />
          Retour à la connexion
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="size-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-brand-brown)" }}>
              Email envoyé !
            </h1>
            <p className="text-muted-foreground">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec un lien de réinitialisation.
            </p>
            <p className="text-sm text-muted-foreground">
              Pensez à vérifier vos spams.
            </p>
            <Link href="/login">
              <Button className="mt-4" style={{ backgroundColor: "var(--color-brand-orange)" }}>
                Retour à la connexion
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold" style={{ color: "var(--color-brand-brown)" }}>
                Mot de passe oublié ?
              </h1>
              <p className="text-muted-foreground">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--color-brand-brown)" }}>
                  Adresse email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-10 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-brand-orange"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-sm font-medium text-white hover:opacity-90 rounded-lg shadow-none cursor-pointer"
                style={{ backgroundColor: "var(--color-brand-orange)" }}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le lien"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
