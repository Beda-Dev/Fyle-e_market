import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Routes protegees par role:
// - /admin/*  : ADMIN uniquement
// - /orders   : tout user connecte
// - /profile  : tout user connecte
export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const role = req.nextauth.token?.role

    if (path.startsWith("/admin") && role !== "ADMIN") {
      // pas admin -> on redirige vers la home
      const url = req.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      // si pas de token, withAuth redirige automatiquement vers signIn
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*", "/profile/:path*"],
}
