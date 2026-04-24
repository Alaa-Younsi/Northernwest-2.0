-- Northernwest — Feature Tables (messages, newsletter, visits)
-- Run this in the Supabase SQL Editor after rls.sql

-- ── Messages (contact form) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  is_read      BOOLEAN     DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Newsletter subscriptions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT        UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Page visits (unique visitor analytics) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_visits (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id  TEXT        NOT NULL,
  page        TEXT        NOT NULL,
  visited_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE messages                ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits              ENABLE ROW LEVEL SECURITY;

-- Messages: public can insert, admins can read/update/delete
DROP POLICY IF EXISTS "messages_public_insert"  ON messages;
DROP POLICY IF EXISTS "messages_admin_select"   ON messages;
DROP POLICY IF EXISTS "messages_admin_update"   ON messages;
DROP POLICY IF EXISTS "messages_admin_delete"   ON messages;

CREATE POLICY "messages_public_insert"  ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_admin_select"   ON messages FOR SELECT  TO authenticated USING (true);
CREATE POLICY "messages_admin_update"   ON messages FOR UPDATE  TO authenticated USING (true);
CREATE POLICY "messages_admin_delete"   ON messages FOR DELETE  TO authenticated USING (true);

-- Newsletter: public can insert (subscribe), admins can read/delete
DROP POLICY IF EXISTS "newsletter_public_insert" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "newsletter_admin_select"  ON newsletter_subscriptions;
DROP POLICY IF EXISTS "newsletter_admin_delete"  ON newsletter_subscriptions;

CREATE POLICY "newsletter_public_insert" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_admin_select"  ON newsletter_subscriptions FOR SELECT  TO authenticated USING (true);
CREATE POLICY "newsletter_admin_delete"  ON newsletter_subscriptions FOR DELETE  TO authenticated USING (true);

-- Page visits: public can insert (tracking), admins can read
DROP POLICY IF EXISTS "visits_public_insert" ON page_visits;
DROP POLICY IF EXISTS "visits_admin_select"  ON page_visits;

CREATE POLICY "visits_public_insert" ON page_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "visits_admin_select"  ON page_visits FOR SELECT  TO authenticated USING (true);
