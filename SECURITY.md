# Security: Preventing Common Cyber Attacks

This document summarizes how Teezee mitigates common threats (DDoS, phishing, brute-force, XSS, etc.) and what you should do in production.

---

## 1. DDoS (Distributed Denial of Service)

**What it is:** Attackers flood your site with traffic to make it unavailable.

**What we do in the app:**
- **Rate limiting** on sensitive endpoints (login, register, forgot-password, verification codes). See `lib/rateLimit.ts`. Each IP is limited to a small number of requests per minute so one client cannot hammer the server.
- **Security headers** in `next.config.ts` (e.g. `X-Content-Type-Options`, `Strict-Transport-Security`).

**What you should do in production:**
- **Use a CDN/WAF:** Put the site behind **Cloudflare**, **Vercel’s Edge Network**, or **AWS CloudFront + WAF**. They absorb and filter bad traffic before it hits your app.
- **Scale:** On Vercel or similar, scale with traffic; add rate limits at the edge if the platform supports it.
- **Upgrade rate limiting:** For multi-instance deployments, replace the in-memory limiter in `lib/rateLimit.ts` with **Redis** (e.g. [Upstash](https://upstash.com/)).

---

## 2. Phishing

**What it is:** Fake emails or sites that trick users into giving passwords or payment details.

**What we do in the app:**
- No sensitive links in emails without verification (e.g. reset codes, not magic links that auto-login).
- Clear auth flows (login, reset password) so users know they’re on your domain.

**What you should do:**
- **Email authentication:** Set **SPF**, **DKIM**, and **DMARC** for your domain so recipients can verify that emails really come from you.
- **User education:** Tell customers you never ask for passwords by email and to always check the URL (e.g. `https://yourdomain.com`).
- **HTTPS only:** Enforce HTTPS (we send `Strict-Transport-Security`); use a valid TLS certificate.

---

## 3. Brute-Force (Guessing Passwords)

**What it is:** Automated attempts to guess user passwords.

**What we do in the app:**
- **Rate limiting** on login-related and auth endpoints (see above).
- **Account lockout:** User model supports locking after failed attempts (see `models/User.ts`); use it in your login flow.
- **Strong passwords:** Validation and hashing (e.g. bcrypt) for passwords.

**What you should do:**
- Ensure login (NextAuth) and any custom auth use the same rate limiting or lockout logic.
- Consider **CAPTCHA** (e.g. reCAPTCHA) on login/register if abuse continues.

---

## 4. XSS (Cross-Site Scripting)

**What it is:** Attackers inject scripts into your pages to steal sessions or data.

**What we do in the app:**
- **React** escapes content by default; avoid `dangerouslySetInnerHTML` with user input.
- **Security headers** (e.g. `X-Content-Type-Options: nosniff`, `X-Frame-Options`) reduce impact.

**What you should do:**
- Never render unsanitized user input as HTML.
- For rich text, use a sanitizer (e.g. DOMPurify) or a safe markup format.
- Optionally add a **Content-Security-Policy** (CSP) in `next.config.ts`; test carefully with Stripe/Cloudinary and other third-party scripts.

---

## 5. CSRF (Cross-Site Request Forgery)

**What it is:** A malicious site triggers actions on your site using the user’s cookies.

**What we do in the app:**
- **NextAuth** and session cookies with same-site and secure flags help limit cross-site use.
- State-changing operations require authentication and are done via API with the session.

**What you should do:**
- Keep using SameSite cookies and HTTPS.
- For critical actions (e.g. change email, delete account), consider an extra confirmation or token.

---

## 6. Injection (NoSQL / SQL)

**What it is:** Malicious input used to change queries and access or corrupt data.

**What we do in the app:**
- **Mongoose** with schema validation and parameterized queries (no raw concatenation of user input into queries).
- Input validation and type checks on API routes.

**What you should do:**
- Never build queries from string concatenation with user input.
- Validate and sanitize all inputs; use allowlists where possible.

---

## 7. Sensitive Data and Secrets

**What we do in the app:**
- No secrets in the repo (`.env` in `.gitignore`).
- Database and API keys only in environment variables.
- Passwords hashed with bcrypt; reset/verification codes are time-limited.

**What you should do:**
- Use a secrets manager in production (e.g. Vercel env, AWS Secrets Manager).
- Rotate keys and passwords periodically; restrict DB and API access by IP if possible.

---

## Quick Checklist

| Threat        | In-app mitigation              | Production recommendation        |
|---------------|--------------------------------|----------------------------------|
| DDoS          | Rate limiting on auth APIs     | CDN/WAF (Cloudflare, Vercel)     |
| Phishing      | Safe auth flows, no password by email | SPF/DKIM/DMARC, user education   |
| Brute-force   | Rate limit + account lockout   | CAPTCHA if needed                |
| XSS           | React escaping, headers       | No raw HTML from users, CSP      |
| CSRF          | SameSite cookies, auth        | HTTPS, confirm critical actions  |
| Injection     | Mongoose, validation           | No string-concat queries         |
| Data exposure | Env vars, hashing              | Secrets manager, HTTPS only      |

For questions or to report a vulnerability, contact your team or security lead.
