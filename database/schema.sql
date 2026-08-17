-- =====================================================================
-- Lalaland Cafe & Drink Studio - PostgreSQL Schema
-- Enterprise POC | Normalized to 3NF
-- =====================================================================

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'BARISTA', 'MANAGER', 'ADMIN');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
CREATE TYPE order_channel AS ENUM ('QR', 'WEB', 'COUNTER');

-- ---------------------------------------------------------------------
-- USERS (customers, staff, admins share one table with role-based auth)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id         SERIAL PRIMARY KEY,
    full_name       VARCHAR(120)  NOT NULL,
    email           VARCHAR(160)  NOT NULL UNIQUE,
    phone           VARCHAR(20),
    password_hash   VARCHAR(255)  NOT NULL,
    role            user_role     NOT NULL DEFAULT 'CUSTOMER',
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ---------------------------------------------------------------------
-- STORE TABLES (for QR-based table ordering)
-- ---------------------------------------------------------------------
CREATE TABLE store_tables (
    table_id        SERIAL PRIMARY KEY,
    table_code      VARCHAR(20)  NOT NULL UNIQUE,
    qr_token        VARCHAR(64)  NOT NULL UNIQUE,
    seats           SMALLINT     NOT NULL DEFAULT 2,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- CATEGORY / MENU / VARIANTS
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    category_id     SERIAL PRIMARY KEY,
    name            VARCHAR(80)  NOT NULL UNIQUE,
    display_order   SMALLINT     NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE menu_items (
    item_id         SERIAL PRIMARY KEY,
    category_id     INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    base_price      NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    image_url       VARCHAR(255),
    is_customizable BOOLEAN NOT NULL DEFAULT TRUE,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);

CREATE TABLE option_groups (
    option_group_id SERIAL PRIMARY KEY,
    name            VARCHAR(60) NOT NULL UNIQUE,
    is_required     BOOLEAN NOT NULL DEFAULT TRUE,
    max_selectable  SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE option_values (
    option_value_id SERIAL PRIMARY KEY,
    option_group_id INTEGER NOT NULL REFERENCES option_groups(option_group_id) ON DELETE CASCADE,
    label           VARCHAR(60) NOT NULL,
    price_delta     NUMERIC(10,2) NOT NULL DEFAULT 0,
    display_order   SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE menu_item_option_groups (
    item_id         INTEGER NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
    option_group_id INTEGER NOT NULL REFERENCES option_groups(option_group_id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, option_group_id)
);

-- ---------------------------------------------------------------------
-- INVENTORY
-- ---------------------------------------------------------------------
CREATE TABLE ingredients (
    ingredient_id   SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL UNIQUE,
    unit            VARCHAR(20)  NOT NULL,
    reorder_level   NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_qty       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_items (
    item_id         INTEGER NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
    ingredient_id   INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    quantity        NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (item_id, ingredient_id)
);

CREATE TABLE stock_movements (
    movement_id     SERIAL PRIMARY KEY,
    ingredient_id   INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    change_qty      NUMERIC(10,2) NOT NULL,
    reason          VARCHAR(120) NOT NULL,
    reference_order INTEGER,
    created_by      INTEGER REFERENCES users(user_id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_stock_movements_ingredient ON stock_movements(ingredient_id);

-- ---------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    order_id        SERIAL PRIMARY KEY,
    order_number    VARCHAR(20) NOT NULL UNIQUE,
    user_id         INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    table_id        INTEGER REFERENCES store_tables(table_id),
    channel         order_channel NOT NULL DEFAULT 'WEB',
    status          order_status NOT NULL DEFAULT 'PENDING',
    subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
    queue_number    INTEGER,
    placed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ready_at        TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ
);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user   ON orders(user_id);
CREATE INDEX idx_orders_placed_at ON orders(placed_at);

CREATE TABLE order_items (
    order_item_id   SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id         INTEGER NOT NULL REFERENCES menu_items(item_id) ON DELETE RESTRICT,
    quantity        SMALLINT NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2) NOT NULL,
    line_total      NUMERIC(10,2) NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_item_options (
    order_item_id   INTEGER NOT NULL REFERENCES order_items(order_item_id) ON DELETE CASCADE,
    option_value_id INTEGER NOT NULL REFERENCES option_values(option_value_id),
    PRIMARY KEY (order_item_id, option_value_id)
);

-- ---------------------------------------------------------------------
-- AUTH
-- ---------------------------------------------------------------------
CREATE TABLE refresh_tokens (
    token_id        SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ---------------------------------------------------------------------
-- PASSWORD RESET (forgot / reset password flow)
-- ---------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    reset_token_id  SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
