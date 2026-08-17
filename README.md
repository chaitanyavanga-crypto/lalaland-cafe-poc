# Lalaland Cafe & Drink Studio — Enterprise POC

A full-stack reference implementation for a modern cafe ordering platform: React 19 + Vite on the
frontend, Node.js/Express + PostgreSQL on the backend, with a Swiggy-inspired ordering UX (not a
clone — same UX principles: sticky nav, hero banner, category chips, food cards, cart drawer)
applied to a warm coffee-shop visual identity.

## 1. Stack

| Layer      | Stack                                                                          |
|------------|----------------------------------------------------------------------------------|
| Frontend   | React 19, Vite, Redux Toolkit, TanStack Query, React Router v6, React-Bootstrap  |
| Backend    | Node.js, Express, JWT auth, Joi validation, Multer (image upload)                |
| Database   | PostgreSQL (normalized schema, see `database/schema.sql`)                        |
| Docs       | BRD/FSD, architecture notes, API reference, OpenAPI stub, Postman collection      |

## 2. Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL 14+**, running locally (or reachable) with a superuser/role that can create databases

## 3. PostgreSQL setup

Install PostgreSQL if you don't have it already (macOS: `brew install postgresql@16`; Ubuntu/Debian:
`sudo apt install postgresql`; Windows: use the official installer). Then create the database role
password expected by this project's `.env` files (`Root` — change it before deploying anywhere real):

```bash
# Set the postgres superuser password to match backend/.env (skip if you already
# have a postgres role/password you'd rather use — just edit backend/.env to match)
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'Root';"

# Create the database
createdb -U postgres lalaland_cafe
```

### Import the schema and sample data

```bash
psql -U postgres -d lalaland_cafe -f database/schema.sql
psql -U postgres -d lalaland_cafe -f database/seed.sql
```

Or, using the bundled migration runner (does the same thing, reading credentials from
`backend/.env`):

```bash
cd backend
npm install
npm run migrate:seed
```

The seed data includes 6 menu items with real product photography (already included at
`frontend/public/images/menu/`), full recipes (`recipe_items`) so inventory actually decrements
when an order is placed, and 4 seed users (`admin@lalaland.cafe`, `manager@lalaland.cafe`,
`barista@lalaland.cafe`, `chloe@example.com`) — **their passwords are placeholder hashes**, so
either register fresh accounts via `POST /api/v1/auth/register` or replace the hashes in
`database/seed.sql` with a real bcrypt hash before trying to log in as one of them.

## 4. Backend setup

```bash
cd backend
npm install
npm run dev
```

Runs on **http://localhost:5000**. `backend/.env` is already populated and ready to use as-is
(assuming you completed step 3 with the default `Root` password) — no manual edits required.
`backend/.env.example` documents every variable for reference/deployment.

Quick sanity check once it's running:
```bash
curl http://localhost:5000/api/v1/health
```

## 5. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3000** (Vite dev server). `frontend/.env` is already populated and
points at the backend above — no manual edits required.

## 6. What's in the UI

- **Sticky navbar** with brand, role-aware nav links, theme toggle, and a cart button that opens a
  slide-out **cart drawer** (Offcanvas) instead of leaving the page
- **Hero banner** on the menu page
- **Sticky search + horizontally-scrolling category chips**
- **Food cards** with hover-lift animation, real product photography, and a graceful built-in
  fallback (an inline SVG, not a network image) if a photo is ever missing or fails to load — no
  card can show a broken image
- **Skeleton loading states** for the menu grid and **empty states** for no-results/empty-cart
- **Light/dark theme toggle** (persisted, `data-bs-theme`)

## 7. Product images

Every seeded menu item has a real photo at `frontend/public/images/menu/` (optimized JPEGs, ~20–45KB
each). Staff/admin can also upload a new photo for any item via:

```
POST /api/v1/menu/items/:itemId/image
Authorization: Bearer <token>  (MANAGER or ADMIN)
Content-Type: multipart/form-data
Body: image=<file>  (JPEG/PNG/WebP, max 5MB)
```

Uploaded files are stored in `backend/public/uploads/menu/` and served at
`http://localhost:5000/uploads/menu/<filename>`. A manager/admin can drive this from **Menu
Management** (`/admin/menu` — MANAGER/ADMIN only): toggle any item's availability or replace its
photo, with the change reflected on the customer-facing menu immediately (TanStack Query cache
invalidation, no page reload). If any `image_url` is ever null or 404s at request time, the
frontend's `FoodImage` component renders a generated placeholder instead of a broken `<img>` — this
happens entirely client-side, so it works even offline.

## 8. Modules implemented

- **Customer ordering** — browse, search, filter by category, customize (sweetness/ice/toppings),
  cart, checkout (guest or logged-in)
- **Order lifecycle** — `PENDING → CONFIRMED → PREPARING → READY → COMPLETED`/`CANCELLED`, enforced
  server-side
