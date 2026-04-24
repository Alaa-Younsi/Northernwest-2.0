-- Northernwest — Row Level Security Policies
-- Run this ONCE in the Supabase SQL editor AFTER running schema.sql and seed.sql
-- These policies allow the frontend to call Supabase directly without a server layer.
-- Safe to re-run: drops existing policies before recreating them.

-- ── Enable RLS on all tables ──────────────────────────────────────────────────
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;

-- ── categories ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "categories_public_read"   ON categories;
DROP POLICY IF EXISTS "categories_admin_insert"  ON categories;
DROP POLICY IF EXISTS "categories_admin_update"  ON categories;
DROP POLICY IF EXISTS "categories_admin_delete"  ON categories;

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_insert"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "categories_admin_update"
  ON categories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "categories_admin_delete"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- ── products ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_public_read"   ON products;
DROP POLICY IF EXISTS "products_admin_insert"  ON products;
DROP POLICY IF EXISTS "products_admin_update"  ON products;
DROP POLICY IF EXISTS "products_admin_delete"  ON products;

CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "products_admin_insert"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_admin_update"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "products_admin_delete"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ── product_variants ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "variants_public_read"   ON product_variants;
DROP POLICY IF EXISTS "variants_admin_insert"  ON product_variants;
DROP POLICY IF EXISTS "variants_admin_update"  ON product_variants;
DROP POLICY IF EXISTS "variants_admin_delete"  ON product_variants;

CREATE POLICY "variants_public_read"
  ON product_variants FOR SELECT
  USING (true);

CREATE POLICY "variants_admin_insert"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "variants_admin_update"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "variants_admin_delete"
  ON product_variants FOR DELETE
  TO authenticated
  USING (true);

-- ── orders ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orders_public_insert"  ON orders;
DROP POLICY IF EXISTS "orders_admin_select"   ON orders;
DROP POLICY IF EXISTS "orders_admin_update"   ON orders;

CREATE POLICY "orders_public_insert"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_admin_select"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

-- ── order_items ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "order_items_public_insert" ON order_items;
DROP POLICY IF EXISTS "order_items_admin_select"  ON order_items;

CREATE POLICY "order_items_public_insert"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_admin_select"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

