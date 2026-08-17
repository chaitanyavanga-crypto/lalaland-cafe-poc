# Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REFRESH_TOKENS : has
    STORE_TABLES ||--o{ ORDERS : "ordered at"
    CATEGORIES ||--o{ MENU_ITEMS : contains
    MENU_ITEMS ||--o{ MENU_ITEM_OPTION_GROUPS : offers
    OPTION_GROUPS ||--o{ MENU_ITEM_OPTION_GROUPS : "applies to"
    OPTION_GROUPS ||--o{ OPTION_VALUES : has
    MENU_ITEMS ||--o{ RECIPE_ITEMS : requires
    INGREDIENTS ||--o{ RECIPE_ITEMS : "used in"
    INGREDIENTS ||--o{ STOCK_MOVEMENTS : "tracked by"
    ORDERS ||--o{ ORDER_ITEMS : contains
    MENU_ITEMS ||--o{ ORDER_ITEMS : "ordered as"
    ORDER_ITEMS ||--o{ ORDER_ITEM_OPTIONS : "customized with"
    OPTION_VALUES ||--o{ ORDER_ITEM_OPTIONS : "selected as"

    USERS {
        int user_id PK
        string full_name
        string email
        string role
    }
    ORDERS {
        int order_id PK
        string order_number
        int user_id FK
        int table_id FK
        string status
        numeric total_amount
    }
    MENU_ITEMS {
        int item_id PK
        int category_id FK
        string name
        numeric base_price
    }
    INGREDIENTS {
        int ingredient_id PK
        string name
        numeric stock_qty
        numeric reorder_level
    }
```

Render this with any Mermaid-compatible viewer (GitHub renders it natively, or use
https://mermaid.live). The authoritative source of truth for structure/constraints is
`database/schema.sql`.
