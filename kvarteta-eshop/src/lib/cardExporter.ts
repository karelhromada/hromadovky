import { toBlob } from 'html-to-image'
import { supabase } from './supabase'
import { getDraftRef } from './storage'

const BUCKET = 'order-uploads'

const isMobile = () => typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

export interface RenderOptions {
  cardKey: string
  pixelRatio?: number
  backgroundColor?: string
}

export async function renderAndUploadCard(node: HTMLElement, opts: RenderOptions): Promise<string> {
  // Kvalita renderu nesmí záviset na zařízení — mobil dostává stejné rozlišení jako desktop.
  const pixelRatio = opts.pixelRatio ?? 3
  const blob = await toBlob(node, {
    pixelRatio,
    // cacheBust NE: připojuje ?timestamp ke zdrojům, a blob: URL s query stringem
    // nelze fetchnout → render fotky selže. Zdroje jsou blob:/same-origin, cache neřešíme.
    cacheBust: false,
    backgroundColor: opts.backgroundColor ?? '#ffffff',
    skipFonts: false,
  })
  if (!blob) throw new Error('Render karty selhal (prázdný blob).')

  const draft = getDraftRef()
  const safeKey = opts.cardKey.replace(/[^a-zA-Z0-9_-]/g, '_')
  const path = `${draft}/renders/${safeKey}.png`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    upsert: true,
    contentType: 'image/png',
  })
  if (error) {
    if (error.message?.toLowerCase().includes('row-level security')) {
      throw new Error('Render karty nelze nahrát (bezpečnostní limit objednávky).')
    }
    throw new Error(`Upload renderu selhal: ${error.message}`)
  }
  return path
}

export interface RenderTask {
  node: HTMLElement
  cardKey: string
}

export interface RenderProgress {
  done: number
  total: number
  currentKey?: string
  failed: Array<{ cardKey: string; error: string }>
}

export interface BatchOptions {
  concurrency?: number
  pixelRatio?: number
  backgroundColor?: string
}

export async function renderAndUploadBatch(
  tasks: RenderTask[],
  onProgress?: (p: RenderProgress) => void,
  options: BatchOptions = {},
): Promise<{ paths: string[]; failed: Array<{ cardKey: string; error: string }> }> {
  // Na mobilu nižší souběžnost kvůli paměti (dekódované fotky + canvasy), kvalita zůstává plná.
  const concurrency = options.concurrency ?? (isMobile() ? 2 : 3)
  const paths: string[] = []
  const failed: Array<{ cardKey: string; error: string }> = []
  let index = 0
  let done = 0

  const total = tasks.length
  const workers = Array.from({ length: Math.min(concurrency, total) }, async () => {
    while (index < total) {
      const my = index++
      const task = tasks[my]
      onProgress?.({ done, total, currentKey: task.cardKey, failed: [...failed] })
      try {
        const path = await renderAndUploadCard(task.node, {
          cardKey: task.cardKey,
          pixelRatio: options.pixelRatio,
          backgroundColor: options.backgroundColor,
        })
        paths.push(path)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        failed.push({ cardKey: task.cardKey, error: message })
      } finally {
        done++
        onProgress?.({ done, total, currentKey: task.cardKey, failed: [...failed] })
      }
    }
  })
  await Promise.all(workers)
  return { paths, failed }
}
