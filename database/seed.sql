-- =====================================================================
-- Sample data for Lalaland Cafe & Drink Studio
-- =====================================================================

-- Users: password_hash below is a real bcrypt hash of "Password@123" —
-- log in with any of the emails below and that password, or register a
-- fresh account via the app's Sign Up page / POST /auth/register.
INSERT INTO users (full_name, email, phone, password_hash, role) VALUES
('Aarav Admin',   'admin@lalaland.cafe',   '9990000001', '$2b$10$XKbahVEv4enwX2vvAwUCLO4Xm.qYz4N6B/k02j1sqMkOQlrJ3VZ6.', 'ADMIN'),
('Meera Manager', 'manager@lalaland.cafe', '9990000002', '$2b$10$XKbahVEv4enwX2vvAwUCLO4Xm.qYz4N6B/k02j1sqMkOQlrJ3VZ6.', 'MANAGER'),
('Ben Barista',   'barista@lalaland.cafe', '9990000003', '$2b$10$XKbahVEv4enwX2vvAwUCLO4Xm.qYz4N6B/k02j1sqMkOQlrJ3VZ6.', 'BARISTA'),
('Chloe Customer','chloe@example.com',     '9990000004', '$2b$10$XKbahVEv4enwX2vvAwUCLO4Xm.qYz4N6B/k02j1sqMkOQlrJ3VZ6.', 'CUSTOMER');

INSERT INTO store_tables (table_code, qr_token, seats) VALUES
('T-01', 'qr_tok_t01_a1b2c3', 2),
('T-02', 'qr_tok_t02_d4e5f6', 4),
('T-03', 'qr_tok_t03_g7h8i9', 4);

INSERT INTO categories (name, display_order) VALUES
('Milk Tea', 1), ('Coffee', 2), ('Matcha', 3), ('Specials', 4);

-- image_url points at /images/menu/*.jpg — served as static files from
-- frontend/public/images/menu (Vite copies public/ verbatim to the build root,
-- and serves it as-is in dev), so these resolve with zero extra configuration.
INSERT INTO menu_items (category_id, name, description, base_price, image_url, is_customizable) VALUES
(1, 'Taro Milk Tea', 'Creamy taro-flavored milk tea topped with silky cold foam', 5.25, '/images/menu/taro-milk-tea.jpg', TRUE),
(1, 'Brown Sugar Boba Milk', 'Fresh milk with handmade brown sugar pearls and caramel drizzle', 5.50, '/images/menu/brown-sugar-boba.jpg', TRUE),
(1, 'Thai Milk Tea', 'Bold Thai tea with condensed milk and a creamy top', 4.95, '/images/menu/thai-milk-tea.jpg', TRUE),
(2, 'Iced Caramel Latte', 'Double shot espresso, milk, and caramel with a cold foam top', 5.25, '/images/menu/iced-caramel-latte.jpg', TRUE),
(3, 'Matcha Cream Latte', 'Ceremonial-grade matcha with milk and a light cold foam top', 5.75, '/images/menu/matcha-cream-latte.jpg', TRUE),
(4, 'Lalaland Signature Matcha', 'Our layered matcha latte, hand-poured over milk and finished with whipped cream and matcha dust', 6.50, '/images/menu/lalaland-signature-matcha.jpg', TRUE);

INSERT INTO option_groups (name, is_required, max_selectable) VALUES
('Sweetness', TRUE, 1),
('Ice Level', TRUE, 1),
('Toppings', FALSE, 3);

INSERT INTO option_values (option_group_id, label, price_delta, display_order) VALUES
(1, '0% Sugar', 0, 1), (1, '30% Sugar', 0, 2), (1, '50% Sugar', 0, 3),
(1, '70% Sugar', 0, 4), (1, '100% Sugar', 0, 5),
(2, 'No Ice', 0, 1), (2, 'Less Ice', 0, 2), (2, 'Normal Ice', 0, 3), (2, 'Extra Ice', 0, 4),
(3, 'Boba Pearls', 0.75, 1), (3, 'Grass Jelly', 0.75, 2), (3, 'Pudding', 0.75, 3), (3, 'Cheese Foam', 1.00, 4);

INSERT INTO menu_item_option_groups (item_id, option_group_id)
SELECT item_id, og.option_group_id FROM menu_items, option_groups og
WHERE og.name IN ('Sweetness', 'Ice Level', 'Toppings');

INSERT INTO ingredients (name, unit, reorder_level, stock_qty) VALUES
('Fresh Milk', 'ml', 3000, 15000),
('Brown Sugar Syrup', 'ml', 500, 3000),
('Tapioca Pearls', 'g', 1000, 5000),
('Espresso Beans', 'g', 500, 4000),
('Caramel Syrup', 'ml', 500, 2500),
('Taro Powder', 'g', 300, 2000),
('Thai Tea Base', 'ml', 1000, 6000),
('Condensed Milk', 'ml', 500, 2500),
('Matcha Powder', 'g', 300, 1800),
('Whipped Cream', 'ml', 500, 2000);

-- Recipe: how much of each ingredient a single unit of each drink consumes.
-- This is what makes stock checks/decrements in OrderService.placeOrder real
-- instead of a no-op — every seeded item now has a recipe.
INSERT INTO recipe_items (item_id, ingredient_id, quantity)
SELECT mi.item_id, ing.ingredient_id, r.quantity
FROM (VALUES
  ('Taro Milk Tea',              'Taro Powder',    15),
  ('Taro Milk Tea',              'Fresh Milk',      200),
  ('Brown Sugar Boba Milk',      'Fresh Milk',      200),
  ('Brown Sugar Boba Milk',      'Brown Sugar Syrup', 30),
  ('Brown Sugar Boba Milk',      'Tapioca Pearls',  50),
  ('Thai Milk Tea',              'Thai Tea Base',   150),
  ('Thai Milk Tea',              'Condensed Milk',  40),
  ('Iced Caramel Latte',         'Espresso Beans',  18),
  ('Iced Caramel Latte',         'Fresh Milk',      180),
  ('Iced Caramel Latte',         'Caramel Syrup',   20),
  ('Matcha Cream Latte',         'Matcha Powder',   8),
  ('Matcha Cream Latte',         'Fresh Milk',      200),
  ('Lalaland Signature Matcha',  'Matcha Powder',   10),
  ('Lalaland Signature Matcha',  'Fresh Milk',      180),
  ('Lalaland Signature Matcha',  'Whipped Cream',   40)
) AS r(item_name, ingredient_name, quantity)
JOIN menu_items mi ON mi.name = r.item_name
JOIN ingredients ing ON ing.name = r.ingredient_name;
