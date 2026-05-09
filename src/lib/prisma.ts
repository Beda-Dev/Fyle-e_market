import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// singleton sinon next dev recree un client a chaque hot reload -> pool qui explose
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  // mieux vaut crasher tout de suite, sinon le driver tente localhost:3306 en silence
  throw new Error("DATABASE_URL n'est pas defini. Verifie ton fichier .env.")
}

// on parse l'URL nous-memes pour pouvoir surcharger les timeouts
// (si on passe juste la string a PrismaMariaDb, on herite des defauts du driver
// et le connectTimeout de 10s ne suffit pas avec le proxy Railway)
const parsedUrl = new URL(databaseUrl)
const adapter = new PrismaMariaDb({
  host: parsedUrl.hostname,
  port: parsedUrl.port ? Number(parsedUrl.port) : 3306,
  user: decodeURIComponent(parsedUrl.username),
  password: decodeURIComponent(parsedUrl.password),
  database: parsedUrl.pathname.replace(/^\//, ''),
  connectionLimit: 5,        // tier gratuit Railway, pas la peine d'aller plus haut
  connectTimeout: 30_000,    // 30s, le defaut a 10s timeout sur le proxy
  acquireTimeout: 30_000,
  idleTimeout: 60_000,       // Railway coupe les conn idle, on recycle avant
})

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// en prod, pas besoin du global (pas de hot reload)
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
