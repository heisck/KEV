#!/usr/bin/env node
/**
 * One-time helper: mints the GMAIL_REFRESH_TOKEN that EmailService uses to send
 * mail over the Gmail REST API (HTTPS) instead of SMTP, which Render and Railway
 * block on their free tiers.
 *
 * Prerequisites, once, in Google Cloud Console for your existing KEV project:
 *   1. APIs & Services → Library → enable "Gmail API".
 *   2. Credentials → Create credentials → OAuth client ID → type "Web application".
 *   3. Add http://127.0.0.1:5555/callback as an Authorized redirect URI.
 *   4. Put the client id/secret in the root .env as GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET.
 *
 * Then:  node scripts/gmail-refresh-token.mjs
 *
 * Sign in as the mailbox that should appear in the From: header, approve the
 * "Send email on your behalf" scope, and paste the printed token into .env.
 * Refresh tokens do not expire, so this is a one-off per mailbox.
 */
import { createServer } from 'node:http';
import { loadEnv } from './load-root-env.mjs';

const REDIRECT_URI = 'http://127.0.0.1:5555/callback';
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

const env = { ...loadEnv(), ...process.env };
const clientId = env.GMAIL_CLIENT_ID;
const clientSecret = env.GMAIL_CLIENT_SECRET;
if (!clientId || !clientSecret || clientId.startsWith('your-')) {
  console.error('[gmail] Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env first (see header comment).');
  process.exit(1);
}

const consentUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    // `consent` + offline is what makes Google return a refresh_token rather than
    // only an access token on a repeat authorisation.
    access_type: 'offline',
    prompt: 'consent',
  });

/** Trade the one-shot authorization code for a long-lived refresh token. */
async function exchange(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_description ?? json.error ?? `HTTP ${res.status}`);
  if (!json.refresh_token) throw new Error('no refresh_token returned — revoke prior access and retry');
  return json.refresh_token;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== '/callback') return res.writeHead(404).end();

  const error = url.searchParams.get('error');
  const code = url.searchParams.get('code');
  if (error || !code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end(`Authorization failed: ${error ?? 'no code'}`);
    console.error(`[gmail] Authorization failed: ${error ?? 'no code returned'}`);
    server.close();
    process.exitCode = 1;
    return;
  }

  try {
    const refreshToken = await exchange(code);
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done — return to your terminal.');
    console.log('\n[gmail] Add these to your root .env:\n');
    console.log(`GMAIL_REFRESH_TOKEN=${refreshToken}`);
    console.log('GMAIL_FROM_ADDRESS=<the gmail address you just signed in as>\n');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end(String(err.message));
    console.error(`[gmail] Token exchange failed: ${err.message}`);
    process.exitCode = 1;
  }
  server.close();
});

server.listen(5555, '127.0.0.1', () => {
  console.log('[gmail] Open this URL, sign in as the sending mailbox, and approve:\n');
  console.log(consentUrl + '\n');
  console.log('[gmail] Waiting for the redirect on 127.0.0.1:5555 …');
});
