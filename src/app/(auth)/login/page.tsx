"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou mot de passe incorrect")
      } else {
        // on lit la session pour rediriger selon le role
        const session = await getSession()
        const target = session?.user?.role === "ADMIN" ? "/admin" : "/"
        router.push(target)
        router.refresh()
      }
    } catch (error) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans">
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ backgroundColor: "#F9DEC9" }}
      >
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-12">
          {/* <h1 className="text-xl font-semibold" style={{ color: "var(--color-brand-brown)" }}>Eburnie</h1> */}

          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative w-full aspect-square max-w-sm"
            >
              <Image
                src="/Eburnie_picture_sans_fond.png"
                alt="Eburnie"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
            <div className="text-center">
              <h2 className="font-heading text-3xl mb-3 leading-tight" style={{ color: "var(--color-brand-brown)" }}>
                Gérez facilement vos achats en ligne.
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Connectez-vous pour accéder à votre compte et gérer vos commandes.
              </p>
            </div>
          </div>

          <div />
        </div>
      </motion.div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div className="relative size-20 mx-auto mb-2">
              <Image
                src="/Eburnie_picture_sans_fond.png"
                alt="Eburnie"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--color-brand-brown)" }}>Eburnie</h1>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2 text-center">
              <h2 className="text-3xl" style={{ color: "var(--color-brand-brown)" }}>Bienvenue</h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Entrez votre email et mot de passe pour accéder à votre compte.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--color-brand-brown)" }}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="utilisateur@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-brand-orange"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--color-brand-brown)" }}>
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
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

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm hover:opacity-80"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-sm font-medium text-white hover:opacity-90 rounded-lg shadow-none cursor-pointer"
                style={{ backgroundColor: "var(--color-brand-orange)" }}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}

              </Button>
            </form>

            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2" style={{ color: "var(--color-text-secondary)" }}>
                    Ou se connecter avec
                  </span>
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg bg-white shadow-none cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </>

            <div className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="hover:opacity-80 font-medium"
                style={{ color: "var(--color-brand-orange)" }}
              >
                S'inscrire maintenant.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
