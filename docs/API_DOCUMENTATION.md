# API Reference — Lalaland Cafe Backend

Base URL: `/api/v1`
Auth: `Authorization: Bearer <accessToken>` header, required on staff/admin endpoints.
All responses: `{ "success": boolean, "data"?: ..., "message"?: "..." }`

## Auth

| Method | Path              | Auth | Description                          |
|--------|-------------------|------|----------------------------------------|
| POST   | /auth/register    | none | Create a customer account              |
| POST   | /auth/login        | none | `{ email, password }` → access + refresh token |
| POST   | /auth/refresh       | none | `{ userId, refreshToken }` → new access token |
| POST   | /auth/logout         | none | Revokes a refresh token                |

## Menu

| Method | Path                              | Auth               | Description                          |
|--------|-----------------------------------|---------------------|----------------------------------------|
| GET    | /menu/categories                   | none                | List active categories                 |
| GET    | /menu/items?categoryId=&search=&page=&limit= | none    | Paginated/filterable menu items        |
| GET    | /menu/items/:itemId                 | none                | Item detail incl. customization groups |
| POST   | /menu/items                          | MANAGER, ADMIN      | Create a menu item                     |
| PUT    | /menu/items/:itemId                   | MANAGER, ADMIN      | Update a menu item                     |
| PATCH  | /menu/items/:itemId/availability       | BARISTA, MANAGER, ADMIN | Toggle sold-out / available       |
| POST   | /menu/items/:itemId/image               | MANAGER, ADMIN          | Upload a product image (multipart `image` field, JPEG/PNG/WebP, max 5MB); sets `image_url` |

## Orders

| Method | Path                       | Auth                     | Description                                  |
|--------|-----------------------------|----------------------------|-------------------------------------------------|
| POST   | /orders                      | none (optional JWT)        | Place an order (guest QR or logged-in customer) |
| GET    | /orders/:orderId               | none                       | Order detail + line items                       |
| GET    | /orders                          | BARISTA, MANAGER, ADMIN    | Live kitchen queue                               |
| PATCH  | /orders/:orderId/status            | BARISTA, MANAGER, ADMIN    | Advance order status                             |
| GET    | /orders/reports/sales                | MANAGER, ADMIN             | `?from=&to=` daily revenue/order-count rollup    |

## Inventory (all routes require MANAGER or ADMIN)

| Method | Path                          | Description                     |
|--------|-------------------------------|-----------------------------------|
| GET    | /inventory                      | List all ingredients + stock      |
| GET    | /inventory/low-stock              | Ingredients at/below reorder level |
| POST   | /inventory/:ingredientId/restock    | `{ quantity }` — adds stock        |

## Example — Place an order

```
POST /api/v1/orders
Content-Type: application/json

{
  "channel": "QR",
  "tableId": 2,
  "items": [
    {
      "itemId": 2,
      "quantity": 1,
      "optionValueIds": [3, 7, 10]
    }
  ]
}
```

Response `201`:
```
{
  "success": true,
  "data": {
    "order_id": 15,
    "order_number": "LC-20260806-0016",
    "status": "PENDING",
    "subtotal": 6.25,
    "tax_amount": 0.31,
    "total_amount": 6.56,
    "queue_number": 16
  }
}
```

Full request/response examples with headers: see `docs/postman_collection.json`, importable
directly into Postman or Insomnia.
