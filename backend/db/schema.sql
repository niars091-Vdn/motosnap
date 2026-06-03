-- ═══════════════════════════════════════════════
--  MotoSnap — Database Schema (PostgreSQL)
--  Run: psql -U postgres -d motosnap -f schema.sql
-- ═══════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══ USERS ═══
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL DEFAULT 'Motociclista',
  avatar_url    TEXT,
  role          VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  plan          VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  is_verified   BOOLEAN DEFAULT FALSE,
  is_banned     BOOLEAN DEFAULT FALSE,
  ban_reason    TEXT,
  scan_count    INT DEFAULT 0,
  quiz_streak   INT DEFAULT 0,
  last_quiz_at  DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ═══ REFRESH TOKENS ═══
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tokens_user ON refresh_tokens(user_id);

-- ═══ USER SETTINGS ═══
CREATE TABLE user_settings (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  anthropic_key_enc   TEXT,                   -- AES-256 encrypted
  dark_mode           BOOLEAN DEFAULT FALSE,
  notif_maintenance   BOOLEAN DEFAULT TRUE,
  notif_offers        BOOLEAN DEFAULT TRUE,
  notif_news          BOOLEAN DEFAULT TRUE,
  push_token          TEXT,
  language            VARCHAR(10) DEFAULT 'it',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ SCANS ═══
CREATE TABLE scans (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  brand        VARCHAR(100),
  model        VARCHAR(200),
  year         VARCHAR(10),
  category     VARCHAR(50),
  displacement VARCHAR(30),
  confidence   INT,
  description  TEXT,
  image_hash   VARCHAR(64),       -- SHA-256 of image for caching
  tokens_used  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_scans_user    ON scans(user_id);
CREATE INDEX idx_scans_created ON scans(created_at DESC);
CREATE INDEX idx_scans_brand   ON scans(brand);

-- ═══ GARAGE (BIKES) ═══
CREATE TABLE bikes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  scan_id         UUID REFERENCES scans(id) ON DELETE SET NULL,
  brand           VARCHAR(100) NOT NULL,
  model           VARCHAR(200) NOT NULL,
  year            VARCHAR(10),
  category        VARCHAR(50),
  displacement    VARCHAR(30),
  km              INT DEFAULT 0,
  last_service_km INT DEFAULT 0,
  added_date      DATE DEFAULT CURRENT_DATE,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bikes_user ON bikes(user_id);

-- ═══ MAINTENANCE ITEMS ═══
CREATE TABLE maintenance_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bike_id     UUID REFERENCES bikes(id) ON DELETE CASCADE,
  icon        VARCHAR(10),
  name        VARCHAR(100) NOT NULL,
  interval_km INT DEFAULT 0,
  note        TEXT,
  is_ai       BOOLEAN DEFAULT FALSE,
  sort_order  SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_maint_bike ON maintenance_items(bike_id);

-- ═══ MAINTENANCE LOG ═══
CREATE TABLE maintenance_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bike_id     UUID REFERENCES bikes(id) ON DELETE CASCADE,
  item_name   VARCHAR(100),
  done_at_km  INT,
  notes       TEXT,
  cost        DECIMAL(10,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ WISHLIST ═══
CREATE TABLE wishlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id  VARCHAR(50) NOT NULL,
  product_name VARCHAR(200),
  price       DECIMAL(10,2),
  image_url   TEXT,
  shop_url    TEXT,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- ═══ COMMUNITY POSTS ═══
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  brand       VARCHAR(100),
  moto        VARCHAR(200),
  content     TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  is_pinned   BOOLEAN DEFAULT FALSE,
  is_deleted  BOOLEAN DEFAULT FALSE,
  is_flagged  BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_posts_brand   ON posts(brand);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_user    ON posts(user_id);

-- ═══ POST REPLIES ═══
CREATE TABLE replies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_replies_post ON replies(post_id);

-- ═══ POST LIKES ═══
CREATE TABLE post_likes (
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- ═══ NOTIFICATIONS ═══
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(20) CHECK (type IN ('offer', 'maint', 'news', 'system')),
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  url        TEXT,
  price      DECIMAL(10,2),
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notif_user    ON notifications(user_id);
CREATE INDEX idx_notif_created ON notifications(created_at DESC);

-- ═══ SCAN CACHE (risparmia tokens) ═══
CREATE TABLE scan_cache (
  image_hash   VARCHAR(64) PRIMARY KEY,
  result       JSONB NOT NULL,
  used_count   INT DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- ═══ API USAGE STATS ═══
CREATE TABLE api_usage (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint     VARCHAR(100),
  tokens_used  INT DEFAULT 0,
  cost_eur     DECIMAL(10,5),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_api_usage_user ON api_usage(user_id);
CREATE INDEX idx_api_usage_date ON api_usage(created_at DESC);

-- ═══ ADMIN AUDIT LOG ═══
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   UUID,
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ VIEWS UTILI ═══
CREATE OR REPLACE VIEW v_user_stats AS
SELECT
  u.id,
  u.email,
  u.name,
  u.plan,
  u.role,
  u.created_at,
  u.last_login_at,
  u.scan_count,
  COUNT(DISTINCT b.id) AS bike_count,
  COUNT(DISTINCT p.id) AS post_count,
  COALESCE(SUM(au.tokens_used), 0) AS total_tokens
FROM users u
LEFT JOIN bikes b ON b.user_id = u.id AND b.is_active = TRUE
LEFT JOIN posts p ON p.user_id = u.id AND p.is_deleted = FALSE
LEFT JOIN api_usage au ON au.user_id = u.id
GROUP BY u.id;

CREATE OR REPLACE VIEW v_daily_stats AS
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS scans,
  COUNT(DISTINCT user_id) AS active_users,
  SUM(tokens_used) AS tokens,
  ROUND(SUM(tokens_used) * 0.000003, 4) AS cost_eur
FROM scans
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- ═══ UPDATED_AT TRIGGER ═══
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bikes_updated    BEFORE UPDATE ON bikes    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated    BEFORE UPDATE ON posts    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══ ADMIN USER SEED ═══
INSERT INTO users (email, password_hash, name, role, is_verified)
VALUES (
  'admin@motosnap.app',
  crypt('Admin1234!', gen_salt('bf', 12)),
  'Admin MotoSnap',
  'admin',
  TRUE
);
INSERT INTO user_settings (user_id)
SELECT id FROM users WHERE email = 'admin@motosnap.app';

COMMENT ON TABLE users IS 'Utenti registrati';
COMMENT ON TABLE scans IS 'Storico scansioni AI';
COMMENT ON TABLE bikes IS 'Garage personale per utente';
COMMENT ON TABLE posts IS 'Post community';
COMMENT ON TABLE scan_cache IS 'Cache risultati AI per risparmiare token';
