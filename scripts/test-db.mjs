// usage: node scripts/test-db.mjs
import 'dotenv/config'
import * as mariadb from 'mariadb'

const url = new URL(process.env.DATABASE_URL)

const pool = mariadb.createPool({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  connectionLimit: 3,
  connectTimeout: 30_000,
  acquireTimeout: 30_000,
})

async function ping(i) {
  const t0 = Date.now()
  const conn = await pool.getConnection()
  try {
    const rows = await conn.query('SELECT 1 AS ok')
    console.log(`[${i}] OK in ${Date.now() - t0}ms`, rows[0])
  } finally {
    conn.release()
  }
}

try {
  for (let i = 1; i <= 5; i++) {
    await ping(i)
  }
  console.log('Toutes les requetes ont passe.')
} catch (e) {
  console.error('Echec:', e.message)
  console.error('Code:', e.code, 'errno:', e.errno)
} finally {
  await pool.end()
}
