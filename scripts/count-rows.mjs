import 'dotenv/config'
import * as mariadb from 'mariadb'

const u = new URL(process.env.DATABASE_URL)
const c = await mariadb.createConnection({
  host: u.hostname,
  port: Number(u.port || 3306),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.slice(1),
})

const tables = ['User', 'Category', 'Product', 'Setting', 'Order', 'OrderItem']
const counts = {}
for (const t of tables) {
  const r = await c.query(`SELECT COUNT(*) AS n FROM \`${t}\``)
  counts[t] = Number(r[0].n)
}
console.log(counts)
await c.end()
