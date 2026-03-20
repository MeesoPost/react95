# MS Maas95 — Windows 95 Themed Movie & Series Request System

MS Maas95 is a nostalgic Windows 95 themed web application built with Next.js, React95, and TypeScript. Friends and family can submit requests for movies and series through a retro-styled interface that looks and feels like Windows 95.

**Live:** https://request.meespost.nl

---

## Features

- Windows 95 UI via React95 component library
- TMDB movie/series search with poster thumbnails and release year
- Request submission form with email notification
- PostgreSQL database for storing requests
- Anubis bot protection (proof-of-work challenge)
- Self-hosted on a mini PC via Tailscale Funnel — no VPS, no Cloudflare
- TLS certificate via Let's Encrypt (DNS-01 challenge with Site.nl API)
- Auto-renewing SSL cert via acme.sh

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React95, Styled Components, TypeScript |
| Database | PostgreSQL 16 (Docker) |
| Email | Nodemailer + Fastmail SMTP |
| Movie data | TMDB API (v3) |
| Hosting | Self-hosted Ubuntu mini PC |
| Tunnel | Tailscale Funnel (TCP passthrough on port 443) |
| Reverse proxy | Caddy 2 (TLS termination) |
| Bot protection | Anubis (proof-of-work) |
| TLS cert | Let's Encrypt via acme.sh + Site.nl DNS API |

---

## Local Development

### Prerequisites

- Node.js 18+
- npm
- A TMDB API v3 key (free at themoviedb.org)

### Setup

```bash
git clone https://github.com/MeesoPost/react95.git
cd react95
npm install
```

Create `.env.local`:

```env
TMDB_API_KEY=your_tmdb_v3_api_key
DATABASE_URL=postgresql://maas95:yourpassword@localhost:5432/maas95
EMAIL_HOST=smtp.fastmail.com
EMAIL_PORT=587
EMAIL_USER=you@fastmail.com
EMAIL_PASS=your_fastmail_app_password
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000 — login with `admin` / `password`.

---

## Production Stack (Docker / Portainer)

### Architecture

```
internet → Tailscale Funnel (TCP:443) → Caddy:8443 (TLS) → Anubis:8923 (PoW) → app:3000 → PostgreSQL:5432
```

### Environment Variables

| Variable | Description |
|---|---|
| `DB_PASSWORD` | PostgreSQL password |
| `TMDB_API_KEY` | TMDB v3 API key |
| `EMAIL_HOST` | `smtp.fastmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Fastmail address |
| `EMAIL_PASS` | Fastmail app password |

### Database Setup

After first deploy, exec into the postgres container and run:

```sql
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_failures (
  id SERIAL PRIMARY KEY,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TLS Certificate

Cert is managed by acme.sh with a custom Site.nl DNS hook. Auto-renews every 60 days and restarts Caddy automatically.

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for full setup and renewal commands.

---

## Project Structure

```
src/
  app/
    page.tsx              # Login page
    request/page.tsx      # Request form
    api/
      search/route.ts     # TMDB search proxy
      submit/route.ts     # Request submission + email
    components/
      HourglassProgressBar.tsx  # Win95 loading screen
    styles/
      globals.css         # Global styles + focus styles
    utils/
      email.ts            # Nodemailer helper
  lib/
    db.ts                 # PostgreSQL pool
    registry.tsx          # Styled-components SSR registry
```

---

## Acknowledgments

- [React95](https://github.com/arturbien/React95) — Windows 95 component library
- [TMDB](https://www.themoviedb.org/) — Movie and series data
- [Anubis](https://github.com/TecharoHQ/anubis) — Bot protection
- [acme.sh](https://github.com/acmesh-official/acme.sh) — TLS certificate management
