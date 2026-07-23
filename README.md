# prime.warren.digital

A **Prime Video–styled pitch site** for Warren Velázquez, built as a living
application for one specific role:

> **Senior Program Manager, Prime Video Sports Operations** — Prime Video Live
> Events team, New York.

Warren's real career is reframed as a Prime Video streaming catalog: his
programs become "titles," clickable cards open Prime-Video-style detail modals,
and an **X-Ray panel** maps his actual experience directly onto the job
description. Every "title" is a real program he has shipped — only the framing is
Prime Video.

> **Not affiliated with or endorsed by Amazon.** This is a fan-styled personal
> pitch. All Prime Video visual references are used for portfolio purposes only.

---

## Preview locally

It's a plain static site — **no build step, no dependencies**.

- **Easiest:** double-click `index.html` to open it in your browser.
- **With a local server** (recommended so relative links behave like production):
  ```bash
  cd "prime.warren.digital"
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```

The only external request is Google Fonts (Inter + Sora). Everything else —
key art, icons, gradients — is self-contained CSS and inline SVG.

---

## File map

| File          | Purpose                                                            |
|---------------|-------------------------------------------------------------------|
| `index.html`  | Home — LIVE billboard hero, career scrubber ("Season 14"), featured case-study carousel (cards open detail modals), a sports-style schedule row, stat strip, "Now streaming — built by Warren" products, reviews, CTA. All case-study modals live here. |
| `work.html`   | Case studies — flagship `android.com` detail hero, the deal→broadcast "Episodes" playbook, the full-width X-Ray JD→proof table, a "More titles like this" row, and per-title detail modals. |
| `about.html`  | About Warren, "Why Prime Video Sports Operations," an `id="xray"` section walking every Basic/Preferred Qualification with proof, a Leadership-Principles→evidence grid, reviews, CTA. |
| `styles.css`  | The full Prime Video design system (shared by all three pages). Imports the Sora display face. |
| `app.js`      | Shared interactions: scroll reveal, active-nav highlighting, row scrolling, the **modal engine**, and modal **tabs** (Details / X-Ray). No framework. |
| `CONTENT.md`  | The content & build brief — the source of truth for copy and the JD→proof map. |
| `vercel.json` | Static deploy config (`cleanUrls`, security + cache headers). |

---

## Deploy to Vercel

This deploys as a **static site with no build command**.

1. Push this folder to a Git repo (or run `vercel` from the folder with the CLI).
2. In Vercel, **New Project → import the repo**.
   - **Framework Preset:** *Other* (no framework).
   - **Build Command:** leave empty.
   - **Output Directory:** leave as the project root (the HTML files sit at the root).
3. Deploy. `vercel.json` already sets `cleanUrls: true` and `trailingSlash: false`,
   so pages resolve at `/`, `/work`, and `/about` (the in-page `.html` links still
   work — Vercel redirects them to the clean URLs).

### Point `prime.warren.digital` at it (custom domain)

1. In the Vercel project → **Settings → Domains** → add `prime.warren.digital`.
2. At your DNS provider for `warren.digital`, add a **CNAME** record:

   | Type  | Name / Host | Value                   |
   |-------|-------------|-------------------------|
   | CNAME | `prime`     | `cname.vercel-dns.com.` |

   (For an apex/root domain you'd use Vercel's A record instead, but since this is
   the `prime` subdomain, a CNAME is correct.)
3. Wait for DNS to propagate; Vercel provisions the TLS certificate automatically.
   The site is then live at `https://prime.warren.digital`.

---

## Notes

- Responsive down to 360px with no horizontal overflow.
- Modals and tabs are keyboard-operable (Enter/Space to open, Escape/backdrop/× to close).
- No console errors; no external assets except Google Fonts.
