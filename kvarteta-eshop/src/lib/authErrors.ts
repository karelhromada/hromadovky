const MESSAGE_MAP: Array<{ pattern: RegExp; cs: string }> = [
  { pattern: /invalid login credentials/i, cs: 'Nesprávný e-mail nebo heslo.' },
  { pattern: /user already registered|already been registered/i, cs: 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.' },
  { pattern: /email not confirmed/i, cs: 'E-mail ještě není potvrzený. Zkontrolujte svou schránku.' },
  { pattern: /password should be at least/i, cs: 'Heslo musí mít alespoň 8 znaků.' },
  { pattern: /rate limit|too many requests/i, cs: 'Příliš mnoho pokusů. Zkuste to prosím později.' },
  { pattern: /invalid email|unable to validate email/i, cs: 'Zadejte platný e-mail.' },
  { pattern: /new password should be different/i, cs: 'Nové heslo se musí lišit od aktuálního.' },
  { pattern: /token has expired|invalid token|otp_expired/i, cs: 'Odkaz pro obnovu hesla vypršel. Vyžádejte si nový.' },
  { pattern: /network|fetch failed/i, cs: 'Nelze se připojit k serveru. Zkontrolujte připojení.' },
];

export function translateAuthError(err: unknown): string {
  const fallback = 'Nastala neočekávaná chyba. Zkuste to prosím znovu.';
  if (!err) return fallback;

  const message =
    typeof err === 'string'
      ? err
      : err instanceof Error
      ? err.message
      : typeof (err as { message?: unknown }).message === 'string'
      ? ((err as { message: string }).message)
      : fallback;

  for (const { pattern, cs } of MESSAGE_MAP) {
    if (pattern.test(message)) return cs;
  }
  return message || fallback;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export interface PasswordCheck {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
}

export function checkPassword(password: string): PasswordCheck {
  if (password.length < 8) {
    return { valid: false, strength: 'weak', message: 'Heslo musí mít alespoň 8 znaků.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, strength: 'weak', message: 'Heslo musí obsahovat písmeno i číslici.' };
  }
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  if (password.length >= 12 && hasSymbol) {
    return { valid: true, strength: 'strong', message: 'Silné heslo.' };
  }
  return { valid: true, strength: 'medium', message: 'Vhodné heslo.' };
}
