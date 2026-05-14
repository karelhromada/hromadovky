// Test skript pro Fio Banka REST API — ověř, že token funguje a vrací data
// Použití: node scripts/test-fio.mjs
// Vyžaduje: .env.local s FIO_API_TOKEN

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envLocalPath = join(__dirname, '..', '.env.local');

// Minimal .env.local parser — vyhneme se dotenv dependency
function loadEnvLocal() {
  try {
    const content = readFileSync(envLocalPath, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return env;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('❌ .env.local neexistuje. Zkopíruj .env.local.example na .env.local a vlož Fio token.');
      process.exit(1);
    }
    throw err;
  }
}

const env = loadEnvLocal();
const token = env.FIO_API_TOKEN;

if (!token || token === 'replace-me-with-fio-readonly-token') {
  console.error('❌ FIO_API_TOKEN není nastaven v .env.local. Vlož skutečný token z Fio internetbankingu.');
  process.exit(1);
}

// Window: posledních 7 dní
const today = new Date();
const weekAgo = new Date(today.getTime() - 7 * 86400000);
const fmt = (d) => d.toISOString().slice(0, 10);
const url = `https://fioapi.fio.cz/v1/rest/periods/${token}/${fmt(weekAgo)}/${fmt(today)}/transactions.json`;

// Nepouštět token do logu!
console.log(`📡 Volám Fio API (period ${fmt(weekAgo)} → ${fmt(today)})...`);

try {
  const res = await fetch(url, { headers: { 'User-Agent': 'kvarteta-eshop-test/1.0' } });
  if (!res.ok) {
    console.error(`❌ Fio API vrátilo HTTP ${res.status}: ${res.statusText}`);
    const body = await res.text();
    console.error(body.slice(0, 500));
    process.exit(1);
  }
  const data = await res.json();
  const transactions = data?.accountStatement?.transactionList?.transaction ?? [];
  console.log(`✅ OK. Period zachytilo ${transactions.length} transakcí.`);

  if (transactions.length > 0) {
    console.log('\nPrvní 3 transakce (kladné = příchozí, záporné = odchozí):');
    for (const t of transactions.slice(0, 3)) {
      const date = t.column0?.value;
      const amount = t.column1?.value;
      const vs = t.column5?.value ?? '(žádný VS)';
      const note = t.column16?.value ?? '';
      const id = t.column22?.value;
      console.log(`  • ${date} | ${amount > 0 ? '+' : ''}${amount} CZK | VS=${vs} | id=${id} | ${note}`);
    }
  } else {
    console.log('ℹ️  Žádné transakce v posledních 7 dnech. Pošli si na účet 1 Kč jako test.');
  }
} catch (err) {
  console.error('❌ Selhání při volání Fio API:', err.message);
  process.exit(1);
}
