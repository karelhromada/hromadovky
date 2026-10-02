// E-mail s dotazníkem spokojenosti (po doručení objednávky).
//
// Zdroj pravdy pro n8n workflow „Hromadovky – Dotazník spokojenosti": tělo funkce
// buildSurveyEmail() se kopíruje do Code nodu „Build" (n8n neumí importovat z repa).
// Po změně: node scripts/survey-email.test.mjs → zkopírovat do n8n.
// Náhled: node scripts/survey-email-preview.mjs <výstupní složka>
//
// Funkce je čistá a soběstačná (žádné importy) — proto jsou helpery uvnitř.

/**
 * @param {{
 *   kind: 'first' | 'reminder',
 *   orderId: string,
 *   token: string,
 *   firstName?: string | null,
 *   orderNumber?: string | null,
 *   itemNames?: string[],
 * }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildSurveyEmail(input) {
  const SITE = 'https://www.hromadovky.cz';
  const GOLD = '#c59b27';
  const GOLD_DARK = '#8e6b10';
  const RATING_LABELS = ['Nic moc', 'Šlo to', 'Dobré', 'Moc fajn', 'Nadšení'];
  const MAX_ITEMS = 3;

  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  if (input.kind !== 'first' && input.kind !== 'reminder') {
    throw new Error(`survey-email: neznámý kind "${input.kind}"`);
  }
  // id + token jdou do URL — pustit jen přesný tvar, jinak e-mail vůbec nesestavit.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(input.orderId))) {
    throw new Error('survey-email: neplatné orderId');
  }
  if (!/^[0-9a-f]{64}$/.test(String(input.token))) {
    throw new Error('survey-email: neplatný token');
  }

  const isReminder = input.kind === 'reminder';
  const baseUrl = `${SITE}/dotaznik?o=${input.orderId}&t=${input.token}`;
  const rateUrl = (n) => `${baseUrl}&h=${n}`;
  const optOutUrl = `${baseUrl}&odhlasit=1`;

  const firstName = String(input.firstName ?? '').trim().slice(0, 60);
  const greeting = firstName ? `Ahoj ${firstName},` : 'Dobrý den,';
  const names = (input.itemNames ?? []).map((n) => String(n ?? '').trim()).filter(Boolean);
  const shown = names.slice(0, MAX_ITEMS);
  const itemsText = shown.join(', ') + (names.length > MAX_ITEMS ? ` a další (${names.length - MAX_ITEMS})` : '');
  const orderRef = input.orderNumber ? `objednávka ${input.orderNumber}` : 'vaše objednávka';

  const subject = isReminder
    ? 'Ještě malá prosba: jak se vám hraje s kartami?'
    : 'Jak se vám hraje s novými kartami?';
  const preheader = isReminder
    ? 'Stačí jeden klik na hvězdičku. Víckrát už připomínat nebudeme.'
    : 'Stačí jeden klik na hvězdičku — zabere to půl minuty.';
  const headline = isReminder ? 'Ještě jedna malá prosba' : 'Jak se vám s kartami hraje?';
  const intro = isReminder
    ? 'před pár dny jsme se ptali, jak jste spokojeni s kartami od nás. Kdybyste našli půl minuty, moc nám to pomůže — jsme malá rodinná dílna a každá odpověď se počítá.'
    : 'karty už by měly být pár dní u vás a nás moc zajímá, jak dopadly. Jsme malá rodinná dílna a každá odpověď nám pomáhá dělat je lepší.';

  const P = 'margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#475569;';

  const starCells = RATING_LABELS.map((label, i) => {
    const n = i + 1;
    return `
              <td width="20%" align="center" bgcolor="#fffdf7" style="background-color:#fffdf7;border:2px solid #e8dcb8;border-radius:10px;">
                <a href="${rateUrl(n)}" title="${n} z 5 – ${esc(label)}" style="display:block;padding:14px 0 10px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
                  <span class="hk-star" style="display:block;font-size:30px;line-height:34px;color:${GOLD};">&#9733;</span>
                  <span style="display:block;font-size:13px;line-height:18px;font-weight:bold;color:${GOLD_DARK};">${n}</span>
                </a>
              </td>`;
  }).join('');

  const itemsRow = itemsText
    ? `<p style="${P}font-size:14px;line-height:22px;color:#64748b;">Týká se: <strong style="color:#1e293b;">${esc(itemsText)}</strong></p>`
    : '';

  const optOutRow = isReminder
    ? ''
    : `<p style="margin:5px 0;">Nechcete dostat připomínku? <a href="${optOutUrl}" style="color:#94a3b8;text-decoration:underline;">Stačí kliknout sem</a>.</p>`;

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${esc(subject)}</title>
<style>
  @media only screen and (max-width: 480px) {
    .hk-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .hk-outer { padding: 0 !important; }
    .hk-h1 { font-size: 23px !important; line-height: 29px !important; }
    .hk-stars { border-spacing: 4px 0 !important; }
    .hk-star { font-size: 26px !important; }
    .hk-logo { width: 200px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#fcfbfa;color:#1e293b;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fcfbfa;">
  <tr><td class="hk-outer" align="center" style="padding:32px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background-color:#ffffff;border-top:6px solid ${GOLD};border-collapse:separate;">
      <tr><td class="hk-pad" align="center" style="padding:32px 40px 8px;">
        <a href="${SITE}/" style="text-decoration:none;">
          <img class="hk-logo" src="${SITE}/email/logo.png" width="260" alt="Hromadovky.cz – karty plné příběhů" style="display:block;width:260px;max-width:100%;height:auto;border:0;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${GOLD};">
        </a>
      </td></tr>
      <tr><td align="center" style="padding:8px 40px 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;letter-spacing:10px;color:${GOLD};">&#9824;&#xFE0E; <span style="color:#b3261e;">&#9829;&#xFE0E;</span> <span style="color:#b3261e;">&#9830;&#xFE0E;</span> &#9827;&#xFE0E;</td></tr>
      <tr><td class="hk-pad" style="padding:20px 40px 8px;">
        <h1 class="hk-h1" style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:27px;line-height:34px;font-weight:bold;color:#1e293b;text-align:center;">${esc(headline)}</h1>
        <p style="${P}">${esc(greeting)}</p>
        <p style="${P}">${esc(intro)}</p>
        ${itemsRow}
      </td></tr>
      <tr><td class="hk-pad" style="padding:0 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffbf2;border:1px solid #f5f0e6;border-radius:12px;">
          <tr><td align="center" style="padding:22px 12px 6px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;font-weight:bold;color:#1e293b;">Kolik hvězdiček byste nám dali?</td></tr>
          <tr><td align="center" style="padding:0 12px 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#64748b;">Klikněte na kartu — hodnocení se rovnou uloží.</td></tr>
          <tr><td style="padding:0 6px;">
            <table class="hk-stars" role="presentation" width="100%" cellpadding="0" cellspacing="6" border="0" style="border-collapse:separate;border-spacing:8px 0;">
              <tr>${starCells}
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:8px 16px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;">${esc(RATING_LABELS[0])}</td>
                <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;">${esc(RATING_LABELS[4])}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="hk-pad" style="padding:24px 40px 36px;">
        <p style="${P}">Na další stránce se ještě zeptáme, <strong style="color:#1e293b;">jak jste se o nás dozvěděli</strong>, a můžete nám nechat vzkaz. Obojí je dobrovolné.</p>
        <p style="${P}margin-bottom:0;">Děkujeme a ať vám karty dělají radost!<br><strong style="color:#1e293b;">Karel Hromada</strong>, Hromadovky.cz</p>
      </td></tr>
      <tr><td class="hk-pad" align="center" style="padding:24px 40px 32px;border-top:1px solid #f1f5f9;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#94a3b8;">
        <p style="margin:5px 0;">Tento e-mail jste dostali, protože jste u nás nakoupili (${esc(orderRef)}).</p>
        ${optOutRow}
        <p style="margin:5px 0;">Něco není v pořádku? Odpovězte na tento e-mail nebo napište na <a href="mailto:obchod@hromadovky.cz" style="color:#94a3b8;">obchod@hromadovky.cz</a>.</p>
        <p style="margin:12px 0 0;">Hromadovky.cz — Karel Hromada, Zeyerova alej 20, 160 00 Praha 6, IČO 76137767</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    greeting,
    '',
    intro,
    itemsText ? `Týká se: ${itemsText}` : null,
    '',
    'Kolik hvězdiček byste nám dali? Klikněte na odkaz podle hodnocení:',
    ...RATING_LABELS.map((label, i) => `${i + 1} – ${label}: ${rateUrl(i + 1)}`),
    '',
    'Na další stránce se ještě zeptáme, jak jste se o nás dozvěděli. Je to dobrovolné.',
    '',
    'Děkujeme!',
    'Karel Hromada, Hromadovky.cz',
    '',
    isReminder ? null : `Nechcete dostat připomínku? ${optOutUrl}`,
    'Hromadovky.cz — Karel Hromada, Zeyerova alej 20, 160 00 Praha 6, IČO 76137767',
  ].filter((line) => line !== null).join('\n');

  return { subject, html, text };
}
