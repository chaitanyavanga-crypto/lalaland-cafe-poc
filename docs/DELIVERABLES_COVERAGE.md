# Deliverables Coverage — Cumulative, Current as of the Docker/Admin-UI Pass

Fourth pass on this project. Same rules throughout: nothing rounded up, nothing hidden. This is the
authoritative, current list — it supersedes everything in earlier coverage docs.

Legend: (Done) / (Partial) / (Not done)

## 1. What this pass closed

- **Admin Menu Management UI** (`/admin/menu`, MANAGER/ADMIN only) — the image-upload endpoint from
  the previous pass had no UI to drive it. Now: list all menu items, toggle availability, upload a
  replacement photo per item (client-side type/size validation before the request even goes out),
  TanStack Query cache invalidation so changes show up immediately without a page reload.
- **Visual consistency pass** — Login/ForgotPassword/ResetPassword/DrinkCustomize now use a new
  static `.lc-card` style (previously some used plain Bootstrap `Card`, one had accidentally been
  given the hover-animated grid-card style, which looked buggy on a static form). QueuePage and
  InventoryPage CTAs now match the rounded-pill button language used everywhere else.
- **`FoodImage` now accepts a `style` prop** — needed for the small thumbnail size in the new admin
  table; previously it only supported `className`, which isn't enough to constrain a fixed-size box
  without a wrapper.
- **Docker**: `backend/Dockerfile`, `frontend/Dockerfile` + `nginx.conf` (multi-stage build, SPA
  fallback routing), and a root `docker-compose.yml` wiring Postgres (with the schema/seed SQL
  mounted as init scripts — no manual `psql -f` needed when using Docker), backend, and frontend
  together, with a named volume for uploaded images so they survive container restarts.
- **Deployment docs** — README §12 rewritten with real `docker compose up --build` instructions plus
  concrete Vercel (frontend) and Render/Railway (backend + Postgres) steps, replacing the previous
  "sketch."

## 2. Honesty note on what could and couldn't be verified this pass

- Frontend: re-built for real (`npm run build`) after every change in this pass, including a
  successful build with the new `MenuManagementPage` chunk. Brace-balance swept clean.
- **Docker was not build-tested** — this sandbox has no `docker` binary available. The Dockerfiles
  and compose file use standard, well-known patterns (multi-stage Node build, nginx static serving,
  Postgres `docker-entrypoint-initdb.d` for schema/seed), and `docker-compose.yml` was validated as
  parseable YAML, but **you should run `docker compose up --build` yourself as the real test** —
  don't take "included" as "verified" here the way the backend boot test or frontend build were.
- The `nginx.conf` SPA fallback (`try_files $uri $uri/ /index.html`) is a standard, well-tested
  pattern for this exact React Router setup, but wasn't tested against an actual nginx binary
  either (also unavailable in this sandbox).

## 3. Full running list — everything checked against the requirements across all passes

### Done
- Frontend runs via `npm install && npm run dev` (Vite) — verified with a real build
- Backend runs via `npm install && npm run dev` — verified with a real boot + endpoint hit
- Database schema + seed data — verified with a real Postgres grammar parser (not a live import,
  see §4)
- Auth: register, login, logout, JWT access + refresh, forgot/reset password, RBAC (4 roles)
- CRUD: Menu (create/update/toggle/image upload — now with a real admin UI), Inventory
  (list/low-stock/restock), Orders (place/status transitions/queue/sales report)
- Environment files: all 4 requested (`backend/.env`, `.env.example`, `frontend/.env`,
  `.env.example`), variable names cross-checked against actual code usage, `DB_PASSWORD=Root` as
  requested
- Product images: real photography for all 6 seeded items, optimized, network-independent fallback
  component, admin upload flow
- Swiggy-inspired UX: sticky nav, hero banner, sticky search + category chips, hover-animated food
  cards, cart drawer, skeleton loading, empty states
- Two real bugs fixed: unseeded `recipe_items` (inventory tracking silently never fired), dead
  `JWT_REFRESH_SECRET` env var mismatch
- `npm audit`: 0 vulnerabilities on the backend (bcrypt 5.x → 6.x, multer 1.x → 2.x)
- Docker: Dockerfiles + compose file (not build-tested — see §2)
- Deployment docs for Docker, Vercel, Render/Railway

### Partial
- CRUD: Customers and Users have no dedicated CRUD screens or endpoints beyond what the `users`
  table + auth flow already provides (see the assumption logged in an earlier pass — a separate
  "Customers" module wasn't built as a duplicate of the existing user/customer concept)
- Swagger/OpenAPI: only the Auth module is documented in `backend/src/docs/openapi.yaml`; Menu/
  Orders/Inventory remain Markdown-only in `docs/API_DOCUMENTATION.md`
- Visual redesign: customer-facing flow (menu, cart, drink customization) and now the new Menu
  Management page got the full treatment; AdminDashboard/QueuePage/InventoryPage are functional and
  visually consistent (rounded buttons, theme colors) but weren't rebuilt with the hero/skeleton/
  empty-state pattern the customer flow has

### Not done
- Products/Categories/Employees/Payments/Reports/Audit-log as separate, new CRUD modules beyond
  what the domain model (menu items, orders, inventory, users/roles) already covers
- Automated tests (`jest`/`supertest` remain wired in `package.json`, unused)
- Sorting on any list endpoint
- A live PostgreSQL import in this sandbox (package mirror unavailable) and a live Docker build (no
  `docker` binary in this sandbox) — both need to be run on your machine as the final check
- Lighthouse/performance audit pass

## Bottom line

Across four passes: the project now installs, boots, and builds for real (verified, not assumed);
has zero backend audit vulnerabilities; has real product photography with a network-independent
fallback; has a working image-upload feature with an actual admin UI to drive it, not just an API
endpoint; and has Docker + concrete deployment instructions for three real targets. The two
verification gaps that remain are both environment limitations of this sandbox, not unfinished
work: no live Postgres to import into, and no Docker daemon to build against — both are called out
explicitly rather than glossed over.
