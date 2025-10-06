import * as gmailTester from 'gmail-tester';
import { Email, Credentials } from 'gmail-tester';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();

/** required fields in ENV: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN */

function reqEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  const trimmed = v
    .trim()
    .replace(/^"+|"+$/g, '')
    .replace(/^'+|'+$/g, '');
  if (!trimmed) throw new Error(`Empty ${name} after trim`);
  return trimmed;
}

const CID = reqEnv('GMAIL_CLIENT_ID');
const CSEC = reqEnv('GMAIL_CLIENT_SECRET');
const RTOK = reqEnv('GMAIL_REFRESH_TOKEN');

const credentials: Credentials = {
  installed: {
    client_id: CID,
    project_id: 'gmail-for-autotests',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: CSEC,
    redirect_uris: ['http://localhost'],
  },
};

// ---- auto refresh access_token using refresh_token ----
let tokenCache: {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: 'Bearer';
  expiry_date: number;
} | null = null;

function isTokenValid(t?: { expiry_date?: number }) {
  if (!t?.expiry_date) return false;
  return t.expiry_date - Date.now() > 60_000;
}

async function getFreshToken() {
  if (tokenCache && isTokenValid(tokenCache)) return tokenCache;

  const body = new URLSearchParams({
    client_id: CID,
    client_secret: CSEC,
    refresh_token: RTOK,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh token: ${res.status} ${res.statusText} - ${text}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number; // seconds
    token_type: 'Bearer';
    scope?: string;
    refresh_token?: string;
  };

  if (!json.access_token || !json.expires_in) {
    throw new Error('Token response missing access_token or expires_in');
  }

  const effectiveRefresh = json.refresh_token ?? RTOK;

  tokenCache = {
    access_token: json.access_token,
    refresh_token: effectiveRefresh,
    scope: json.scope ?? 'https://www.googleapis.com/auth/gmail.readonly',
    token_type: 'Bearer',
    expiry_date: Date.now() + json.expires_in * 1000,
  };

  return tokenCache;
}

export async function getEmailsFromLabel(
  recipient: string,
  subject: string,
  maxWaitTime: number = 900,
  startTime: Date = new Date(),
): Promise<Email> {
  try {
    const token = await getFreshToken();

    const messages: Email[] = await gmailTester.check_inbox(credentials, token, {
      include_body: true,
      wait_time_sec: 10,
      max_wait_time_sec: maxWaitTime,
      label: 'qa_automation@cleanchoice.com',
      to: recipient,
      subject: subject,
      after: startTime,
    });

    if (!messages || messages.length === 0) {
      const errorMsg = `❌ Email with subject "${subject}" not found for recipient "${recipient}" within ${maxWaitTime} sec`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    return messages[0];
  } catch (error) {
    console.error('❌ Error while fetching email:', error);
    throw error;
  }
}

export function extractOtpFromEmail(email: any): string {
  if (!email.body) throw new Error('OTP not found');
  const emailContent = email.body.html || email.body.text;
  if (!emailContent) throw new Error('OTP not found');
  const $ = cheerio.load(emailContent);
  const otpFromHtml = $('.otp-code-container-selector-example').text().trim();
  if (otpFromHtml) return otpFromHtml;
  const otpMatch = emailContent.match(/\b\d{4,6}\b/);
  if (otpMatch) return otpMatch[0];
  throw new Error('OTP not found');
}

export function extractLinkFromEmail(email: any, linkText: string): string {
  if (!email || typeof email !== 'object') throw new Error('Email not found');
  if (!email.body || typeof email.body !== 'object') throw new Error('Email has no body');
  if (!email.body.html || typeof email.body.html !== 'string') throw new Error('Email has no body as string');

  const emailContent = email.body.html;
  const $ = cheerio.load(emailContent);

  const link = $('a')
    .filter((_, el) => $(el).text().trim() === linkText)
    .attr('href');
  if (link) return link;
  throw new Error('Link not found');
}

export function extractSecretKeyFromEmail(email: any): string {
  const emailContent = email.body.html || email.body.text;
  if (!emailContent) throw new Error('OTP not found');
  const $ = cheerio.load(emailContent);
  const otpFromHtml = $('.otp-code-container-selector-example').text().trim();
  if (otpFromHtml) return otpFromHtml;

  const secretKeyRegex = /<b>\s*([a-f0-9]{40,})\s*<\/b>/i;
  const match = emailContent.match(secretKeyRegex);
  if (!match || !match[1]) throw new Error('Secret key not found in the email.');
  return match[1];
}

export function extractFieldFromEmail(email: any, label: string): string {
  if (!email.body) throw new Error(`Field "${label}" not found`);
  const emailContent = email.body.html || email.body.text;
  if (!emailContent) throw new Error(`Field "${label}" not found`);

  const normalizedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${normalizedLabel}\\s*[:–-]?\\s*(.+)`, 'i');

  const $ = cheerio.load(emailContent);
  const htmlText = $('body').text();
  const matchHtml = htmlText.match(regex);
  if (matchHtml) return matchHtml[1].trim();

  const matchText = emailContent.match(regex);
  if (matchText) return matchText[1].trim();

  throw new Error(`Field "${label}" not found`);
}
