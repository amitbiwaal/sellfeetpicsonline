# SellFeetOnline — Next.js website + blog CMS

The SellFeetOnline WordPress site rebuilt with **Next.js 16 (App Router)**, **React 19** and **Tailwind CSS 4**, with the same pink/plum design, all pages, legal pages and a built-in **admin panel (CMS)** for writing blog posts.

- Website: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin/`

---

## What's included

**Public website**

| Page | URL | Notes |
| --- | --- | --- |
| Home | `/` | Hero, stats, steps, earnings calculator, safety habits, vetted platforms, latest articles, FAQ (with FAQ schema) |
| Best Platforms | `/best-platforms/` | Top pick, comparison table and ranking (edited in Admin → Platforms) |
| Safety Tips | `/safety-tips/` | Full safety & privacy guide with checklist |
| Blog | `/blog/`, `/blog/page/2/` | Latest articles, categories, search |
| Blog posts | `/{post-slug}/` | Same URLs as WordPress, table of contents, author box, related posts |
| About / Contact | `/about/`, `/contact/` | Contact form messages go to Admin → Messages |
| Legal pages | `/privacy-policy/`, `/terms-of-service/`, `/disclaimer/`, `/affiliate-disclosure/`, `/cookie-policy/`, `/dmca-policy/`, `/editorial-policy/` | Editable in Admin → Pages |
| Archives | `/category/{slug}/`, `/tag/{slug}/`, `/author/{slug}/` | Tag pages are `noindex` |
| Search | `/search/?q=…` | `noindex` |
| SEO files | `/sitemap.xml`, `/robots.txt`, `/feed/` (RSS), `/manifest.webmanifest` | |

SEO: canonical URLs, Open Graph/Twitter cards, JSON-LD (Organization, WebSite, BlogPosting, BreadcrumbList, FAQPage, Person, ItemList), trailing-slash URLs identical to WordPress and 301 redirects for old WordPress URLs (`/home/`, `/sitemap_index.xml`, `/category/uncategorized/`, `/wp-admin` …). Old image URLs under `/wp-content/uploads/…` keep working.

**Admin panel (`/admin/`)**

- **Posts** – rich text editor (headings, bold/italic, links incl. *affiliate/sponsored* links, lists, quotes, tables, images, alignment, HTML source mode), excerpt, featured image, category, tags, author, draft/publish, scheduling, preview of drafts on the real site, duplicate, delete, SEO title/description with a Google preview, `noindex` switch. `Ctrl + S` saves.
- **Pages** – the legal pages (and any new simple page). `{{contact_email}}`, `{{site_name}}` and `{{site_url}}` are filled in from Settings.
- **Media** – drag & drop uploads; images are auto-rotated, resized, converted to WebP and **stripped of GPS/EXIF data**; alt text editing.
- **Categories, Tags, Authors** – with author photo, bio and social links (shown on every article).
- **Platforms** – ratings, scores, fees, “show on homepage”, “top pick”, affiliate link, ranking order.
- **Messages** – contact form inbox (optional email notifications).
- **Users** – change your password, add editors/admins.
- **Settings** – site name, tagline, contact email, Google Analytics (with cookie consent), social links, clear cache.

Every save updates the live website immediately.

---

## Quick start (on your computer)

Requirements: **Node.js 20.12 or newer** (22 or 24 recommended).

```bash
npm install
npm run setup     # creates .env, the database, starter content and your admin login
npm run dev       # http://localhost:3000
```

`npm run setup` prints your admin email and password (they are also saved in `.env`). Log in at `http://localhost:3000/admin/` and **change the password** in *Admin → Users*.

The starter content (the 4 WordPress posts, images, author, legal pages and platforms) is loaded only once, so anything you delete in the admin panel stays deleted.

---

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also prepares the database first) |
| `npm start` | Run the production build |
| `npm run setup` | First-time setup (safe to run again) |
| `npm run admin:create -- --email you@site.com --password "NewPass12345"` | Create an admin or reset a forgotten password |
| `npm run db:studio` | Browse the database in the browser (Drizzle Studio) |
| `npm run import:wordpress` | Re-import posts/images from the live WordPress site into `content/seed/` (only needed before the switch) |
| `npm run lint` / `npm run typecheck` | Code checks |

