import { supabase } from './supabase'

const BUCKET = 'order-uploads'
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB
const DRAFT_KEY = 'order-draft-ref'

export interface UploadedPhoto {
  path: string
  previewUrl: string
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

export async function uploadOrderPhoto(file: File): Promise<UploadedPhoto> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Soubor musí být obrázek (JPG, PNG, WebP, HEIC).')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`Obrázek je moc velký (max. 20 MB). Má ${(file.size / 1024 / 1024).toFixed(1)} MB.`)
  }

  const draftRef = getDraftRef()
  const path = `${draftRef}/${crypto.randomUUID()}.${extFromFile(file)}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })

  if (error) {
    throw new Error(`Nahrání fotky se nezdařilo: ${error.message}`)
  }

  return {
    path,
    previewUrl: URL.createObjectURL(file),
  }
}
