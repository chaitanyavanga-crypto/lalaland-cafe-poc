# Technical Design Notes — Roadmap Beyond this POC

This POC deliberately scopes to the modules in `README.md` §2. This document records how the
out-of-scope items (§3) would extend the existing design, so a reviewer can see the architecture
was chosen with them in mind rather than needing a rewrite later.

## Payments
`orders.total_amount` and `order.status` are already payment-provider agnostic. A `payments` table
(`order_id`, `provider`, `provider_ref`, `amount`, `status`) plus a `PaymentService` sitting between
`OrderService.placeOrder` and order confirmation would let `PENDING` orders wait on payment
confirmation before becoming `CONFIRMED`, without touching the existing order/inventory transaction.

## Multi-branch
`store_tables` would gain a `branch_id`; `ingredients`/`stock_movements` would be scoped per branch;
`orders.branch_id` would be added. The repository layer absorbs the extra `WHERE branch_id = $n`
filters — services and controllers are largely unaffected.

## Loyalty / Promotions
A `promotions` table + a pricing hook inside `OrderService.placeOrder` (where price is already
computed authoritatively) is the natural insertion point — pricing logic is centralized there for
exactly this reason.

## Testing strategy (for a full build-out)
- **Unit:** `services/*` with repositories mocked — this is where business rules (status transitions,
  stock checks, pricing) live, so this is where the highest-value tests are.
- **Integration:** `supertest` against a test database, covering the full request → response cycle
  including the order-placement transaction and rollback-on-failure path.
- **Frontend:** React Testing Library for `DrinkCustomize` (required/max-selectable option logic) and
  `CartPage` (checkout flow).

## Deployment sketch
- Backend: containerize (`Dockerfile` per service), run behind a reverse proxy (nginx), PostgreSQL as
  a managed instance (RDS/Cloud SQL) rather than co-located.
- Frontend: static build (`npm run build`) served via CDN/S3+CloudFront, `REACT_APP_API_BASE_URL`
  set at build/deploy time per environment.
- Env-specific config entirely via environment variables (see `.env.example` in both `backend/` and
  `frontend/`) — nothing environment-specific is hardcoded.
