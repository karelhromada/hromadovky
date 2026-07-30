import { supabase } from './supabase';
import type { OrderSubmission } from '../types/order';

const BUCKET = 'order-uploads';
const SIGNED_URL_TTL_SECONDS = 3600;

export interface OrderFilters {
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export async function listOrderSubmissions(filters: OrderFilters): Promise<OrderSubmission[]> {
  let query = supabase
    .from('order_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.fromDate) {
    query = query.gte('created_at', filters.fromDate);
  }
  if (filters.toDate) {
    // do konce dne včetně
    query = query.lte('created_at', `${filters.toDate}T23:59:59`);
  }
  if (filters.search) {
    // Čárky a závorky jsou oddělovače PostgREST filtru — bez odstranění by hledání
    // jména s čárkou rozbilo strukturu dotazu (400), ne jen nenašlo výsledek.
    const term = filters.search.trim().replace(/[,()"\\]/g, ' ').trim();
    if (term.length > 0) {
      query = query.or(
        `variable_symbol.ilike.%${term}%,customer->>email.ilike.%${term}%,customer->>lastName.ilike.%${term}%`,
      );
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as OrderSubmission[];
}

/**
 * Vygeneruje čerstvé signed URL pro cesty v bucketu order-uploads (jeden batch request).
 * Vyžaduje admin JWT — RLS policy "admin reads all order uploads". Chybějící objekty
 * (smazané/poškozené cesty) v mapě prostě nejsou; UI je zobrazí jako nedostupné.
 */
export async function getSignedImageUrls(paths: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(paths)].filter(Boolean);
  const result = new Map<string, string>();
  if (unique.length === 0) return result;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  for (const entry of data ?? []) {
    if (entry.signedUrl && entry.path) {
      result.set(entry.path, entry.signedUrl);
    }
  }
  return result;
}

/** Stáhne soubor z bucketu a uloží ho pod čitelným názvem (spolehlivé i proti popup blockerům). */
export async function downloadOrderImage(path: string, filename: string): Promise<void> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) throw error;
  const url = URL.createObjectURL(data);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // revoke až po odbavení kliknutí
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

export interface DownloadEntry {
  path: string;
  filename: string;
}

/**
 * Sekvenční stažení více souborů (prohlížeč se jednou zeptá na povolení
 * vícenásobného stahování). Vrací cesty, které se nepodařilo stáhnout.
 */
export async function downloadAllImages(entries: DownloadEntry[]): Promise<string[]> {
  const failed: string[] = [];
  for (const entry of entries) {
    try {
      await downloadOrderImage(entry.path, entry.filename);
      // malá pauza, ať prohlížeč stíhá řadit stahování
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch {
      failed.push(entry.path);
    }
  }
  return failed;
}
