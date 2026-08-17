# Architecture — HLD / LLD

## 1. High-Level Design

```
                     ┌─────────────────────┐
                     │   React Frontend     │
                     │  (Redux Toolkit,     │
                     │   React Router)      │
                     └──────────┬───────────┘
                                │ REST (JSON) over HTTPS, JWT bearer
                     ┌──────────▼───────────┐
                     │   Express API        │
                     │  Routes → Controllers│
                     │  → Services →        │
                     │    Repositories      │
                     └──────────┬───────────┘
                                │ pg (node-postgres) connection pool
                     ┌──────────▼───────────┐
                     │   PostgreSQL          │
                     └───────────────────────┘
```

## 2. Backend Layering (strict, one direction)

```
Routes            → maps HTTP verb+path to a controller, applies middleware (auth, validation)
Controllers        → parse req, call ONE service method, shape the HTTP response
Services            → ALL business logic: pricing, stock checks, status-transition rules, tx boundaries
Repositories         → ONLY SQL. No business rules. No validation.
```

Example request flow — `POST /api/v1/orders`:
1. `order.routes.js` → Joi validation (`placeOrderSchema`) → `order.controller.placeOrder`
2. Controller extracts `userId` from the authenticated JWT (or `null` for guest/QR orders) and calls
   `OrderService.placeOrder(...)`
3. `OrderService.placeOrder`:
   - Recomputes price server-side from `menu_items` + `option_values` (never trusts the client)
   - Checks `recipe_items` against current `ingredients.stock_qty` for every line
   - Opens a DB transaction: inserts `orders` + `order_items` + `order_item_options`, decrements
     `ingredients.stock_qty`, inserts `stock_movements`
   - Commits, or rolls back the entire order on any failure
4. Controller returns the created order as JSON.

## 3. Database Design Highlights

- `users` — single table, `role` enum drives authorization (`CUSTOMER`/`BARISTA`/`MANAGER`/`ADMIN`).
- `menu_items` ↔ `option_groups` — many-to-many via `menu_item_option_groups`, so a customization
  group like "Sweetness" is defined once and reused across every drink that needs it.
- `recipe_items` links a menu item to the ingredients (and quantities) it consumes — this is what
  lets order placement verify and decrement stock automatically.
- `orders.queue_number` + `order_number` give both an internal sort key and a human-readable ID
  (`LC-YYYYMMDD-####`).
- `stock_movements` is an append-only ledger — stock levels are always reconstructable/auditable,
  not just a single mutable counter.

Full DDL: `database/schema.sql`. Sample data: `database/seed.sql`.

## 4. Frontend Architecture

- **State:** Redux Toolkit slices per domain (`auth`, `menu`, `cart`, `order`) — no prop-drilling,
  no duplicated server state.
- **Routing:** `react-router-dom` v6, route-level code splitting via `React.lazy`, `ProtectedRoute`
  wrapper enforcing both authentication and role checks client-side (server-side checks are the real
  enforcement; client-side is UX only).
- **API layer:** single Axios instance with request interceptor (attaches JWT) and response
  interceptor (transparent access-token refresh on 401).
- **Resilience:** `ErrorBoundary` around the route outlet so a render error in one page doesn't blank
  the whole app.

## 5. Key Business Rules Encoded in Code (not just docs)

| Rule | Where enforced |
|------|-----------------|
| Order status can only move forward through defined transitions | `OrderService.transitionStatus` (`ALLOWED_TRANSITIONS` map) |
| Price is always server-computed, never trusts client input | `OrderService.placeOrder` |
| An order cannot be placed if any ingredient would go negative | `OrderService.placeOrder` (pre-check) + DB `CHECK (stock_qty >= 0)` as a last line of defense |
| A customization group's max-selectable count is respected | `menu.service` (data shape) + `DrinkCustomize.jsx` (UI enforcement) + implicitly re-validated since price is recomputed server-side from submitted option IDs |

## 6. Scalability & Future Enhancements

- Read-heavy endpoints (menu browsing) are straightforward to put behind a cache (Redis) since menu
  data changes far less often than it's read.
- The service/repository split means swapping PostgreSQL access (e.g. to an ORM, or to CQRS with a
  read replica) touches only the repository layer.
- `channel` (`QR`/`WEB`/`COUNTER`) and `table_id` on `orders` already support adding a POS/counter
  ordering flow without a schema change.
- The layered structure and this document are written so the project can migrate the frontend to
  Next.js later without changing the API contract.
