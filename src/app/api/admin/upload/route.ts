import { v2 as cloudinary } from 'cloudinary'
import { handleApiError, jsonError, requireAdmin } from '@/lib/api-helpers'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_BYTES = 10 * 1024 * 1024 // 10 Mo par fichier
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

type UploadResult = {
  publicId: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
}

function uploadOne(buffer: Buffer): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'ecommerce/products',
          resource_type: 'image',
          // Cloudinary fait la compression automatique cote serveur
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, res) => {
          if (error || !res) return reject(error)
          resolve({
            publicId: res.public_id,
            url: res.secure_url,
            width: res.width,
            height: res.height,
            format: res.format,
            bytes: res.bytes,
          })
        },
      )
      .end(buffer)
  })
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return jsonError(400, 'Content-Type doit etre multipart/form-data')
    }

    const formData = await request.formData()

    // accepte 'file' (mono) OU 'files' (multi)
    const single = formData.get('file')
    const multi = formData.getAll('files')

    const filesRaw: FormDataEntryValue[] =
      multi.length > 0 ? multi : single ? [single] : []

    const files = filesRaw.filter((f): f is File => f instanceof File)
    if (files.length === 0) {
      return jsonError(400, "Aucun fichier fourni (champ 'file' ou 'files')")
    }

    // validation par fichier
    for (const f of files) {
      if (!ALLOWED_MIME.includes(f.type)) {
        return jsonError(400, `Format non supporte: ${f.name} (${f.type})`)
      }
      if (f.size > MAX_BYTES) {
        return jsonError(400, `Fichier trop volumineux: ${f.name} (max 10 Mo)`)
      }
    }

    const buffers = await Promise.all(
      files.map(async (f) => Buffer.from(await f.arrayBuffer())),
    )
    const results = await Promise.all(buffers.map(uploadOne))

    // si un seul fichier on retourne juste l'objet, sinon un tableau
    return Response.json({
      data: results.length === 1 ? results[0] : results,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
