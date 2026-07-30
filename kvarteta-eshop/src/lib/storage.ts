import { supabase } from './supabase'

const BUCKET = 'order-uploads'
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB
const DRAFT_KEY = 'order-draft-ref'

// HEIC z iPhonu neumí Chrome/Firefox zobrazit — konvertuje se na klientu na JPEG.
// Soubory z aplikace Soubory mívají prázdný MIME, proto se detekuje i podle přípony.
const HEIC_EXT = /\.(heic|heif)$/i
const HEIC_MIMES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']

export interface UploadedPhoto {
  path: string
  previewUrl: string
  /** true = originál byl HEIC a nahrál se převedený JPEG — komponenta musí vyměnit optimistický náhled */
  converted: boolean
}

export function getDraftRef(): string {
  let ref = sessionStorage.getItem(DRAFT_KEY)
  if (!ref) {
    ref = `draft-${crypto.randomUUID()}`
    sessionStorage.setItem(DRAFT_KEY, ref)
  }
  return ref
}

export function resetDraftRef(): void {
  sessionStorage.removeItem(DRAFT_KEY)
}

function extFromFile(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && fromName.length <= 5) return fromName
  const fromMime = file.type.split('/')[1]
  return fromMime || 'jpg'
}

function isLikelyHeic(file: File): boolean {
  return HEIC_MIMES.includes(file.type.toLowerCase()) || HEIC_EXT.test(file.name)
}

const HEIC_ERROR_MESSAGE =
  'Fotku se nepodařilo zpracovat (formát HEIC). Zkuste ji prosím nejdřív uložit jako JPG, nebo vyberte jinou fotku.'

async function convertHeicToJpeg(file: File): Promise<File | null> {
  let blob: Blob
  try {
    // CSP build — běžný build volá v Emscripten glue new Function(), které produkce
    // (script-src bez 'unsafe-eval') blokuje; csp varianta se bez evalu obejde.
    const { heicTo, isHeic } = await import('heic-to/csp')
    // Přejmenovaný JPEG s příponou .heic — magic bytes rozhodují, konverze se přeskočí
    if (!(await isHeic(file))) return null

    blob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 })
    if (blob.size > MAX_SIZE_BYTES) {
      blob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.75 })
    }
  } catch {
    throw new Error(HEIC_ERROR_MESSAGE)
  }
  if (blob.size > MAX_SIZE_BYTES) {
    throw new Error(`Fotka je po převodu příliš velká (max. 20 MB). Má ${(blob.size / 1024 / 1024).toFixed(1)} MB.`)
  }
  const jpegName = `${file.name.replace(HEIC_EXT, '')}.jpg`
  return new File([blob], jpegName, { type: 'image/jpeg' })
}

export async function uploadOrderPhoto(file: File): Promise<UploadedPhoto> {
  const heic = isLikelyHeic(file)
  if (!heic && !file.type.startsWith('image/')) {
    throw new Error('Soubor musí být obrázek (JPG, PNG, WebP, HEIC).')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`Obrázek je moc velký (max. 20 MB). Má ${(file.size / 1024 / 1024).toFixed(1)} MB.`)
  }

  let uploadFile = file
  let converted = false
  if (heic) {
    const jpeg = await convertHeicToJpeg(file)
    if (jpeg) {
      uploadFile = jpeg
      converted = true
    }
  }

  const draftRef = getDraftRef()
  const path = `${draftRef}/${crypto.randomUUID()}.${extFromFile(uploadFile)}`

  // Fallback pro soubory s prázdným MIME (aplikace Soubory) — bucket má MIME whitelist
  const { error } = await supabase.storage.from(BUCKET).upload(path, uploadFile, {
    upsert: false,
    contentType: uploadFile.type || 'image/jpeg',
  })

  if (error) {
    throw new Error(`Nahrání fotky se nezdařilo: ${error.message}`)
  }

  return {
    path,
    previewUrl: URL.createObjectURL(uploadFile),
    converted,
  }
}
