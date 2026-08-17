# Business & Functional Requirements — Lalaland Cafe & Drink Studio

## 1. Business Context

Lalaland Cafe operates as a drink/tea studio where customers currently order via a QR-code menu at
their table, customizing sweetness, ice level, and toppings. The business needs this extended into a
full operating platform covering order fulfillment, stock control, and management visibility —
without disrupting the customer-facing ordering experience that already works.

## 2. Stakeholders / Personas

| Persona   | Goal                                                                 |
|-----------|-----------------------------------------------------------------------|
| Customer  | Order a customized drink quickly, know when it's ready                |
| Barista   | See incoming orders in order, mark progress, not run out of stock mid-order |
| Manager   | Keep the menu accurate, track sales, keep stock above reorder levels  |
| Admin     | Everything a Manager can do, plus user/role management                |

## 3. Functional Requirements

### FR-1 Customer Ordering
- FR-1.1 Browse menu by category, search by name.
- FR-1.2 View item detail with required/optional customization groups (e.g. Sweetness is required,
  Toppings is optional/multi-select up to 3).
- FR-1.3 Add customized items to a cart; edit quantity; remove items.
- FR-1.4 Checkout as a guest (QR/table) or as a logged-in customer.
- FR-1.5 Server computes authoritative price — client-submitted prices are never trusted.

### FR-2 Order Fulfillment
- FR-2.1 An order can only move through defined states in order:
  `PENDING → CONFIRMED → PREPARING → READY → COMPLETED`, or be `CANCELLED` before `READY`.
- FR-2.2 Barista/Manager/Admin can view the live queue and advance an order's status.
- FR-2.3 Placing an order must verify sufficient ingredient stock for every line item before
  committing — insufficient stock rejects the whole order (no partial orders).

### FR-3 Inventory
- FR-3.1 Each menu item has a recipe (ingredients + quantities consumed per unit sold).
- FR-3.2 Stock decrements automatically and atomically when an order is placed.
- FR-3.3 Every stock change is logged (`stock_movements`) with a reason (consumption/restock/wastage).
- FR-3.4 Manager/Admin can view low-stock alerts and manually restock.

### FR-4 Admin & Reporting
- FR-4.1 Manager/Admin can create/update menu items and toggle availability.
- FR-4.2 Manager/Admin can view a sales report (orders + revenue) for a date range.

### FR-5 Auth & Access Control
- FR-5.1 Four roles: CUSTOMER, BARISTA, MANAGER, ADMIN.
- FR-5.2 JWT-based session with short-lived access tokens and refresh tokens.
- FR-5.3 Every staff/admin endpoint enforces role-based authorization server-side (not just hidden
  in the UI).

## 4. Non-Functional Requirements

- **NFR-1 Performance:** menu browsing and cart interactions should feel instant; queue view polls
  rather than requiring manual refresh.
- **NFR-2 Responsiveness:** usable on mobile (customer QR flow), tablet (kitchen queue), and desktop
  (admin dashboard).
- **NFR-3 Accessibility:** semantic HTML, labeled form controls, keyboard-navigable, visible focus
  states, WCAG-aware contrast.
- **NFR-4 Security:** hashed passwords, parameterized queries, centralized input validation, rate
  limiting on auth endpoints.
- **NFR-5 Data integrity:** order placement and stock consumption are atomic (single DB transaction) —
  never leaves stock/orders inconsistent on partial failure.
- **NFR-6 Maintainability:** strict layered backend architecture; no business logic in controllers or
  repositories.

## 5. Out of Scope for this POC

Payment gateway integration, multi-branch support, loyalty/promotions, and a full automated test
suite are explicitly out of scope for this phase (see `README.md` §3) but the data model and service
boundaries are designed not to block them later.