- **Kitchen/Barista queue** — live polled queue, one-tap status advance
- **Inventory** — ingredient stock tied to real recipes; an order now genuinely decrements stock in
  the same DB transaction as order creation (previously the recipes existed as a data model but
  were never seeded, so this never actually fired — fixed in this pass); low-stock alerts; restock
- **Admin reporting** — monthly revenue/order-count rollup
- **Auth** — register, login, logout, JWT access + rotating refresh tokens, forgot/reset password,
  role-based authorization (`CUSTOMER`, `BARISTA`, `MANAGER`, `ADMIN`)
- **Menu image upload** — see §7

## 9. Folder structure

```
lalaland-cafe-poc/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── public/uploads/menu/   # staff-uploaded product images land here
│   └── src/
│       ├── config/             # DB pool, env validation
│       ├── middleware/          # auth, validation, error handling, rate limiting, upload (multer)
│       ├── routes/               # Express routers (thin)
│       ├── controllers/           # request/response shaping only
│       ├── services/               # ALL business logic lives here
│       ├── repositories/            # ONLY talk to the database
│       ├── validators/               # Joi schemas
│       ├── database/                  # migration runner (migrate.js)
│       ├── docs/                       # OpenAPI spec (Auth module)
│       ├── logs/                        # Winston file output
│       └── utils/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── public/images/menu/      # seeded product photography, served as static files
│   └── src/
│       ├── redux/                # Redux Toolkit store + slices (client/app state)
│       ├── services/              # API service layer (wraps axios per domain)
│       ├── api/                     # Axios instance + interceptors
│       ├── context/                  # Theme + cart-drawer UI state
│       ├── routes/                    # Route table, protected routes, lazy loading
│       ├── pages/                      # One folder per feature area
│       ├── components/
│       │   ├── common/                  # Navbar, FoodCard, FoodImage, Skeleton, EmptyState, CartDrawer...
│       │   ├── layout/                   # Layout, Footer, HeroBanner
│       │   └── ui/                        # (reserved for generic UI primitives)
│       ├── hooks/, constants/, validations/, utils/, styles/
├── database/
│   ├── schema.sql
│   └── seed.sql
└── docs/
```

## 10. Architecture

Strict one-directional layering on the backend: `Routes → Controllers → Services → Repositories →
Database`. Controllers never contain business rules; Services own pricing, stock checks, and
status-transition rules; Repositories only issue SQL. Multi-step writes (order placement + stock
decrement) run inside one DB transaction. Full writeup: `docs/ARCHITECTURE.md`. Endpoint reference:
`docs/API_DOCUMENTATION.md` and `backend/src/docs/openapi.yaml` (Auth module).

## 11. Security

- bcrypt password hashing; JWT access tokens + opaque, hashed, revocable refresh tokens
- Password reset tokens are single-use, hashed at rest, time-boxed, and the endpoint always returns
  a generic response (prevents account enumeration)
- Role-based route guards on every staff/admin endpoint; centralized Joi validation; parameterized
  queries throughout; `helmet`, CORS allow-list, rate limiting
- `npm audit` is clean on the backend as of this pass (bcrypt bumped to 6.x, multer to 2.x — both
  resolve real flagged vulnerabilities in the versions this project started with)

## 12. Deployment

### Docker (local/dev)

```bash
docker compose up --build
```

Brings up Postgres (schema + seed data loaded automatically on first run via
`docker-entrypoint-initdb.d`), the backend on `:5000`, and the frontend (built + served via nginx)
on `:3000`. This `docker-compose.yml` is written for local/dev convenience — plaintext credentials
in the compose file, no secrets manager, no resource limits/replicas — not a hardened production
setup. **Note:** Docker isn't available in the sandbox this project was built in, so these files
have been reviewed for correctness but not actually build-tested — do a `docker compose up --build`
locally as your first check.

### Vercel (frontend)

Point Vercel at the `frontend/` directory, build command `npm run build`, output directory `dist`.
Set `VITE_API_BASE_URL` as a Vercel environment variable pointing at your deployed backend.

### Render / Railway (backend + Postgres)

Both offer a managed Postgres instance plus a Node web service. Point the web service at
`backend/`, build command `npm install`, start command `npm start`, and set every variable from
`backend/.env.example` (with real values — especially `JWT_ACCESS_SECRET` and `DB_PASSWORD`) in the
platform's environment settings. Point `DB_HOST`/`DB_PORT`/etc. at the managed Postgres instance's
connection details, then run `npm run migrate:seed` once (or `psql -f schema.sql -f seed.sql`)
against it.

Either way: uploaded images in `backend/public/uploads/` are local disk storage — fine for this POC
and for the Docker volume above, but a real production deployment on Render/Railway/Vercel should
move this to object storage (S3/GCS), since local disk doesn't reliably survive redeploys on most
PaaS platforms.

## 13. Known gaps

See `docs/DELIVERABLES_COVERAGE.md` for the full, current, honest list of what is and isn't done —
carried forward and updated across every pass on this project rather than re-litigated from scratch
each time.
