export async function register() {
  // Date de fin de l'essai Railway : 27 jours à partir du 10 mai 2026
  const trialEnd = new Date("2026-06-06T00:00:00")
  const now = new Date()
  const msLeft = trialEnd.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))

  if (daysLeft <= 0) {
    console.warn("\n⛔ RAILWAY : Essai expiré !\n")
  } else if (daysLeft <= 7) {
    console.warn(`\n⚠️  RAILWAY : Plus que ${daysLeft} jour(s) d'essai !\n`)
  } else {
    console.log(`\n🚂 RAILWAY : ${daysLeft} jour(s) d'essai restant(s)\n`)
  }
}