---

## Deploying

### Option A — VPS or Hostinger Node.js hosting (simplest)

The default setup stores everything on the server: the database in `data/` and uploaded images in `storage/uploads/`.

1. Upload the project (or `git clone` it) to the server.
2. Create `.env` from `.env.example`:
   - `NEXT_PUBLIC_SITE_URL=https://sellfeetonline.com`
   - a long random `SESSION_SECRET`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` for the first login
3. Install, build and start:
   ```bash
   npm ci
   npm run build
   npm start            # listens on port 3000 (use PORT=xxxx to change)
   ```
   Keep it running with PM2: `npm i -g pm2 && pm2 start npm --name sellfeetonline -- start && pm2 save`.
   On Hostinger's Node.js hosting, set the build command to `npm run build` and the start command to `npm start`.
4. Put Nginx (or Hostinger's proxy) in front with HTTPS. Admin login cookies require HTTPS in production.
5. **Backups:** copy `data/sellfeetonline.db` and `storage/uploads/` regularly. Never delete these folders when redeploying.

### Option B — Vercel

Vercel's filesystem is temporary, so use hosted services for data and uploads:

1. **Database:** create a free database at [turso.tech](https://turso.tech) and add `DATABASE_URL` (`libsql://…`) and `DATABASE_AUTH_TOKEN`.
2. **Uploads:** in Vercel → Storage, create a **Blob** store and connect it (adds `BLOB_READ_WRITE_TOKEN`).
3. Add `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Deploy. The build creates the tables, loads the starter content and your admin account automatically.

### Switching the domain from WordPress

1. Deploy the new site and check it on a temporary URL.
2. Point `sellfeetonline.com` DNS to the new host.
3. In Google Search Console, submit `https://sellfeetonline.com/sitemap.xml`.

All post URLs, page URLs and image URLs stay the same, and old WordPress-only URLs are redirected.

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Public site address, no trailing slash |
| `SESSION_SECRET` | yes | 32+ random characters for signing admin sessions |
| `DATABASE_URL` | no | Default `file:./data/sellfeetonline.db`; Turso `libsql://…` on Vercel |
| `DATABASE_AUTH_TOKEN` | Turso only | Turso access token |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first run | First admin account (only used while no admin exists) |
| `BLOB_READ_WRITE_TOKEN` | Vercel | Store uploads in Vercel Blob |
| `UPLOAD_DIR` | no | Custom folder for uploads on disk |
| `RESEND_API_KEY`, `MAIL_FROM` | no | Email notifications for new contact messages |
| `INSECURE_COOKIES` | no | `true` only to test a production build over plain HTTP |

---

## Project structure

```
content/seed/          Starter content (imported WordPress posts, legal pages, platforms)
drizzle/               Database migrations
public/wp-content/     Images migrated from WordPress (same URLs as before)
public/images/         Logos, icons, default social image
scripts/               setup, database preparation, admin creation, WordPress importer
src/app/(site)/        Public website pages
src/app/admin/         Admin panel (pages + server actions in _actions/)
src/app/api/admin/     Image upload and draft preview endpoints
src/components/        UI (site, home, blog, admin)
src/lib/               Database schema, data queries, auth, SEO helpers, HTML processing
```

Tech: Next.js 16 · React 19 · Tailwind CSS 4 · Drizzle ORM + libSQL/SQLite · TipTap editor · sharp · jose + bcrypt.

## Security notes

- Admin pages and every admin action check the login session against the database.
- Passwords are hashed with bcrypt; changing a password signs out other devices.
- Login attempts and contact form submissions are rate-limited; the contact form has spam traps.
- Post and page HTML is sanitized before it is saved.
- Admin, API and search URLs are excluded from search engines.

## Content notes

- The legal pages are solid templates written for this site, but they are not legal advice. Have them reviewed for your country and business, then edit them in *Admin → Pages*.
- Platform “Visit” buttons only appear after you add a website/affiliate link in *Admin → Platforms*.
