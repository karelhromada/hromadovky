import type { VercelRequest, VercelResponse } from '@vercel/node';
import chromium from '@sparticuz/chromium';
import puppeteer, { type Browser } from 'puppeteer-core';
import { renderInvoiceHtml, type InvoiceRow } from '../_lib/invoice-html.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

interface RpcInvoiceResponse extends InvoiceRow {
  id: string;
  pdf_path: string | null;
  status: string;
  paid_at: string | null;
  cancelled_at: string | null;
  pdf_generated_at: string | null;
  created_at: string;
  order_id: string | null;
}

async function fetchInvoice(id: string, token: string): Promise<RpcInvoiceResponse | null> {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error('Server misconfigured: SUPABASE_URL or SUPABASE_SECRET_KEY missing');
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_invoice_for_view`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_id: id, p_token: token }),
  });
  if (!response.ok) {
    throw new Error(`Supabase RPC failed: ${response.status}`);
  }
  const json = (await response.json()) as RpcInvoiceResponse | null;
  if (!json || !json.id) return null;
  return json;
}

async function htmlToPdf(html: string): Promise<Uint8Array> {
  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '14mm', right: '14mm' },
    });
    return pdf;
  } finally {
    if (browser) await browser.close();
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!rawId) {
      res.status(400).json({ error: 'Missing invoice id' });
      return;
    }
    // Allow URL like /api/faktura/<uuid>.pdf — strip optional .pdf suffix
    const id = rawId.replace(/\.pdf$/i, '');
    const token = (Array.isArray(req.query.t) ? req.query.t[0] : req.query.t) ?? '';
    if (!token) {
      res.status(403).json({ error: 'Missing token (?t=...)' });
      return;
    }

    const invoice = await fetchInvoice(id, token);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found or invalid token' });
      return;
    }

    const html = renderInvoiceHtml(invoice);
    const pdf = await htmlToPdf(html);

    const filename = `${invoice.number}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    // Cache for 5 minutes; invoice content is immutable but token may rotate
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.status(200).send(Buffer.from(pdf));
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[faktura] PDF generation failed:', e);
    res.status(500).json({ error: message });
  }
}
